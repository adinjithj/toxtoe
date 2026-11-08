import Image from "next/image";
import Link from "next/link";

export interface ProductCardProps {
  id?: string;
  title: string;
  price: number; // Integer in cents (e.g., 1800 -> $18.00)
  thumbnail_url?: string;
  thumbnailUrl?: string; // Support camelCase alias
  fileType?: "TOX" | "TOE" | "BOTH" | string;
  category?: string;
  creatorName?: string;
  isOwned?: boolean; // Buyer already owns this asset
}

const FILE_TYPE_META: Record<string, { label: string; dot: string }> = {
  TOX: { label: ".tox", dot: "bg-[#10b981]" },
  TOE: { label: ".toe", dot: "bg-[#06b6d4]" },
  BOTH: { label: ".tox/.toe", dot: "bg-[#a855f7]" },
};

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
  id,
  title,
  price,
  thumbnail_url,
  thumbnailUrl,
  fileType = "TOX",
  category,
  creatorName,
  isOwned = false,
}: ProductCardProps) {
  const imageSrc = thumbnail_url || thumbnailUrl || "/placeholder-tox.jpg";
  const meta = FILE_TYPE_META[fileType] ?? FILE_TYPE_META.TOX;
  const href = id ? `/product/${id}` : undefined;

  const thumbnail = (
    <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#0f1219]">
      <Image
        src={imageSrc}
        alt={title}
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        className="object-cover"
      />

      {/* Quiet edge blend into the card surface */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#11141c] via-transparent to-transparent opacity-60" />

      {/* File-type indicator: operator dot + mono label */}
      <div className="absolute left-3 top-3 flex items-center gap-2">
        <span className="flex items-center gap-1.5 rounded-md border border-white/[0.08] bg-[#07080d]/70 px-2 py-1 font-mono text-[11px] text-[#a3a9b8]">
          <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
          {meta.label}
        </span>
        {category && (
          <span className="rounded-md border border-white/[0.08] bg-[#07080d]/70 px-2 py-1 font-mono text-[11px] text-[#7a8296]">
            {category}
          </span>
        )}
      </div>

      {/* Owned badge: subtle dark chip, top-right */}
      {isOwned && (
        <span className="absolute right-3 top-3 flex items-center gap-1.5 rounded-md border border-emerald-400/25 bg-[#07080d]/80 px-2 py-1 font-mono text-[11px] text-[#10b981]">
          <svg
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.75}
            className="h-3 w-3"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.5 8.5l3.5 3.5 7.5-8"
            />
          </svg>
          Owned
        </span>
      )}
    </div>
  );

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-white/[0.08] bg-[#11141c] transition-colors duration-150 hover:border-white/[0.16]">
      {href ? (
        <Link href={href} aria-label={title} className="focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#10b981]">
          {thumbnail}
        </Link>
      ) : (
        thumbnail
      )}

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        {creatorName && (
          <p className="font-mono text-xs text-[#7a8296]">
            by <span className="text-[#a3a9b8]">{creatorName}</span>
          </p>
        )}

        {href ? (
          <Link
            href={href}
            className="mt-1 text-[15px] font-medium leading-snug text-[#eef0f5] transition-colors hover:text-[#10b981] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#10b981]"
          >
            {title}
          </Link>
        ) : (
          <h3 className="mt-1 text-[15px] font-medium leading-snug text-[#eef0f5]">
            {title}
          </h3>
        )}

        <div className="mt-4 flex items-center justify-between border-t border-white/[0.06] pt-4">
          <div>
            <span className="block font-mono text-[11px] text-[#7a8296]">
              Price
            </span>
            <span className="mt-0.5 block text-lg font-medium tabular-nums text-[#eef0f5]">
              {formatPrice(price)}
            </span>
          </div>

          {href ? (
            <Link
              href={href}
              className="flex h-9 items-center gap-1.5 rounded-lg border border-white/[0.12] bg-[#1a1e28] px-3.5 text-[13px] font-medium text-[#a3a9b8] transition-colors duration-150 hover:border-white/[0.24] hover:text-[#eef0f5] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#10b981]"
            >
              <span>View</span>
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          ) : (
            <button
              type="button"
              className="flex h-9 items-center gap-1.5 rounded-lg border border-white/[0.12] bg-[#1a1e28] px-3.5 text-[13px] font-medium text-[#a3a9b8] transition-colors duration-150 hover:border-white/[0.24] hover:text-[#eef0f5] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#10b981]"
            >
              <span>View</span>
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
