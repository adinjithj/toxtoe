import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { slugify, validateProductInput } from "@/lib/seller-products";

export async function POST(request: Request) {
  // 1. Require an authenticated session (Phase 5 TODO: enforce SELLER role).
  const session = await auth();
  const sellerId = session?.user?.id;

  if (!sellerId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Parse request body
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  // 3. Validate + normalize (shares logic with the edit route).
  const parsed = validateProductInput(body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  const { title, description, priceCents, fileType, thumbnailUrl, deliveryUrl } =
    parsed.data;

  // 4. Generate a unique slug from the title (slug column is unique).
  const baseSlug = slugify(title);
  let slug = baseSlug;
  let attempt = 2;
  while (await prisma.product.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${attempt++}`;
  }

  // 5. Create the product. Only string URLs are stored (Digital Broker model).
  const product = await prisma.product.create({
    data: {
      slug,
      title,
      description,
      price: priceCents,
      fileType,
      thumbnail_url: thumbnailUrl,
      delivery_url: deliveryUrl,
      sellerId,
      isPublished: true,
    },
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      price: true,
      fileType: true,
      thumbnail_url: true,
      isPublished: true,
      createdAt: true,
    },
  });

  // 6. Invalidate the homepage cache so the new asset appears immediately.
  revalidatePath("/");

  return NextResponse.json({ ok: true, product }, { status: 201 });
}
