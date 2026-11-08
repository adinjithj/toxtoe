import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import SellerProductForm from "@/components/SellerProductForm";

async function EditProduct({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/login?callbackUrl=/seller");
  }

  // Opt into request-time rendering (Cache Components) for this DB read.
  await connection();

  const product = await prisma.product.findUnique({
    where: { id },
    select: {
      id: true,
      sellerId: true,
      title: true,
      description: true,
      price: true,
      fileType: true,
      thumbnail_url: true,
      delivery_url: true,
    },
  });

  // SECURITY: only the product's owner may edit it.
  if (!product || product.sellerId !== userId) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#0b0d14] text-[#eef0f5]">
      <div className="mx-auto w-full max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
        <Link href="/" className="font-mono text-[17px] font-medium tracking-tight">
          tox<span className="text-[#10b981]">toe</span>
        </Link>

        <div className="mt-10 flex flex-col gap-2 border-b border-white/[0.08] pb-8">
          <p className="font-mono text-xs text-[#7a8296]">Seller</p>
          <h1 className="text-2xl font-medium text-[#eef0f5] sm:text-3xl">
            Edit Asset
          </h1>
          <p className="text-sm text-[#a3a9b8]">{product.title}</p>
        </div>

        <SellerProductForm
          mode="edit"
          productId={product.id}
          initial={{
            title: product.title,
            description: product.description ?? "",
            priceCents: product.price,
            fileType: product.fileType,
            thumbnailUrl: product.thumbnail_url,
            deliveryUrl: product.delivery_url,
          }}
        />
      </div>
    </div>
  );
}

export default function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={null}>
      <EditProduct params={params} />
    </Suspense>
  );
}
