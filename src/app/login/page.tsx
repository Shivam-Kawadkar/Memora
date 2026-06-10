import { Suspense } from "react";
import Link from "next/link";
import GoogleSignInButton from "@/components/GoogleSignInButton";
import Logo from "@/components/Logo";

const collage = [
  { seed: "mv-a", className: "rotate-[-6deg]", delay: "0ms" },
  { seed: "mv-c", className: "rotate-[4deg]", delay: "120ms" },
  { seed: "mv-d", className: "rotate-[7deg]", delay: "240ms" },
  { seed: "mv-b", className: "rotate-[-4deg]", delay: "360ms" },
];

export default function LoginPage() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <Link
        href="/"
        className="absolute left-5 top-5 z-20 flex items-center gap-1.5 rounded-full glass px-3 py-1.5 text-sm text-faint transition hover:text-app active:scale-95"
      >
        ← Back
      </Link>

      {/* ---------- Left: brand showcase (desktop only) ---------- */}
      <aside className="relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-between">
        <div
          className="absolute inset-0 -z-10"
          style={{
            backgroundImage:
              "linear-gradient(140deg, #6366f1 0%, #a855f7 45%, #ec4899 100%)",
          }}
        />
        <div className="absolute inset-0 -z-10 bg-black/10" />

        <div className="p-10">
          <div className="flex items-center gap-2.5 font-bold text-white">
            <Logo size={32} />
            <span className="font-display text-lg tracking-tight">Memora</span>
          </div>
        </div>

        {/* Floating photo collage */}
        <div className="relative mx-auto flex w-full max-w-md flex-1 items-center justify-center px-6">
          <div className="grid grid-cols-2 gap-5">
            {collage.map((c) => (
              <div
                key={c.seed}
                className={`animate-fade-up overflow-hidden rounded-2xl bg-white p-2 shadow-2xl ${c.className}`}
                style={{ animationDelay: c.delay }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://picsum.photos/seed/${c.seed}/300/320`}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="aspect-[3/3.2] w-36 rounded-xl object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="p-10 text-white">
          <h2 className="font-display text-3xl font-bold leading-tight tracking-tight">
            Every memory,
            <br />
            in one private place.
          </h2>
          <p className="mt-3 max-w-sm text-sm text-white/80">
            A photo vault for your batch, hostel, or trip squad — no strangers,
            no algorithms, just your people.
          </p>
        </div>
      </aside>

      {/* ---------- Right: sign-in ---------- */}
      <main className="flex items-center justify-center px-5 py-16">
        <div className="animate-fade-up w-full max-w-sm">
          <div className="mb-8 text-center lg:hidden">
            <div className="mx-auto mb-4 flex justify-center">
              <Logo size={64} float className="rounded-2xl" />
            </div>
          </div>

          <div className="rounded-3xl glass p-8 shadow-2xl">
            <h1 className="font-display text-3xl font-bold tracking-tight text-app">
              Welcome <span className="grad-text">back</span>
            </h1>
            <p className="mt-2 text-sm text-faint">
              Sign in to relive your moments.
            </p>
            <hr className="grad-line my-6" />

            <Suspense fallback={<div className="h-12 rounded-xl bg-soft" />}>
              <GoogleSignInButton />
            </Suspense>

            <p className="mt-5 flex items-center justify-center gap-1.5 text-center text-xs text-subtle">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-3.5 w-3.5"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              We only use your name and photo from Google.
            </p>
          </div>

          <p className="mt-6 flex items-center justify-center gap-2 text-xs text-subtle">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Invite-only · for your college group
          </p>
        </div>
      </main>
    </div>
  );
}
