import { Suspense } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/components/ProductCard";
import SellerNav from "@/components/SellerNav";

async function AnalyticsContent() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    // Phase 5 TODO: restrict to `role === "SELLER"` once roles are enforced.
    redirect("/login?callbackUrl=/seller/analytics");
  }

  // Opt into request-time rendering (Cache Components) for this DB read.
  await connection();

  // Only COMPLETED purchases for products owned by this seller.
  const purchases = await prisma.purchase.findMany({
    where: {
      status: "COMPLETED",
      product: { sellerId: userId },
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      amountPaid: true,
      createdAt: true,
      product: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  });

  const totalSales = purchases.length;
  const totalEarningsCents = purchases.reduce(
    (sum, purchase) => sum + purchase.amountPaid,
    0
  );

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <SellerNav active="analytics" />

      <div className="flex flex-col gap-6 border-b border-white/[0.08] pb-8 pt-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-xs text-[#7a8296]">Seller Portal</p>
          <h1 className="mt-2 text-2xl font-medium text-[#eef0f5] sm:text-3xl">
            Analytics &amp; Earnings
          </h1>
          <p className="mt-2 text-sm text-[#a3a9b8]">
            {totalSales} sale{totalSales === 1 ? "" : "s"} ·{" "}
            {formatPrice(totalEarningsCents)} total earnings
          </p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-white/[0.08] bg-[#11141c] p-6">
          <span className="block font-mono text-xs text-[#7a8296]">
            Total Sales
          </span>
          <span className="mt-3 block text-3xl font-medium tabular-nums text-[#eef0f5]">
            {totalSales}
          </span>
          <span className="mt-2 block font-mono text-[11px] text-[#7a8296]">
            completed purchases
          </span>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-[#11141c] p-6">
          <span className="block font-mono text-xs text-[#7a8296]">
            Total Earnings
          </span>
          <span className="mt-3 block text-3xl font-medium tabular-nums text-[#10b981]">
            {formatPrice(totalEarningsCents)}
          </span>
          <span className="mt-2 block font-mono text-[11px] text-[#7a8296]">
            before platform fees
          </span>
        </div>
      </div>

      {/* Transaction history */}
      <h2 className="mt-12 font-mono text-xs text-[#7a8296]">
        Recent Transactions
      </h2>

      {purchases.length === 0 ? (
        <div className="mt-4 flex flex-col items-start gap-4 rounded-2xl border border-white/[0.08] bg-[#11141c] p-8">
          <p className="text-[15px] text-[#a3a9b8]">
            No sales yet. When buyers complete checkout, transactions appear
            here.
          </p>
          <Link
            href="/seller"
            className="inline-flex h-10 items-center rounded-lg bg-[#eef0f5] px-5 text-sm font-medium text-[#0b0d14] transition-colors hover:bg-white"
          >
            View your products
          </Link>
        </div>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-2xl border border-white/[0.08] bg-[#11141c]">
          <table className="w-full min-w-[480px] border-collapse text-left">
            <thead>
              <tr className="border-b border-white/[0.08] font-mono text-[11px] text-[#7a8296]">
                <th scope="col" className="px-5 py-4 font-medium">
                  Date
                </th>
                <th scope="col" className="px-5 py-4 font-medium">
                  Product
                </th>
                <th scope="col" className="px-5 py-4 text-right font-medium">
                  Amount Paid
                </th>
              </tr>
            </thead>
            <tbody>
              {purchases.map((purchase) => (
                <tr
                  key={purchase.id}
                  className="border-b border-white/[0.04] last:border-b-0"
                >
                  <td className="whitespace-nowrap px-5 py-4 font-mono text-xs text-[#a3a9b8]">
                    {new Date(purchase.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                  <td className="px-5 py-4 text-sm text-[#eef0f5]">
                    {purchase.product.title}
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-right text-sm font-medium tabular-nums text-[#eef0f5]">
                    {formatPrice(purchase.amountPaid)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-[#0b0d14] text-[#eef0f5]">
      <Suspense
        fallback={
          <div className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="h-3 w-24 rounded bg-[#1a1e28]" />
            <div className="mt-3 h-8 w-48 rounded bg-[#1a1e28]" />
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="h-32 rounded-2xl border border-white/[0.08] bg-[#11141c]" />
              <div className="h-32 rounded-2xl border border-white/[0.08] bg-[#11141c]" />
            </div>
          </div>
        }
      >
        <AnalyticsContent />
      </Suspense>
    </div>
  );
}
