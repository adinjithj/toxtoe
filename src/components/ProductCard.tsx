import React from "react";
import Image from "next/image";

export interface ProductCardProps {
  id?: string;
  title: string;
  price: number; // Integer in cents (e.g., 1800 -> $18.00)
  thumbnail_url?: string;
  thumbnailUrl?: string; // Support camelCase alias
  fileType?: "TOX" | "TOE" | "BOTH" | string;
  category?: string;
  creatorName?: string;
}

/**
 * Formats integer cents into standard USD currency string.
 * Example: 1800 -> "$18.00"
 */
export function formatPrice(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export default function ProductCard({
  title,
  price,
  thumbnail_url,
  thumbnailUrl,
  fileType = "TOX",
  category,
  creatorName,
}: ProductCardProps) {
  const imageSrc = thumbnail_url || thumbnailUrl || "/placeholder-tox.jpg";
  const formattedPrice = formatPrice(price);

  // TouchDesigner specific file-type styling
  const fileBadgeStyle =
    fileType === "TOX"
      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
      : fileType === "TOE"
      ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/30"
      : "bg-purple-500/10 text-purple-400 border-purple-500/30";

  return (
    <div className="group relative flex flex-col rounded-xl border border-zinc-800/80 bg-zinc-900/40 backdrop-blur-sm overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/40 hover:shadow-[0_0_28px_rgba(16,185,129,0.12)]">
      {/* Thumbnail Container */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-zinc-950">
        <Image
          src={imageSrc}
          alt={title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />

        {/* Ambient Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

        {/* File Type Badge (TouchDesigner Operator/Network indicator) */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <span
            className={`rounded-md border px-2 py-0.5 font-mono text-[11px] font-bold tracking-wider uppercase backdrop-blur-md ${fileBadgeStyle}`}
          >
            .{fileType.toLowerCase()}
          </span>
          {category && (
            <span className="rounded-md border border-zinc-800 bg-zinc-950/70 px-2 py-0.5 text-[11px] text-zinc-400 backdrop-blur-md">
              {category}
            </span>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex flex-1 flex-col justify-between p-4 sm:p-5">
        <div>
          {creatorName && (
            <p className="mb-1 text-xs font-mono text-zinc-500">
              by <span className="text-zinc-400 hover:text-zinc-300">{creatorName}</span>
            </p>
          )}
          <h3 className="text-base font-semibold text-zinc-100 group-hover:text-emerald-400 transition-colors line-clamp-1">
            {title}
          </h3>
        </div>

        {/* Price & Action Row */}
        <div className="mt-4 flex items-center justify-between border-t border-zinc-800/60 pt-3">
          <div className="flex flex-col">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
              Price
            </span>
            <span className="font-mono text-lg font-bold text-zinc-50">
              {formattedPrice}
            </span>
          </div>

          <button
            type="button"
            className="flex items-center gap-1 rounded-lg border border-zinc-700/80 bg-zinc-800/50 px-3 py-1.5 text-xs font-medium text-zinc-200 transition-all duration-200 hover:border-emerald-500/60 hover:bg-emerald-500/10 hover:text-emerald-300"
          >
            <span>View</span>
            <svg
              className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
