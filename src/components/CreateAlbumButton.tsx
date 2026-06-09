"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createAlbumAction } from "@/lib/actions";

export default function CreateAlbumButton({ groupId }: { groupId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const res = await createAlbumAction(groupId, formData);
      if (res?.error) setError(res.error);
      else {
        setOpen(false);
        if (res.id) router.push(`/groups/${groupId}?album=${res.id}`);
      }
    });
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-xl grad-accent px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:shadow-indigo-500/40 active:scale-[0.97]"
      >
        + New album
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => !pending && setOpen(false)}
          />
          <div className="animate-fade-up relative w-full max-w-md rounded-2xl glass p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-app">New album</h2>
            <p className="mt-1 text-sm text-faint">
              Group memories into an event, like “Goa Trip 2025”.
            </p>
            <form action={onSubmit} className="mt-5 space-y-4">
              <input
                name="title"
                autoFocus
                maxLength={60}
                placeholder="Album title"
                className="w-full rounded-xl border border-app bg-soft px-4 py-2.5 text-sm text-app outline-none transition placeholder:text-subtle focus:border-indigo-400/60"
              />
              {error && (
                <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
              )}
              <div className="flex justify-end gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  disabled={pending}
                  className="rounded-xl px-4 py-2.5 text-sm font-medium text-faint transition hover:text-app disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={pending}
                  className="rounded-xl grad-accent px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:shadow-indigo-500/40 active:scale-[0.97] disabled:opacity-60"
                >
                  {pending ? "Creating…" : "Create album"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
