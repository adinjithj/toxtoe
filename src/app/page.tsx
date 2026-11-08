import { Suspense } from "react";
import { connection } from "next/server";
import ProductCard from "@/components/ProductCard";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const FOCUS_CLASSES =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#10b981]";

function NodeNetworkVisual() {
  return (
    <div className="relative" aria-hidden="true">
      <div className="rounded-2xl border border-white/[0.08] bg-[#0f1219] p-6">
        <svg viewBox="0 0 360 280" fill="none" className="h-auto w-full">
          {/* background wires */}
          <path
            d="M188 78 C236 78 236 96 284 96"
            stroke="rgba(238,240,245,0.14)"
            strokeWidth="1"
          />
          <path
            d="M188 118 C236 118 236 152 284 152"
            stroke="rgba(238,240,245,0.14)"
            strokeWidth="1"
          />
          <path
            d="M76 190 L136 190"
            stroke="rgba(238,240,245,0.14)"
            strokeWidth="1"
          />

          {/* focus wire (accent) */}
          <path
            d="M188 102 C200 120 208 130 236 104"
            stroke="rgba(16,185,129,0.4)"
            strokeWidth="1.2"
          />
          <path
            d="M340 104 C300 140 260 170 188 210"
            stroke="rgba(6,182,212,0.4)"
            strokeWidth="1.2"
          />

          {/* node: TOP · fx (focus, emerald) */}
          <rect
            x="68"
            y="70"
            width="120"
            height="64"
            rx="10"
            fill="#141823"
            stroke="rgba(16,185,129,0.45)"
            strokeDasharray="4 4"
          />
          <circle cx="68" cy="90" r="3" fill="#0b0d14" stroke="#7a8296" />
          <circle cx="68" cy="114" r="3" fill="#0b0d14" stroke="#7a8296" />
          <circle cx="188" cy="102" r="3" fill="#0b0d14" stroke="#10b981" />
          <text
            x="86"
            y="95"
            fontFamily="Geist Mono, monospace"
            fontSize="10"
            fill="#a3a9b8"
          >
            TOP · fx
          </text>
          <text
            x="86"
            y="112"
            fontFamily="Geist Mono, monospace"
            fontSize="9"
            fill="#7a8296"
          >
            Glitch
          </text>

          {/* node: SOP · sdf (cyan) */}
          <rect
            x="236"
            y="78"
            width="104"
            height="52"
            rx="10"
            fill="#141823"
            stroke="rgba(255,255,255,0.08)"
          />
          <circle cx="236" cy="96" r="3" fill="#0b0d14" stroke="#7a8296" />
          <circle cx="340" cy="104" r="3" fill="#0b0d14" stroke="#06b6d4" />
          <text
            x="254"
            y="100"
            fontFamily="Geist Mono, monospace"
            fontSize="10"
            fill="#a3a9b8"
          >
            SOP · sdf
          </text>

          {/* node: OUT · render */}
          <rect
            x="68"
            y="200"
            width="120"
            height="52"
            rx="10"
            fill="#141823"
            stroke="rgba(255,255,255,0.08)"
          />
          <circle cx="68" cy="220" r="3" fill="#0b0d14" stroke="#7a8296" />
          <circle cx="188" cy="226" r="3" fill="#0b0d14" stroke="#7a8296" />
          <text
            x="86"
            y="224"
            fontFamily="Geist Mono, monospace"
            fontSize="10"
            fill="#a3a9b8"
          >
            Out · render
          </text>

          {/* status line */}
          <circle cx="36" cy="36" r="3" fill="#10b981" />
          <text
            x="46"
            y="39"
            fontFamily="Geist Mono, monospace"
            fontSize="10"
            fill="#7a8296"
          >
            network · ready
          </text>
        </svg>
      </div>
    </div>
  );
}

// Server component: streams live products from the database.
// SECURITY: explicit `select` whitelist only — `delivery_url` is NEVER queried here.
async function FeaturedProducts() {
  // Opt into request-time rendering (Cache Components) for this DB read.
  await connection();

  // Collect the product IDs the authenticated user already owns so the
  // catalog can badge them at a glance.
  const session = await auth();
  const ownedProductIds = new Set<string>();
  if (session?.user?.id) {
    const purchases = await prisma.purchase.findMany({
      where: {
        userId: session.user.id,
        status: "COMPLETED",
      },
      select: { productId: true },
    });
    for (const purchase of purchases) {
      ownedProductIds.add(purchase.productId);
    }
  }

  const products = await prisma.product.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      price: true,
      thumbnail_url: true,
      fileType: true,
    },
  });

  return (
    <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          id={product.id}
          title={product.title}
          price={product.price}
          thumbnail_url={product.thumbnail_url}
          fileType={product.fileType}
          isOwned={ownedProductIds.has(product.id)}
        />
      ))}
    </div>
  );
}

