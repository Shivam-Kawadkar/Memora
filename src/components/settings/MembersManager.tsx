"use client";

import { useState, useTransition } from "react";
import { setMemberRoleAction, removeMemberAction } from "@/lib/actions";
import { ROLE_LABEL, type Member, type Role } from "@/lib/types";

const ROLES: Role[] = ["admin", "moderator", "member", "viewer"];

function Avatar({ name, url }: { name: string; url: string }) {
  const initial = name.trim().charAt(0).toUpperCase() || "?";
  if (url) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={url}
        alt={name}
        className="h-10 w-10 rounded-full ring-2 ring-[color:var(--border)]"
      />
    );
  }
  return (
    <span className="flex h-10 w-10 items-center justify-center rounded-full grad-accent text-sm font-semibold text-white ring-2 ring-[color:var(--border)]">
      {initial}
    </span>
  );
}

export default function MembersManager({
  groupId,
  members,
  isAdmin,
}: {
  groupId: string;
  members: Member[];
  isAdmin: boolean;
}) {
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function changeRole(userId: string, role: Role) {
    setError(null);
    setBusyId(userId);
    startTransition(async () => {
      const res = await setMemberRoleAction(groupId, userId, role);
      if (res?.error) setError(res.error);
      setBusyId(null);
    });
  }

  function remove(userId: string, name: string) {
    if (!window.confirm(`Remove ${name} from this group?`)) return;
    setError(null);
    setBusyId(userId);
    startTransition(async () => {
      const res = await removeMemberAction(groupId, userId);
      if (res?.error) setError(res.error);
      setBusyId(null);
    });
  }

  return (
    <section className="glass rounded-2xl p-6">
      <h2 className="text-lg font-semibold text-app">
        Members{" "}
        <span className="text-sm font-normal text-subtle">
          ({members.length})
        </span>
      </h2>
      {error && (
        <p className="mt-3 text-sm text-red-500 dark:text-red-400">{error}</p>
      )}

      <ul className="mt-4 divide-y divide-[color:var(--border)]">
        {members.map((m) => (
          <li key={m.userId} className="flex items-center gap-3 py-3">
            <Avatar name={m.name} url={m.avatarUrl} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-app">
                {m.name}
                {m.isMe && <span className="ml-1.5 text-xs text-subtle">(you)</span>}
              </p>
              {!isAdmin && (
                <p className="text-xs text-faint">{ROLE_LABEL[m.role]}</p>
              )}
            </div>

            {isAdmin && !m.isMe ? (
              <div className="flex items-center gap-2">
                <select
                  value={m.role}
                  disabled={busyId === m.userId}
                  onChange={(e) => changeRole(m.userId, e.target.value as Role)}
                  className="rounded-lg border border-app bg-soft px-2.5 py-1.5 text-sm text-app outline-none transition focus:border-indigo-400/60 disabled:opacity-50"
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {ROLE_LABEL[r]}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => remove(m.userId, m.name)}
                  disabled={busyId === m.userId}
                  aria-label={`Remove ${m.name}`}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-subtle transition hover:bg-soft hover:text-red-500 disabled:opacity-50"
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
              </div>
            ) : (
              isAdmin && (
                <span className="rounded-full bg-soft px-2.5 py-0.5 text-xs font-medium text-muted">
                  {ROLE_LABEL[m.role]}
                </span>
              )
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
