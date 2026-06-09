import { Suspense } from "react";
import Link from "next/link";
import GoogleSignInButton from "@/components/GoogleSignInButton";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <Link
        href="/"
        className="absolute left-6 top-6 text-sm text-faint transition hover:text-app"
      >
        ← Back
      </Link>

      <div className="animate-fade-up w-full max-w-sm rounded-3xl glass p-8 shadow-2xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl grad-accent text-3xl shadow-lg shadow-indigo-500/30">
            📸
          </div>
          <h1 className="text-3xl font-bold tracking-tight grad-text">Memory Vault</h1>
          <p className="mt-2 text-sm text-faint">Welcome — sign in to continue.</p>
        </div>

        <Suspense fallback={<div className="h-12 rounded-xl bg-soft" />}>
          <GoogleSignInButton />
        </Suspense>

        <p className="mt-5 text-center text-xs text-subtle">
          We only use your name and photo from Google.
        </p>
      </div>

      <p className="mt-8 flex items-center gap-2 text-xs text-subtle">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
        Invite-only · for your college group
      </p>
    </div>
  );
}
