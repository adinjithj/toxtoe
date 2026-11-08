import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { slugify, validateProductInput } from "@/lib/seller-products";

type RouteContext = { params: Promise<{ id: string }> };

const PRODUCT_SELECT = {
  id: true,
  slug: true,
  title: true,
  description: true,
  price: true,
  fileType: true,
  thumbnail_url: true,
  delivery_url: true,
  isPublished: true,
  createdAt: true,
} as const;

// SECURITY: every mutation below verifies the product belongs to the
// authenticated seller (WHERE id AND sellerId) before touching the row.
async function requireOwnedProduct(userId: string, productId: string) {
  return prisma.product.findFirst({
    where: { id: productId, sellerId: userId },
    select: { id: true, isPublished: true },
  });
}

function revalidateSellerViews() {
  revalidatePath("/");
  revalidatePath("/seller");
}

export async function PUT(request: Request, { params }: RouteContext) {
  // 1. Require an authenticated session
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Ownership check — must be the seller's own product
  const { id } = await params;
  const owned = await requireOwnedProduct(userId, id);
  if (!owned) {
    return NextResponse.json({ error: "Product not found." }, { status: 404 });
  }

  // 3. Parse + validate body (re-runs USD → cents conversion)
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = validateProductInput(body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  const { title, description, priceCents, fileType, thumbnailUrl, deliveryUrl } =
    parsed.data;

  // 4. Regenerate slug from the title, avoiding collisions with other products
  const baseSlug = slugify(title);
  let slug = baseSlug;
  let attempt = 2;
  while (true) {
    const clash = await prisma.product.findFirst({
      where: { slug, NOT: { id } },
      select: { id: true },
    });
    if (!clash) break;
    slug = `${baseSlug}-${attempt++}`;
  }

  // 5. Update the product
  const product = await prisma.product.update({
    where: { id },
    data: {
      slug,
      title,
      description,
      price: priceCents,
      fileType,
      thumbnail_url: thumbnailUrl,
      delivery_url: deliveryUrl,
    },
    select: PRODUCT_SELECT,
  });

  revalidateSellerViews();

  return NextResponse.json({ ok: true, product });
}

export async function PATCH(request: Request, { params }: RouteContext) {
  // Used for the publish/unpublish toggle on the seller dashboard.
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const owned = await requireOwnedProduct(userId, id);
  if (!owned) {
    return NextResponse.json({ error: "Product not found." }, { status: 404 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (typeof body.isPublished !== "boolean") {
    return NextResponse.json(
      { error: "Missing boolean `isPublished` in request body." },
      { status: 400 }
    );
  }

  const product = await prisma.product.update({
    where: { id },
    data: { isPublished: body.isPublished },
    select: PRODUCT_SELECT,
  });

  revalidateSellerViews();

  return NextResponse.json({ ok: true, product });
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const owned = await requireOwnedProduct(userId, id);
  if (!owned) {
    return NextResponse.json({ error: "Product not found." }, { status: 404 });
  }

  await prisma.product.delete({ where: { id } });

  revalidateSellerViews();

  return NextResponse.json({ ok: true });
}
