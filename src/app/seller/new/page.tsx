import Link from "next/link";
import SellerProductForm from "@/components/SellerProductForm";

export default function NewProductPage() {
  return (
    <div className="min-h-screen bg-[#0b0d14] text-[#eef0f5]">
      <div className="mx-auto w-full max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
        <Link href="/" className="font-mono text-[17px] font-medium tracking-tight">
          tox<span className="text-[#10b981]">toe</span>
        </Link>

        <div className="mt-10 flex flex-col gap-2 border-b border-white/[0.08] pb-8">
          <p className="font-mono text-xs text-[#7a8296]">Seller</p>
          <h1 className="text-2xl font-medium text-[#eef0f5] sm:text-3xl">
            Create New Asset
          </h1>
          <p className="text-sm text-[#a3a9b8]">
            List a new .tox or .toe asset on the marketplace.
          </p>
        </div>

        <SellerProductForm />
      </div>
    </div>
  );
}
