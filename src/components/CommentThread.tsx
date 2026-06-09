"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  addCommentAction,
  editCommentAction,
  deleteCommentAction,
} from "@/lib/actions";
import type { Comment } from "@/lib/types";

function Avatar({ name, url }: { name: string; url: string }) {
  const initial = name.trim().charAt(0).toUpperCase() || "?";
  if (url) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={url}
        alt={name}
        loading="lazy"
        decoding="async"
        className="h-8 w-8 shrink-0 rounded-full ring-2 ring-[color:var(--border)]"
      />
    );
  }
  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full grad-accent text-xs font-semibold text-white ring-2 ring-[color:var(--border)]">
      {initial}
    </span>
  );
}

function CommentItem({
  comment,
  memoryId,
  groupId,
  canModerate,
  onChanged,
}: {
  comment: Comment;
  memoryId: string;
  groupId: string;
  canModerate: boolean;
  onChanged: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const canDelete = comment.isMine || canModerate;

  function onEdit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const res = await editCommentAction(
        comment.id,
        memoryId,
        groupId,
        formData,
      );
      if (res?.error) setError(res.error);
      else {
        setEditing(false);
        onChanged();
      }
    });
  }

  function onDelete() {
    if (!window.confirm("Delete this comment?")) return;
    setError(null);
    startTransition(async () => {
      const res = await deleteCommentAction(comment.id, memoryId, groupId);
      if (res?.error) setError(res.error);
      else onChanged();
    });
  }

  return (
    <div className="flex gap-3">
      <Avatar name={comment.authorName} url={comment.authorAvatar} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-app">
            {comment.authorName}
          </span>
          <span className="text-xs text-subtle">{comment.createdAt}</span>
        </div>

        {editing ? (
          <form action={onEdit} className="mt-1.5">
            <textarea
              name="body"
              defaultValue={comment.body}
              rows={2}
              maxLength={1000}
              placeholder="Edit your comment…"
              className="w-full resize-none rounded-xl border border-app bg-soft px-3 py-2 text-sm text-app outline-none transition placeholder:text-subtle focus:border-indigo-400/60"
            />
            <div className="mt-1.5 flex items-center gap-2">
              <button
                type="submit"
                disabled={pending}
                className="rounded-lg grad-accent px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="text-xs text-faint transition hover:text-app"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <p className="mt-0.5 whitespace-pre-wrap break-words text-sm text-muted">
            {comment.body}
          </p>
        )}

        {!editing && (comment.isMine || canDelete) && (
          <div className="mt-1 flex items-center gap-3">
            {comment.isMine && (
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="text-xs text-subtle transition hover:text-app"
              >
                Edit
              </button>
            )}
            {canDelete && (
              <button
                type="button"
                onClick={onDelete}
                disabled={pending}
                className="text-xs text-subtle transition hover:text-red-500 disabled:opacity-50"
              >
                Delete
              </button>
            )}
          </div>
        )}
        {error && (
          <p className="mt-1 text-xs text-red-500 dark:text-red-400">{error}</p>
        )}
      </div>
    </div>
  );
}

export default function CommentThread({
  memoryId,
  groupId,
  comments,
  canModerate,
}: {
  memoryId: string;
  groupId: string;
  comments: Comment[];
  canModerate: boolean;
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onAdd(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const res = await addCommentAction(memoryId, groupId, formData);
      if (res?.error) setError(res.error);
      else {
        formRef.current?.reset();
        router.refresh();
      }
    });
  }

  return (
    <div>
      <form ref={formRef} action={onAdd} className="flex flex-col gap-2">
        <textarea
          name="body"
          rows={2}
          maxLength={1000}
          placeholder="Add a comment…"
          className="w-full resize-none rounded-xl border border-app bg-soft px-4 py-2.5 text-sm text-app outline-none transition placeholder:text-subtle focus:border-indigo-400/60"
        />
        {error && (
          <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
        )}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={pending}
            className="rounded-xl grad-accent px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:shadow-indigo-500/40 active:scale-[0.97] disabled:opacity-60"
          >
            {pending ? "Posting…" : "Post"}
          </button>
        </div>
      </form>

      <div className="mt-6 space-y-5">
        {comments.length === 0 ? (
          <p className="text-sm text-subtle">
            No comments yet. Be the first to say something.
          </p>
        ) : (
          comments.map((c) => (
            <CommentItem
              key={c.id}
              comment={c}
              memoryId={memoryId}
              groupId={groupId}
              canModerate={canModerate}
              onChanged={() => router.refresh()}
            />
          ))
        )}
      </div>
    </div>
  );
}
