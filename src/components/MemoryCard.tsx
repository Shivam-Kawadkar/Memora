"use client";

import { useState, useTransition } from "react";
import { deleteMemoryAction, setMemoryAlbumAction } from "@/lib/actions";
import type { AlbumRef, FeedMemory } from "@/lib/types";

export default function MemoryCard({
  memory,
  groupId,
  canModerate = false,
  albums = [],
  index = 0,
}: {
  memory: FeedMemory;
  groupId: string;
  canModerate?: boolean;
  albums?: AlbumRef[];
  index?: number;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const canEdit = memory.isMine || canModerate;
  const showSelect = canEdit && albums.length > 0;
  const initial = memory.uploaderName.trim().charAt(0).toUpperCase() || "?";

  function onDelete() {
    if (!window.confirm("Delete this memory? This can't be undone.")) return;
    setError(null);
    startTransition(async () => {
      const res = await deleteMemoryAction(memory.id, groupId);
      if (res?.error) setError(res.error);
    });
  }

  function moveTo(albumId: string) {
    setError(null);
    startTransition(async () => {
      const res = await setMemoryAlbumAction(
        memory.id,
        groupId,
        albumId || null,
      );
      if (res?.error) setError(res.error);
    });
  }

  return (
    <div
      className="glass glass-hover animate-fade-up overflow-hidden rounded-2xl"
      style={{ animationDelay: `${index * 70}ms` }}
    >
      <div className="flex items-center gap-2.5 p-3.5">
        {memory.uploaderAvatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={memory.uploaderAvatar}
            alt={memory.uploaderName}
            className="h-9 w-9 rounded-full ring-2 ring-[color:var(--border)]"
          />
        ) : (
          <span className="flex h-9 w-9 items-center justify-center rounded-full grad-accent text-sm font-semibold text-white ring-2 ring-[color:var(--border)]">
            {initial}
          </span>
        )}
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-app">
            {memory.uploaderName}
          </p>
          <p className="text-xs text-subtle">{memory.createdAt}</p>
        </div>
        {canEdit && (
          <button
            type="button"
            onClick={onDelete}
            disabled={pending}
            aria-label="Delete memory"
            className="ml-auto flex h-8 w-8 items-center justify-center rounded-lg text-subtle transition hover:bg-soft hover:text-red-500 disabled:opacity-50"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
              <path d="M10 11v6M14 11v6" />
            </svg>
          </button>
        )}
      </div>

      <div className="relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={memory.imageUrl}
          alt={memory.caption || "memory"}
          className="aspect-square w-full object-cover"
        />
      </div>

      {(showSelect || memory.albumTitle || memory.caption) && (
        <div className="space-y-2.5 p-4">
          {showSelect ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-subtle">📁</span>
              <select
                value={memory.albumId ?? ""}
                disabled={pending}
                onChange={(e) => moveTo(e.target.value)}
                className="rounded-lg border border-app bg-soft px-2.5 py-1 text-xs text-app outline-none transition focus:border-indigo-400/60 disabled:opacity-50"
              >
                <option value="">No album</option>
                {albums.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.title}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            memory.albumTitle && (
              <span className="inline-flex items-center gap-1 rounded-full bg-soft px-2.5 py-0.5 text-xs text-muted">
                📁 {memory.albumTitle}
              </span>
            )
          )}
          {memory.caption && (
            <p className="text-sm leading-relaxed text-muted">
              {memory.caption}
            </p>
          )}
        </div>
      )}
      {error && (
        <p className="px-4 pb-3 text-xs text-red-500 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
