import { Suspense } from "react";
import Link from "next/link";
import LoginForm from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#0b0d14] px-4 py-16 text-[#eef0f5]">
      <div className="mx-auto w-full max-w-md">
        <Link href="/" className="font-mono text-[17px] font-medium tracking-tight">
          tox<span className="text-[#10b981]">toe</span>
        </Link>
      </div>
      <div className="mt-12 flex flex-1 items-start justify-center">
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
