"use client";

import { useState, useTransition } from "react";
import { updateGroupAction } from "@/lib/actions";
import type { Group } from "@/lib/types";

const COVER_COLORS = [
  "#6366f1",
  "#ec4899",
  "#14b8a6",
  "#f59e0b",
  "#8b5cf6",
  "#06b6d4",
];

export default function EditGroupForm({ group }: { group: Group }) {
  const [color, setColor] = useState(group.coverColor);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const res = await updateGroupAction(group.id, formData);
      if (res?.error) setError(res.error);
      else setSaved(true);
    });
  }

  return (
    <section className="glass rounded-2xl p-6">
      <h2 className="text-lg font-semibold text-app">Group details</h2>
      <form action={onSubmit} className="mt-4 space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-muted">
            Name
          </label>
          <input
            name="name"
            defaultValue={group.name}
            maxLength={60}
            placeholder="Group name"
            className="w-full rounded-xl border border-app bg-soft px-4 py-2.5 text-sm text-app outline-none transition placeholder:text-subtle focus:border-indigo-400/60"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-muted">
            Description
          </label>
          <textarea
            name="description"
            defaultValue={group.description}
            rows={2}
            maxLength={140}
            placeholder="What's this group about?"
            className="w-full resize-none rounded-xl border border-app bg-soft px-4 py-2.5 text-sm text-app outline-none transition placeholder:text-subtle focus:border-indigo-400/60"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-muted">
            Cover color
          </label>
          <input type="hidden" name="cover_color" value={color} />
          <div className="flex flex-wrap gap-2.5">
            {COVER_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                aria-label={`Select ${c}`}
                className={`h-8 w-8 rounded-full ring-2 transition ${
                  color === c
                    ? "ring-app scale-110"
                    : "ring-transparent hover:scale-105"
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
        )}
        {saved && !error && (
          <p className="text-sm text-emerald-600 dark:text-emerald-400">
            Saved.
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="rounded-xl grad-accent px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:shadow-indigo-500/40 active:scale-[0.97] disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save changes"}
        </button>
      </form>
    </section>
  );
}
