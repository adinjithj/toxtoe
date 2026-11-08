import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  // 1. Require an authenticated session
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Validate request body
  let productId: string;
  try {
    const body = (await request.json()) as { productId?: unknown };
    if (typeof body.productId !== "string" || body.productId.length === 0) {
      throw new Error("missing productId");
    }
    productId = body.productId;
  } catch {
    return NextResponse.json(
      { error: "Invalid request body. Expected { productId: string }." },
      { status: 400 }
    );
  }

  // 3. Verify the product exists (safe select — no delivery_url needed here)
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true, isPublished: true, price: true },
  });

  if (!product || !product.isPublished) {
    return NextResponse.json({ error: "Product not found." }, { status: 404 });
  }

  // 4. Strict safeguard: reject re-claiming an asset the user already owns.
  const existingPurchase = await prisma.purchase.findUnique({
    where: {
      user_product_purchase: {
        userId,
        productId,
      },
    },
    select: { status: true },
  });

  if (existingPurchase?.status === "COMPLETED") {
    return NextResponse.json(
      { error: "You already own this asset." },
      { status: 400 }
    );
  }

  // 5. Create (or confirm) a COMPLETED purchase for this user + product.
  //    The unique (user_id, product_id) constraint makes this idempotent.
  const purchase = await prisma.purchase.upsert({
    where: {
      user_product_purchase: {
        userId,
        productId,
      },
    },
    update: {
      status: "COMPLETED",
    },
    create: {
      userId,
      productId,
      amountPaid: product.price,
      currency: "usd",
      status: "COMPLETED",
    },
    select: {
      id: true,
      status: true,
    },
  });

  return NextResponse.json({ ok: true, purchase });
}
