"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { renameAlbumAction, deleteAlbumAction } from "@/lib/actions";

export default function AlbumActions({
  albumId,
  groupId,
  title,
}: {
  albumId: string;
  groupId: string;
  title: string;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onRename(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const res = await renameAlbumAction(albumId, groupId, formData);
      if (res?.error) setError(res.error);
      else setEditing(false);
    });
  }

  function onDelete() {
    if (
      !window.confirm(
        "Delete this album? Its photos stay in the group as unsorted.",
      )
    )
      return;
    setError(null);
    startTransition(async () => {
      const res = await deleteAlbumAction(albumId, groupId);
      if (res?.error) {
        setError(res.error);
        return;
      }
      router.replace(`/groups/${groupId}?view=albums`);
      router.refresh();
    });
  }

  if (editing) {
    return (
      <form action={onRename} className="flex items-center gap-2">
        <input
          name="title"
          defaultValue={title}
          autoFocus
          maxLength={60}
          placeholder="Album title"
          className="rounded-lg border border-app bg-soft px-3 py-1.5 text-sm text-app outline-none transition placeholder:text-subtle focus:border-indigo-400/60"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg grad-accent px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          Save
        </button>
        <button
          type="button"
          onClick={() => setEditing(false)}
          disabled={pending}
          className="text-sm text-faint transition hover:text-app"
        >
          Cancel
        </button>
        {error && (
          <span className="text-sm text-red-500 dark:text-red-400">{error}</span>
        )}
      </form>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => setEditing(true)}
        className="rounded-lg glass px-3 py-1.5 text-sm font-medium text-muted transition hover:text-app"
      >
        Rename
      </button>
      <button
        onClick={onDelete}
        disabled={pending}
        className="rounded-lg border border-red-500/40 px-3 py-1.5 text-sm font-medium text-red-600 transition hover:bg-red-500/10 disabled:opacity-50 dark:text-red-400"
      >
        Delete album
      </button>
      {error && (
        <span className="text-sm text-red-500 dark:text-red-400">{error}</span>
      )}
    </div>
  );
}
