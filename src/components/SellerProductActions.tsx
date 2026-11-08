"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const BASE_BUTTON =
  "inline-flex h-10 items-center justify-center gap-2 rounded-lg border px-4 text-[13px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60";

export default function SellerProductActions({
  productId,
  isPublished,
  deliveryUrl,
}: {
  productId: string;
  isPublished: boolean;
  deliveryUrl: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<"publish" | "delete" | null>(null);

  async function togglePublish() {
    setBusy("publish");
    try {
      const res = await fetch(`/api/seller/products/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !isPublished }),
      });
      if (!res.ok) {
        throw new Error("Could not update publish state");
      }
      router.refresh();
    } catch {
      alert("Could not update publish state. Please try again.");
    } finally {
      setBusy(null);
    }
  }

  async function handleDelete() {
    if (!window.confirm("Delete this asset? This action cannot be undone.")) {
      return;
    }
    setBusy("delete");
    try {
      const res = await fetch(`/api/seller/products/${productId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        throw new Error("Could not delete asset");
      }
      router.refresh();
    } catch {
      alert("Could not delete asset. Please try again.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="flex flex-col items-stretch gap-2 sm:w-52">
      <a
        href={deliveryUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`${BASE_BUTTON} border-white/[0.12] bg-[#1a1e28] text-[#a3a9b8] hover:border-white/[0.24] hover:text-[#eef0f5]`}
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

      <Link
        href={`/seller/edit/${productId}`}
        className={`${BASE_BUTTON} border-white/[0.12] bg-[#1a1e28] text-[#a3a9b8] hover:border-white/[0.24] hover:text-[#eef0f5]`}
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
            d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125"
          />
        </svg>
        Edit
      </Link>

      <button
        type="button"
        onClick={togglePublish}
        disabled={busy !== null}
        className={`${BASE_BUTTON} border-white/[0.12] bg-[#1a1e28] text-[#a3a9b8] hover:border-white/[0.24] hover:text-[#eef0f5]`}
      >
        {busy === "publish" ? (
          "Updating…"
        ) : isPublished ? (
          <>
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
                d="M3 3l18 18M10.584 10.587a2 2 0 002.828 2.83M9.363 5.365A9.974 9.974 0 0112 5c7 0 10 7 10 7a13.37 13.37 0 01-1.67 2.374m-3.228 2.309A9.947 9.947 0 0112 19c-7 0-10-7-10-7a13.37 13.37 0 013.373-4.454"
              />
            </svg>
            Unpublish
          </>
        ) : (
          <>
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
                d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178zM15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            Publish
          </>
        )}
      </button>

      <button
        type="button"
        onClick={handleDelete}
        disabled={busy !== null}
        className={`${BASE_BUTTON} border-red-400/25 bg-[#1a1e28] text-red-400 hover:border-red-400/50 hover:bg-red-500/10`}
      >
        {busy === "delete" ? (
          "Deleting…"
        ) : (
          <>
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
                d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
              />
            </svg>
            Delete
          </>
        )}
      </button>
    </div>
  );
}
