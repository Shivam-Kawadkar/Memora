"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteGroupAction } from "@/lib/actions";

export default function DangerZone({
  groupId,
  groupName,
}: {
  groupId: string;
  groupName: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onDelete() {
    setError(null);
    startTransition(async () => {
      const res = await deleteGroupAction(groupId);
      if (res?.error) {
        setError(res.error);
        return;
      }
      router.replace("/groups");
      router.refresh();
    });
  }

  return (
    <section className="rounded-2xl border border-red-500/30 bg-red-500/5 p-6">
      <h2 className="text-lg font-semibold text-red-600 dark:text-red-400">
        Danger zone
      </h2>
      <p className="mt-1 text-sm text-faint">
        Deleting a group permanently removes it, every memory, and all stored
        photos. This cannot be undone.
      </p>

      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="mt-4 rounded-xl border border-red-500/40 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-500/10 dark:text-red-400"
        >
          Delete this group
        </button>
      ) : (
        <div className="mt-4 space-y-3">
          <p className="text-sm text-muted">
            Type <span className="font-semibold text-app">{groupName}</span> to
            confirm.
          </p>
          <input
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder={groupName}
            className="w-full rounded-xl border border-app bg-soft px-4 py-2.5 text-sm text-app outline-none transition placeholder:text-subtle focus:border-red-400/60"
          />
          {error && (
            <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
          )}
          <div className="flex gap-3">
            <button
              onClick={() => {
                setOpen(false);
                setConfirm("");
                setError(null);
              }}
              disabled={pending}
              className="rounded-xl px-4 py-2.5 text-sm font-medium text-faint transition hover:text-app disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={onDelete}
              disabled={pending || confirm !== groupName}
              className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-500 active:scale-[0.97] disabled:opacity-40"
            >
              {pending ? "Deleting…" : "Delete forever"}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
