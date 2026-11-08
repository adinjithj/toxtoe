import Link from "next/link";

const TABS = [
  { key: "products", href: "/seller", label: "My Products" },
  { key: "analytics", href: "/seller/analytics", label: "Analytics" },
] as const;

export type SellerNavActive = (typeof TABS)[number]["key"];

export default function SellerNav({ active }: { active: SellerNavActive }) {
  return (
    <nav
      aria-label="Seller navigation"
      className="mt-6 flex items-center gap-1 border-b border-white/[0.08]"
    >
      {TABS.map((tab) => {
        const isActive = tab.key === active;
        return (
          <Link
            key={tab.key}
            href={tab.href}
            className={`-mb-px inline-flex h-11 items-center border-b-2 px-4 font-mono text-xs transition-colors ${
              isActive
                ? "border-emerald-400 text-[#eef0f5]"
                : "border-transparent text-[#7a8296] hover:text-[#a3a9b8]"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
