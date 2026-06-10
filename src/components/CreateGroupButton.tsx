"use client";

import { useState, useTransition } from "react";
import { createGroupAction } from "@/lib/actions";

export default function CreateGroupButton() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await createGroupAction(formData);
      if (result?.error) setError(result.error);
      else setOpen(false);
    });
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full rounded-xl grad-accent px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:-translate-y-0.5 hover:shadow-indigo-500/40 active:scale-[0.97] sm:w-auto"
      >
        + Create group
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4">
          <div
            className="animate-fade-in fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => !pending && setOpen(false)}
          />
          <div className="animate-pop relative my-auto max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl glass p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-app">Create a group</h2>
            <p className="mt-1 text-sm text-faint">
              Start a private space for your memories.
            </p>

            <form action={onSubmit} className="mt-5 space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-muted">
                  Group name
                </label>
                <input
                  name="name"
                  autoFocus
                  maxLength={60}
                  placeholder="e.g. Goa Trip 2025"
                  className="w-full rounded-xl border border-app bg-soft px-4 py-2.5 text-sm text-app outline-none transition placeholder:text-subtle focus:border-indigo-400/60"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-muted">
                  Description <span className="text-subtle">(optional)</span>
                </label>
                <textarea
                  name="description"
                  rows={2}
                  maxLength={140}
                  placeholder="What's this group about?"
                  className="w-full resize-none rounded-xl border border-app bg-soft px-4 py-2.5 text-sm text-app outline-none transition placeholder:text-subtle focus:border-indigo-400/60"
                />
              </div>

              {error && <p className="text-sm text-red-500 dark:text-red-400">{error}</p>}

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
                  {pending ? "Creating…" : "Create group"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
