"use client";

import { useState } from "react";

export default function NotificationsBell() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Notifications"
        className="relative flex h-9 w-9 items-center justify-center rounded-full glass text-faint transition hover:border-app hover:text-app active:scale-90"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5"
        >
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-pink-500 ring-2 ring-[color:var(--background)]" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-20 mt-2 w-72 overflow-hidden rounded-xl glass shadow-2xl">
            <div className="border-b border-app px-4 py-3 text-sm font-semibold text-app">
              Notifications
            </div>
            <div className="px-4 py-8 text-center">
              <p className="text-2xl">🔔</p>
              <p className="mt-2 text-sm text-faint">You&apos;re all caught up.</p>
              <p className="mt-1 text-xs text-subtle">
                New activity will show up here.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
