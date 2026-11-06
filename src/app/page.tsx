import React from "react";
import ProductCard, { ProductCardProps } from "@/components/ProductCard";

// Mock Products Array (stored with integer cents for prices matching PostgreSQL schema)
const MOCK_PRODUCTS: ProductCardProps[] = [
  {
    id: "prod_1",
    title: "Neon Glitch Shader",
    price: 1800, // $18.00 USD
    thumbnail_url:
      "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80",
    fileType: "TOX",
    category: "GLSL / Shaders",
    creatorName: "LumaSync",
  },
  {
    id: "prod_2",
    title: "Audio Reactive Geometry",
    price: 3200, // $32.00 USD
    thumbnail_url:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
    fileType: "TOE",
    category: "Audio Reactive",
    creatorName: "ResonantNodes",
  },
  {
    id: "prod_3",
    title: "Fluid Sim Particles",
    price: 4500, // $45.00 USD
    thumbnail_url:
      "https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=800&q=80",
    fileType: "TOX",
    category: "Simulation",
    creatorName: "AetherVisuals",
  },
  {
    id: "prod_4",
    title: "VJ Dashboard UI",
    price: 2900, // $29.00 USD
    thumbnail_url:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
    fileType: "BOTH",
    category: "UI & Control",
    creatorName: "NodeWired",
  },
];

export default function HomePage() {
  return (
    <div className="relative min-h-screen bg-[#090a0f] text-zinc-100 flex flex-col td-grid-bg">
      {/* Top Header / Navigation */}
      <header className="sticky top-0 z-50 border-b border-zinc-800/80 bg-[#090a0f]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-mono text-base font-bold shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              tt
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-mono text-lg font-bold tracking-tight text-zinc-100">
                tox<span className="text-emerald-400">toe</span>
              </span>
              <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
                marketplace
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-400">
            <a href="#explore" className="text-zinc-100 hover:text-emerald-400 transition-colors">
              Explore
            </a>
            <a href="#categories" className="hover:text-emerald-400 transition-colors">
              Categories
            </a>
            <a href="#digital-broker" className="hover:text-emerald-400 transition-colors">
              Sell Assets
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <button
              type="button"
              className="hidden sm:inline-flex rounded-lg border border-zinc-800 bg-zinc-900/80 px-3.5 py-1.5 text-xs font-mono font-medium text-zinc-300 hover:border-zinc-700 hover:text-white transition-all"
            >
              Sign In
            </button>
            <button
              type="button"
              className="rounded-lg border border-emerald-500/50 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-mono font-semibold text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.15)] transition-all"
            >
              + Sell .tox/.toe
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 sm:pt-24 sm:pb-28">
        {/* Glow backdrop effects */}
        <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-tr from-emerald-500/15 via-cyan-500/10 to-transparent blur-[120px] rounded-full" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/80 px-3.5 py-1 text-xs font-mono text-zinc-400 mb-8 backdrop-blur-md">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Built for the TouchDesigner Community</span>
            <span className="text-zinc-600">|</span>
            <span className="text-emerald-400">.tox</span> &amp;{" "}
            <span className="text-cyan-400">.toe</span>
          </div>

          {/* Headline */}
          <h1 className="mx-auto max-w-4xl text-4xl font-extrabold tracking-tight text-zinc-100 sm:text-6xl sm:leading-[1.15]">
            The Premier Marketplace for{" "}
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              TouchDesigner
            </span>{" "}
            Assets
          </h1>

          {/* Subtitle */}
          <p className="mx-auto mt-6 max-w-2xl text-base text-zinc-400 sm:text-lg sm:leading-relaxed">
            Discover curated, performance-optimized <code className="font-mono text-emerald-400">.tox</code> components
            and full <code className="font-mono text-cyan-400">.toe</code> project networks crafted by world-class
            creative technologists and VJs.
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <a
              href="#explore"
              className="rounded-lg bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-zinc-950 shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 transition-all font-mono"
            >
              Browse Catalog ↓
            </a>
            <a
              href="#digital-broker"
              className="rounded-lg border border-zinc-800 bg-zinc-900/60 px-6 py-2.5 text-sm font-medium text-zinc-300 hover:border-zinc-700 hover:text-white backdrop-blur-md transition-all font-mono"
            >
              Creator Program
            </a>
          </div>
        </div>
      </section>

      {/* Main Catalog & Grid Section */}
      <main id="explore" className="relative flex-1 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-24 w-full">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-zinc-800/80 pb-5 mb-8 gap-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-zinc-100 flex items-center gap-2">
              <span>Featured Components &amp; Networks</span>
              <span className="rounded-full bg-zinc-800 px-2.5 py-0.5 text-xs font-mono font-normal text-zinc-400">
                {MOCK_PRODUCTS.length}
              </span>
            </h2>
            <p className="text-xs text-zinc-500 font-mono mt-1">
              Live generative tools, interactive shaders, and audio-reactive rigs
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-2 text-xs font-mono">
            {["All", "GLSL / Shaders", "Audio Reactive", "Simulation", "UI & Control"].map(
              (cat, idx) => (
                <button
                  key={cat}
                  type="button"
                  className={`rounded-lg px-3 py-1.5 transition-colors ${
                    idx === 0
                      ? "bg-zinc-800 text-emerald-400 border border-emerald-500/30"
                      : "bg-zinc-900/50 text-zinc-400 border border-zinc-800/80 hover:text-zinc-200 hover:border-zinc-700"
                  }`}
                >
                  {cat}
                </button>
              )
            )}
          </div>
        </div>

        {/* Responsive Product Grid */}
        {/* 1 column on mobile, 2 on tablet, 3 on laptop, 4 on desktop */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {MOCK_PRODUCTS.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              title={product.title}
              price={product.price}
              thumbnail_url={product.thumbnail_url}
              fileType={product.fileType}
              category={product.category}
              creatorName={product.creatorName}
            />
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950/80 py-8 text-center text-xs font-mono text-zinc-600">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            toxtoe © 2026 • The Digital Broker for TouchDesigner Creators
          </div>
          <div className="flex gap-4 text-zinc-500">
            <span>Powered by Next.js &amp; Neon Postgres</span>
            <span>•</span>
            <span>Stripe Payments</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
