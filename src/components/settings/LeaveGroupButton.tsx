"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { leaveGroupAction } from "@/lib/actions";

export default function LeaveGroupButton({ groupId }: { groupId: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onLeave() {
    if (!window.confirm("Leave this group? You'll lose access to its memories."))
      return;
    setError(null);
    startTransition(async () => {
      const res = await leaveGroupAction(groupId);
      if (res?.error) {
        setError(res.error);
        return;
      }
      router.replace("/groups");
      router.refresh();
    });
  }

  return (
    <section className="glass rounded-2xl p-6">
      <h2 className="text-lg font-semibold text-app">Leave group</h2>
      <p className="mt-1 text-sm text-faint">
        Remove yourself from this group. You can rejoin later with an invite.
      </p>
      {error && (
        <p className="mt-3 text-sm text-red-500 dark:text-red-400">{error}</p>
      )}
      <button
        onClick={onLeave}
        disabled={pending}
        className="mt-4 rounded-xl border border-app px-4 py-2.5 text-sm font-semibold text-muted transition hover:text-app disabled:opacity-50"
      >
        {pending ? "Leaving…" : "Leave group"}
      </button>
    </section>
  );
}
