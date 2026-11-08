import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const FILE_TYPES = ["TOX", "TOE", "BOTH"] as const;
type FileType = (typeof FILE_TYPES)[number];

function isValidHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function slugify(title: string): string {
  return (
    title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "product"
  );
}

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

  // 3. Validate + normalize fields
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const description =
    typeof body.description === "string" ? body.description.trim() : "";
  const rawPrice = typeof body.price === "string" ? body.price.trim() : body.price;
  const priceUsd = rawPrice === "" ? NaN : Number(rawPrice);
  const fileType = (typeof body.fileType === "string" ? body.fileType : "") as FileType;
  const thumbnailUrl = typeof body.thumbnailUrl === "string" ? body.thumbnailUrl.trim() : "";
  const deliveryUrl = typeof body.deliveryUrl === "string" ? body.deliveryUrl.trim() : "";

  if (!title) {
    return NextResponse.json({ error: "Title is required." }, { status: 400 });
  }
  if (title.length > 120) {
    return NextResponse.json(
      { error: "Title must be 120 characters or fewer." },
      { status: 400 }
    );
  }
  if (!Number.isFinite(priceUsd) || priceUsd < 0 || priceUsd > 100000) {
    return NextResponse.json(
      { error: "Price must be a valid USD amount." },
      { status: 400 }
    );
  }
  if (!FILE_TYPES.includes(fileType)) {
    return NextResponse.json(
      { error: "File type must be TOX, TOE, or BOTH." },
      { status: 400 }
    );
  }
  if (!isValidHttpUrl(thumbnailUrl)) {
    return NextResponse.json(
      { error: "Thumbnail URL must be a valid http(s) URL." },
      { status: 400 }
    );
  }
  if (!isValidHttpUrl(deliveryUrl)) {
    return NextResponse.json(
      { error: "Delivery URL must be a valid http(s) URL." },
      { status: 400 }
    );
  }

  // 4. Convert USD → integer cents
  const priceCents = Math.round(priceUsd * 100);

  // 5. Generate a unique slug from the title (slug column is unique).
  const baseSlug = slugify(title);
  let slug = baseSlug;
  let attempt = 2;
  while (await prisma.product.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${attempt++}`;
  }

  // 6. Create the product. Only string URLs are stored (Digital Broker model).
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

  // 7. Invalidate the homepage cache so the new asset appears immediately.
  revalidatePath("/");

  return NextResponse.json({ ok: true, product }, { status: 201 });
}
