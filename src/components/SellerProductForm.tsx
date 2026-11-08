"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const FILE_TYPES = [
  { value: "TOX", label: ".tox · Component" },
  { value: "TOE", label: ".toe · Project" },
  { value: "BOTH", label: ".tox/.toe · Bundle" },
];

const INPUT_CLASSES =
  "h-11 rounded-lg border border-white/[0.12] bg-[#0f1219] px-4 text-sm text-[#eef0f5] placeholder:text-[#7a8296] focus:border-white/[0.24] focus:outline-none";
const TEXTAREA_CLASSES =
  "rounded-lg border border-white/[0.12] bg-[#0f1219] px-4 py-3 text-sm text-[#eef0f5] placeholder:text-[#7a8296] focus:border-white/[0.24] focus:outline-none";

export interface SellerProductInitialData {
  title: string;
  description: string;
  priceCents: number;
  fileType: string;
  thumbnailUrl: string;
  deliveryUrl: string;
}

type SellerProductFormProps = {
  mode?: "create" | "edit";
  productId?: string;
  initial?: SellerProductInitialData;
};

export default function SellerProductForm({
  mode = "create",
  productId,
  initial,
}: SellerProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const payload = {
      title: String(formData.get("title") ?? ""),
      description: String(formData.get("description") ?? ""),
      price: String(formData.get("price") ?? ""),
      fileType: String(formData.get("fileType") ?? "TOX"),
      thumbnailUrl: String(formData.get("thumbnailUrl") ?? ""),
      deliveryUrl: String(formData.get("deliveryUrl") ?? ""),
    };

    const isEdit = mode === "edit" && productId;
    const endpoint = isEdit ? `/api/seller/products/${productId}` : "/api/seller/products";
    const method = isEdit ? "PUT" : "POST";

    try {
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
      };

      if (!res.ok) {
        if (res.status === 401) {
          router.push(`/login?callbackUrl=${isEdit ? `/seller/edit/${productId}` : "/seller/new"}`);
          return;
        }
        throw new Error(data.error ?? `Could not ${isEdit ? "update" : "create"} asset`);
      }

      // Land on the seller dashboard so the updated list is visible.
      router.push("/seller");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : `Could not ${isEdit ? "update" : "create"} asset`
      );
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-6">
      {/* Title */}
      <div className="flex flex-col gap-2">
        <label htmlFor="title" className="font-mono text-xs text-[#a3a9b8]">
          Title
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          maxLength={120}
          defaultValue={initial?.title}
          placeholder="e.g. Neon Glitch Shader"
          className={INPUT_CLASSES}
        />
      </div>

      {/* Description */}
      <div className="flex flex-col gap-2">
        <label htmlFor="description" className="font-mono text-xs text-[#a3a9b8]">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          maxLength={2000}
          defaultValue={initial?.description}
          placeholder="What does this asset do? What is included?"
          className={TEXTAREA_CLASSES}
        />
      </div>

      {/* Price */}
      <div className="flex flex-col gap-2">
        <label htmlFor="price" className="font-mono text-xs text-[#a3a9b8]">
          Price (USD)
        </label>
        <div className="relative">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-mono text-sm text-[#7a8296]">
            $
          </span>
          <input
            id="price"
            name="price"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            required
            defaultValue={
              initial ? (initial.priceCents / 100).toFixed(2) : "15.00"
            }
            className={`${INPUT_CLASSES} w-full pl-8`}
          />
        </div>
      </div>

      {/* File type */}
      <fieldset>
        <legend className="font-mono text-xs text-[#a3a9b8]">File Type</legend>
        <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
          {FILE_TYPES.map((fileType) => (
            <label key={fileType.value} className="cursor-pointer">
              <input
                type="radio"
                name="fileType"
                value={fileType.value}
                defaultChecked={
                  fileType.value === (initial?.fileType ?? "TOX")
                }
                className="peer sr-only"
              />
              <span className="block rounded-lg border border-white/[0.12] bg-[#0f1219] px-4 py-3 text-sm text-[#a3a9b8] transition-colors peer-checked:border-emerald-400/40 peer-checked:text-[#eef0f5] peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[#10b981]">
                {fileType.label}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {/* Thumbnail URL */}
      <div className="flex flex-col gap-2">
        <label htmlFor="thumbnailUrl" className="font-mono text-xs text-[#a3a9b8]">
          Thumbnail URL
        </label>
        <input
          id="thumbnailUrl"
          name="thumbnailUrl"
          type="url"
          required
          defaultValue={initial?.thumbnailUrl}
          placeholder="https://… (public image link)"
          className={INPUT_CLASSES}
        />
      </div>

      {/* Delivery URL */}
      <div className="flex flex-col gap-2">
        <label htmlFor="deliveryUrl" className="font-mono text-xs text-[#a3a9b8]">
          Delivery URL
        </label>
        <input
          id="deliveryUrl"
          name="deliveryUrl"
          type="url"
          required
          defaultValue={initial?.deliveryUrl}
          placeholder="https://drive.google.com/…"
          className={INPUT_CLASSES}
        />
        <p className="rounded-lg border border-white/[0.06] bg-[#0f1219] px-4 py-3 text-[13px] italic leading-relaxed text-[#7a8296]">
          Upload your .tox or .zip file to a secure cloud drive (Google Drive,
          Mega, MediaFire) and paste the shareable public link below. Ensure the
          link is set to &ldquo;Anyone with the link can view&rdquo;.
        </p>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="mt-2 flex items-center gap-3">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-11 items-center justify-center rounded-lg bg-[#eef0f5] px-6 text-sm font-medium text-[#0b0d14] transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading
            ? mode === "edit"
              ? "Saving…"
              : "Creating asset…"
            : mode === "edit"
              ? "Save changes"
              : "Create asset"}
        </button>
        <Link
          href="/seller"
          className="inline-flex h-11 items-center rounded-lg px-4 text-sm text-[#a3a9b8] transition-colors hover:text-[#eef0f5]"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
