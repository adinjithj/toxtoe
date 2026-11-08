"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ClaimAssetButton({ productId }: { productId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClaim() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });

      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
      };

      if (!res.ok) {
        if (res.status === 401) {
          router.push(`/login?callbackUrl=/product/${productId}`);
          return;
        }
        throw new Error(data.error ?? "Could not claim asset");
      }

      // Claim recorded — go to dashboard to see the delivery link.
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not claim asset");
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-start gap-3">
      <button
        type="button"
        onClick={handleClaim}
        disabled={loading}
        className="inline-flex h-12 items-center gap-2 rounded-lg bg-[#eef0f5] px-7 text-sm font-medium text-[#0b0d14] transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#10b981]"
      >
        {loading ? "Claiming asset…" : "Claim Asset (Test Mode)"}
      </button>

      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );
}
