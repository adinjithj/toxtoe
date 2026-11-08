"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid credentials. Use a seeded test account (password: toxtoe-test).");
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="rounded-2xl border border-white/[0.08] bg-[#11141c] p-8">
        <p className="font-mono text-xs text-[#7a8296]">Account</p>
        <h1 className="mt-2 text-2xl font-medium text-[#eef0f5]">Sign in</h1>
        <p className="mt-2 text-sm text-[#a3a9b8]">
          Use the seeded test buyer account to explore your dashboard.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="email"
              className="font-mono text-xs text-[#a3a9b8]"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              defaultValue="buyer@toxtoe.dev"
              className="h-11 rounded-lg border border-white/[0.12] bg-[#0f1219] px-4 text-sm text-[#eef0f5] placeholder:text-[#7a8296] focus:border-white/[0.24] focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="password"
              className="font-mono text-xs text-[#a3a9b8]"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              defaultValue="toxtoe-test"
              className="h-11 rounded-lg border border-white/[0.12] bg-[#0f1219] px-4 text-sm text-[#eef0f5] placeholder:text-[#7a8296] focus:border-white/[0.24] focus:outline-none"
            />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 inline-flex h-11 items-center justify-center rounded-lg bg-[#eef0f5] px-6 text-sm font-medium text-[#0b0d14] transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
