import { Suspense } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import Link from "next/link";
import Image from "next/image";
import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/components/ProductCard";

// SECURITY: This is the ONLY frontend surface that may expose `delivery_url`.
// It is gated behind an authenticated session and only returns the current
// user's COMPLETED purchases.
async function DashboardContent() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/login");
  }

  // Opt into request-time rendering (Cache Components) for this DB read.
  await connection();

  const purchases = await prisma.purchase.findMany({
    where: {
      userId,
      status: "COMPLETED",
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      createdAt: true,
      amountPaid: true,
      product: {
        select: {
          id: true,
          title: true,
          thumbnail_url: true,
          fileType: true,
          delivery_url: true,
        },
      },
    },
  });

  const userName = session.user.name ?? session.user.email ?? "Buyer";

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-6 border-b border-white/[0.08] pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-xs text-[#7a8296]">Dashboard</p>
          <h1 className="mt-2 text-2xl font-medium text-[#eef0f5] sm:text-3xl">
            Your assets
          </h1>
          <p className="mt-2 text-sm text-[#a3a9b8]">
            {userName} · {purchases.length} purchase
            {purchases.length === 1 ? "" : "s"}
          </p>
        </div>

        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/" });
          }}
        >
          <button
            type="submit"
            className="h-9 rounded-lg border border-white/[0.12] bg-[#1a1e28] px-4 text-[13px] font-medium text-[#a3a9b8] transition-colors hover:border-white/[0.24] hover:text-[#eef0f5]"
          >
            Sign out
          </button>
        </form>
      </div>

      {purchases.length === 0 ? (
        <div className="mt-12 flex flex-col items-start gap-4 rounded-2xl border border-white/[0.08] bg-[#11141c] p-8">
          <p className="text-[15px] text-[#a3a9b8]">
            You haven&apos;t claimed any assets yet.
          </p>
          <Link
            href="/"
            className="inline-flex h-10 items-center rounded-lg bg-[#eef0f5] px-5 text-sm font-medium text-[#0b0d14] transition-colors hover:bg-white"
          >
            Browse catalog
          </Link>
        </div>
      ) : (
        <ul className="mt-8 flex flex-col gap-4">
          {purchases.map((purchase) => (
            <li
              key={purchase.id}
              className="flex flex-col gap-5 rounded-2xl border border-white/[0.08] bg-[#11141c] p-5 sm:flex-row sm:items-center"
            >
              <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden rounded-xl bg-[#0f1219] sm:w-44">
                <Image
                  src={purchase.product.thumbnail_url}
                  alt={purchase.product.title}
                  fill
                  sizes="(max-width: 640px) 100vw, 176px"
                  className="object-cover"
                />
              </div>

              <div className="flex flex-1 flex-col gap-2">
                <p className="font-mono text-[11px] text-[#7a8296]">
                  {new Date(purchase.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
                <h2 className="text-[15px] font-medium text-[#eef0f5]">
                  {purchase.product.title}
                </h2>
                <p className="font-mono text-xs text-[#a3a9b8]">
                  Paid {formatPrice(purchase.amountPaid)}
                </p>
              </div>

              <a
                href={purchase.product.delivery_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-10 shrink-0 items-center gap-2 rounded-lg bg-[#eef0f5] px-5 text-sm font-medium text-[#0b0d14] transition-colors hover:bg-white"
              >
                Download asset
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

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-[#0b0d14] text-[#eef0f5]">
      <Suspense
        fallback={
          <div className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="h-3 w-20 rounded bg-[#1a1e28]" />
            <div className="mt-3 h-8 w-48 rounded bg-[#1a1e28]" />
            <div className="mt-8 flex flex-col gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-28 rounded-2xl border border-white/[0.08] bg-[#11141c]"
                />
              ))}
            </div>
          </div>
        }
      >
        <DashboardContent />
      </Suspense>
    </div>
  );
}
