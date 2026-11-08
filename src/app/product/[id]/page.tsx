import { Suspense } from "react";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import Image from "next/image";
import Link from "next/link";
import BuyButton from "@/components/BuyButton";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/components/ProductCard";

// SECURITY: explicit `select` whitelist — `delivery_url` is NEVER queried here.
// Delivery links are only released after purchase verification (Phase 4 gateway).
async function ProductDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Opt into request-time rendering (Cache Components) for this DB read.
  await connection();

  const [session, product] = await Promise.all([
    auth(),
    prisma.product.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        description: true,
        price: true,
        thumbnail_url: true,
        fileType: true,
        seller: { select: { name: true } },
      },
    }),
  ]);

  if (!product) {
    notFound();
  }

  // Does the authenticated user already own this asset? If so, the page
  // shows an "Already Owned" state instead of the claim button.
  let isOwned = false;
  if (session?.user?.id) {
    const purchase = await prisma.purchase.findUnique({
      where: {
        user_product_purchase: {
          userId: session.user.id,
          productId: product.id,
        },
      },
      select: { status: true },
    });
    isOwned = purchase?.status === "COMPLETED";
  }

  const fileTypeLabel =
    product.fileType === "TOX" ? ".tox" : product.fileType === "TOE" ? ".toe" : ".tox/.toe";

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
        {/* Enlarged thumbnail */}
        <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-white/[0.08] bg-[#11141c]">
          <Image
            src={product.thumbnail_url}
            alt={product.title}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
        </div>

        {/* Details */}
        <div className="flex flex-col">
          <p className="font-mono text-xs text-[#7a8296]">Product</p>
          <h1 className="mt-2 text-3xl font-medium leading-tight text-[#eef0f5] sm:text-4xl">
            {product.title}
          </h1>

          {product.seller?.name && (
            <p className="mt-2 font-mono text-xs text-[#7a8296]">
              by <span className="text-[#a3a9b8]">{product.seller.name}</span>
            </p>
          )}

          <p className="mt-6 text-[15px] leading-relaxed text-[#a3a9b8]">
            {product.description}
          </p>

          <div className="mt-8 flex items-center justify-between border-t border-white/[0.08] pt-6">
            <div>
              <span className="block font-mono text-[11px] text-[#7a8296]">
                Price
              </span>
              <span className="mt-1 block text-2xl font-medium tabular-nums text-[#eef0f5]">
                {formatPrice(product.price)}
              </span>
            </div>
            <span className="flex items-center gap-1.5 rounded-md border border-white/[0.08] bg-[#07080d]/70 px-2.5 py-1.5 font-mono text-xs text-[#a3a9b8]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#10b981]" />
              {fileTypeLabel}
            </span>
          </div>

          <div className="mt-8">
            {isOwned ? (
              <Link
                href="/dashboard"
                className="inline-flex h-12 items-center gap-2.5 rounded-lg border border-white/[0.12] bg-[#1a1e28] px-7 text-sm font-medium text-[#a3a9b8] transition-colors hover:border-white/[0.24] hover:text-[#eef0f5] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#10b981]"
              >
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
                Already Owned - Go to Dashboard
              </Link>
            ) : (
              <BuyButton productId={product.id} />
            )}
          </div>

          {isOwned ? (
            <p className="mt-4 font-mono text-[11px] leading-relaxed text-[#7a8296]">
              This asset is already in your library. Your delivery link is on
              your dashboard.
            </p>
          ) : (
            <p className="mt-4 font-mono text-[11px] leading-relaxed text-[#7a8296]">
              Checkout is powered by Stripe. After payment, your delivery link
              appears on your dashboard.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-2">
            <div className="aspect-[16/10] rounded-2xl bg-[#11141c] border border-white/[0.08]" />
            <div className="flex flex-col gap-4">
              <div className="h-3 w-16 rounded bg-[#1a1e28]" />
              <div className="h-8 w-3/4 rounded bg-[#1a1e28]" />
              <div className="h-20 w-full rounded bg-[#1a1e28]" />
              <div className="h-11 w-full rounded-lg bg-[#1a1e28]" />
            </div>
          </div>
        </div>
      }
    >
      <ProductDetail params={params} />
    </Suspense>
  );
}
