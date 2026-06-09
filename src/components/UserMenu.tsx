"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function UserMenu({
  name,
  avatarUrl,
}: {
  name: string;
  avatarUrl: string;
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const initial = name.trim().charAt(0).toUpperCase() || "?";

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-full p-0.5 transition hover:ring-2 hover:ring-[color:var(--border)]"
      >
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatarUrl}
            alt={name}
            className="h-9 w-9 rounded-full ring-2 ring-[color:var(--border)]"
          />
        ) : (
          <span className="flex h-9 w-9 items-center justify-center rounded-full grad-accent text-sm font-semibold text-white ring-2 ring-[color:var(--border)]">
            {initial}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-20 mt-2 w-48 overflow-hidden rounded-xl glass shadow-2xl">
            <div className="border-b border-app px-4 py-3">
              <p className="truncate text-sm font-medium text-app">{name}</p>
            </div>
            <Link
              href="/profile"
              onClick={() => setOpen(false)}
              className="block px-4 py-2.5 text-sm text-muted transition hover:bg-soft hover:text-app"
            >
              Profile
            </Link>
            <button
              type="button"
              onClick={signOut}
              className="w-full px-4 py-2.5 text-left text-sm text-muted transition hover:bg-soft hover:text-app"
            >
              Sign out
            </button>
          </div>
        </>
      )}
    </div>
  );
}
