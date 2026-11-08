import { Suspense } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import Link from "next/link";
import Image from "next/image";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/components/ProductCard";

const FILE_TYPE_LABEL: Record<string, string> = {
  TOX: ".tox",
  TOE: ".toe",
  BOTH: ".tox/.toe",
};

// SECURITY: explicit `select` whitelist. `delivery_url` is only fetched here
// because this page is authenticated AND scoped to the seller's own products.
async function SellerContent() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    // Phase 5 TODO: restrict to `role === "SELLER"` once roles are enforced.
    redirect("/login?callbackUrl=/seller");
  }

  // Opt into request-time rendering (Cache Components) for this DB read.
  await connection();

  const products = await prisma.product.findMany({
    where: { sellerId: userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      price: true,
      thumbnail_url: true,
      fileType: true,
      isPublished: true,
      createdAt: true,
      delivery_url: true,
    },
  });

  const sellerName = session.user.name ?? session.user.email ?? "Seller";

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-6 border-b border-white/[0.08] pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-xs text-[#7a8296]">Seller Portal</p>
          <h1 className="mt-2 text-2xl font-medium text-[#eef0f5] sm:text-3xl">
            Your assets
          </h1>
          <p className="mt-2 text-sm text-[#a3a9b8]">
            {sellerName} · {products.length} product
            {products.length === 1 ? "" : "s"}
          </p>
        </div>

        <Link
          href="/seller/new"
          className="inline-flex h-11 items-center gap-2 rounded-lg bg-[#eef0f5] px-5 text-sm font-medium text-[#0b0d14] transition-colors hover:bg-white"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
          </svg>
          Create New Asset
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="mt-12 flex flex-col items-start gap-4 rounded-2xl border border-white/[0.08] bg-[#11141c] p-8">
          <p className="text-[15px] text-[#a3a9b8]">
            You haven&apos;t created any assets yet.
          </p>
          <Link
            href="/seller/new"
            className="inline-flex h-10 items-center rounded-lg bg-[#eef0f5] px-5 text-sm font-medium text-[#0b0d14] transition-colors hover:bg-white"
          >
            Create your first asset
          </Link>
        </div>
      ) : (
        <ul className="mt-8 flex flex-col gap-4">
          {products.map((product) => (
            <li
              key={product.id}
              className="flex flex-col gap-5 rounded-2xl border border-white/[0.08] bg-[#11141c] p-5 sm:flex-row sm:items-center"
            >
              <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden rounded-xl bg-[#0f1219] sm:w-44">
                <Image
                  src={product.thumbnail_url}
                  alt={product.title}
                  fill
                  sizes="(max-width: 640px) 100vw, 176px"
                  className="object-cover"
                />
              </div>

              <div className="flex flex-1 flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      product.isPublished ? "bg-[#10b981]" : "bg-[#7a8296]"
                    }`}
                  />
                  <span className="font-mono text-[11px] text-[#7a8296]">
                    {product.isPublished ? "Published" : "Unpublished"}
                  </span>
                  <span className="font-mono text-[11px] text-[#7a8296]">
                    · {FILE_TYPE_LABEL[product.fileType] ?? product.fileType}
                  </span>
                </div>

                <h2 className="text-[15px] font-medium text-[#eef0f5]">
                  {product.title}
                </h2>
                <p className="font-mono text-xs text-[#a3a9b8]">
                  {formatPrice(product.price)} · created{" "}
                  {new Date(product.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>

              <a
                href={product.delivery_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-10 shrink-0 items-center gap-2 rounded-lg border border-white/[0.12] bg-[#1a1e28] px-4 text-[13px] font-medium text-[#a3a9b8] transition-colors hover:border-white/[0.24] hover:text-[#eef0f5]"
              >
                Open share link
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
                    d="M14 5l7 7-7 7M3 12h18"
                  />
                </svg>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function SellerPage() {
  return (
    <div className="min-h-screen bg-[#0b0d14] text-[#eef0f5]">
      <Suspense
        fallback={
          <div className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="h-3 w-24 rounded bg-[#1a1e28]" />
            <div className="mt-3 h-8 w-40 rounded bg-[#1a1e28]" />
            <div className="mt-8 flex flex-col gap-4">
              {Array.from({ length: 2 }).map((_, i) => (
                <div
                  key={i}
                  className="h-28 rounded-2xl border border-white/[0.08] bg-[#11141c]"
                />
              ))}
            </div>
          </div>
        }
      >
        <SellerContent />
      </Suspense>
    </div>
  );
}