function FeaturedProductsFallback() {
  return (
    <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col overflow-hidden rounded-xl border border-white/[0.08] bg-[#11141c]"
        >
          <div className="aspect-[16/10] w-full bg-[#0f1219]" />
          <div className="flex flex-1 flex-col gap-3 p-5">
            <div className="h-3 w-24 rounded bg-[#1a1e28]" />
            <div className="h-4 w-3/4 rounded bg-[#1a1e28]" />
            <div className="mt-2 h-6 w-20 rounded bg-[#1a1e28]" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="relative flex min-h-screen flex-col bg-[#0b0d14] text-[#eef0f5] td-grid-bg">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/[0.08] bg-[#0b0d14]/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <a href="#" className="flex items-baseline gap-1.5">
            <span className="font-mono text-[17px] font-medium tracking-tight text-[#eef0f5]">
              tox<span className="text-[#10b981]">toe</span>
            </span>
            <span className="font-mono text-[11px] text-[#7a8296]">
              marketplace
            </span>
          </a>

          <nav className="hidden items-center gap-8 text-sm font-normal text-[#a3a9b8] md:flex">
            <a href="#explore" className="text-[#eef0f5]">
              Explore
            </a>
            <a
              href="#sell"
              className="transition-colors hover:text-[#eef0f5]"
            >
              Sell assets
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <a
              href="/login"
              className={`hidden px-3 py-2 text-sm text-[#a3a9b8] transition-colors hover:text-[#eef0f5] sm:inline-block ${FOCUS_CLASSES}`}
            >
              Sign in
            </a>
            <button
              type="button"
              className={`h-9 rounded-lg border border-white/[0.12] bg-[#1a1e28] px-4 text-[13px] font-medium text-[#a3a9b8] transition-colors hover:border-white/[0.24] hover:text-[#eef0f5] ${FOCUS_CLASSES}`}
            >
              Sell .tox/.toe
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 pb-24 pt-20 sm:px-6 sm:pt-32 lg:grid-cols-[1fr_400px] lg:items-center lg:px-8 lg:pb-32">
          <div>
            <p className="font-mono text-xs text-[#7a8296]">
              For the TouchDesigner community
            </p>
            <h1 className="mt-4 max-w-xl text-4xl font-medium leading-[1.05] tracking-tight text-[#eef0f5] sm:text-[56px]">
              Buy and sell TouchDesigner assets
            </h1>
            <p className="mt-6 max-w-md text-base leading-relaxed text-[#a3a9b8]">
              Curated .tox components and .toe project networks, crafted by
              creative technologists and VJs.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <a
                href="#explore"
                className={`inline-flex h-11 items-center rounded-lg bg-[#eef0f5] px-6 text-sm font-medium text-[#0b0d14] transition-colors hover:bg-white ${FOCUS_CLASSES}`}
              >
                Browse catalog
              </a>
              <a
                href="#sell"
                className={`inline-flex h-11 items-center rounded-lg border border-white/[0.12] px-6 text-sm font-medium text-[#a3a9b8] transition-colors hover:border-white/[0.24] hover:text-[#eef0f5] ${FOCUS_CLASSES}`}
              >
                Creator program
              </a>
            </div>
          </div>

          <NodeNetworkVisual />
        </div>
      </section>

      {/* Catalog */}
      <main
        id="explore"
        className="mx-auto w-full max-w-7xl px-4 pb-28 sm:px-6 lg:px-8"
      >
        <div className="flex flex-col gap-6 border-b border-white/[0.08] pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-xs text-[#7a8296]">Catalog</p>
            <h2 className="mt-2 text-xl font-medium text-[#eef0f5] sm:text-2xl">
              Featured components & networks
            </h2>
            <p className="mt-2 text-sm text-[#a3a9b8]">
              Shaders, generators, and audio-reactive rigs
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              "All",
              "GLSL / Shaders",
              "Audio Reactive",
              "Simulation",
              "UI & Control",
            ].map((cat, idx) => (
              <button
                key={cat}
                type="button"
                className={`h-8 rounded-lg border px-3 font-mono text-xs transition-colors ${
                  idx === 0
                    ? "border-white/[0.12] bg-[#1a1e28] text-[#eef0f5]"
                    : "border-transparent text-[#7a8296] hover:text-[#a3a9b8]"
                } ${FOCUS_CLASSES}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <Suspense fallback={<FeaturedProductsFallback />}>
          <FeaturedProducts />
        </Suspense>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-white/[0.08]">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p className="font-mono text-xs text-[#7a8296]">
            toxtoe © 2026 · Digital broker for TouchDesigner creators
          </p>
          <p className="font-mono text-xs text-[#7a8296]">
            Next.js · Neon Postgres · Stripe
          </p>
        </div>
      </footer>
    </div>
  );
}
