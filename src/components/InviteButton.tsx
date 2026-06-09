"use client";

import { useState, useTransition } from "react";
import { createInviteAction } from "@/lib/actions";

export default function InviteButton({ groupId }: { groupId: string }) {
  const [open, setOpen] = useState(false);
  const [link, setLink] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [pending, startTransition] = useTransition();

  function generate() {
    setOpen(true);
    setError(null);
    setLink(null);
    startTransition(async () => {
      const result = await createInviteAction(groupId);
      if (result.error) setError(result.error);
      else setLink(`${window.location.origin}/join/${result.token}`);
    });
  }

  async function copy() {
    if (!link) return;
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <>
      <button
        onClick={generate}
        className="rounded-xl glass px-4 py-2.5 text-sm font-medium text-muted transition hover:text-app"
      >
        🔗 Invite
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="animate-fade-up relative w-full max-w-md rounded-2xl glass p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-app">Invite people</h2>
            <p className="mt-1 text-sm text-faint">
              Anyone with this link can join the group.
            </p>

            <div className="mt-5">
              {pending && <p className="text-sm text-faint">Generating link…</p>}
              {error && <p className="text-sm text-red-500 dark:text-red-400">{error}</p>}
              {link && (
                <div className="flex gap-2">
                  <input
                    readOnly
                    value={link}
                    className="w-full truncate rounded-xl border border-app bg-soft px-3 py-2.5 text-sm text-muted outline-none"
                  />
                  <button
                    onClick={copy}
                    className="shrink-0 rounded-xl grad-accent px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition active:scale-95"
                  >
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setOpen(false)}
                className="rounded-xl px-4 py-2 text-sm font-medium text-faint transition hover:text-app"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
