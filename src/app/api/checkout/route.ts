import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

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

  // 3. Load the published product (safe select — no delivery_url here)
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true, title: true, price: true, isPublished: true },
  });

  if (!product || !product.isPublished) {
    return NextResponse.json({ error: "Product not found." }, { status: 404 });
  }

  // 4. Reject if the buyer already owns this asset
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

  // 5. Create a Stripe Checkout Session. The productId + userId travel in the
  //    session metadata so the webhook can record the completed purchase.
  const stripe = getStripe();
  const checkout = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: product.price, // integer cents
          product_data: { name: product.title },
        },
      },
    ],
    metadata: {
      productId: product.id,
      userId,
    },
    customer_email: session.user.email ?? undefined,
    success_url: `${APP_URL}/dashboard?success=true`,
    cancel_url: `${APP_URL}/product/${product.id}`,
  });

  if (!checkout.url) {
    return NextResponse.json(
      { error: "Could not start checkout." },
      { status: 500 }
    );
  }

  return NextResponse.json({ url: checkout.url });
}
