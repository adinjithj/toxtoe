// Shared helpers for seller product creation/editing.
// Keeps validation + USD→cents conversion consistent across API routes.

export const FILE_TYPES = ["TOX", "TOE", "BOTH"] as const;
export type FileType = (typeof FILE_TYPES)[number];

export function isValidHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function slugify(title: string): string {
  return (
    title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "product"
  );
}

export interface ProductInputData {
  title: string;
  description: string;
  priceCents: number; // Integer cents
  fileType: FileType;
  thumbnailUrl: string;
  deliveryUrl: string;
}

export type ProductInputResult =
  | { ok: true; data: ProductInputData }
  | { ok: false; error: string };

export function validateProductInput(
  body: Record<string, unknown>
): ProductInputResult {
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const description =
    typeof body.description === "string" ? body.description.trim() : "";
  const rawPrice = typeof body.price === "string" ? body.price.trim() : body.price;
  const priceUsd = rawPrice === "" ? NaN : Number(rawPrice);
  const fileType = typeof body.fileType === "string" ? body.fileType : "";
  const thumbnailUrl =
    typeof body.thumbnailUrl === "string" ? body.thumbnailUrl.trim() : "";
  const deliveryUrl =
    typeof body.deliveryUrl === "string" ? body.deliveryUrl.trim() : "";

  if (!title) {
    return { ok: false, error: "Title is required." };
  }
  if (title.length > 120) {
    return { ok: false, error: "Title must be 120 characters or fewer." };
  }
  if (!Number.isFinite(priceUsd) || priceUsd < 0 || priceUsd > 100000) {
    return { ok: false, error: "Price must be a valid USD amount." };
  }
  if (!FILE_TYPES.includes(fileType as FileType)) {
    return { ok: false, error: "File type must be TOX, TOE, or BOTH." };
  }
  if (!isValidHttpUrl(thumbnailUrl)) {
    return { ok: false, error: "Thumbnail URL must be a valid http(s) URL." };
  }
  if (!isValidHttpUrl(deliveryUrl)) {
    return { ok: false, error: "Delivery URL must be a valid http(s) URL." };
  }

  return {
    ok: true,
    data: {
      title,
      description,
      priceCents: Math.round(priceUsd * 100),
      fileType: fileType as FileType,
      thumbnailUrl,
      deliveryUrl,
    },
  };
}
