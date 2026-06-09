"use client";

import Link from "next/link";
import { useSearch } from "@/components/search/SearchProvider";
import { ROLE_LABEL, type Group, type Role } from "@/lib/types";

const roleStyle: Record<Role, string> = {
  admin:
    "bg-indigo-500/20 text-indigo-700 ring-1 ring-indigo-400/30 dark:text-indigo-200",
  moderator:
    "bg-teal-500/20 text-teal-700 ring-1 ring-teal-400/30 dark:text-teal-200",
  member: "bg-soft text-muted ring-1 ring-[color:var(--border)]",
  viewer:
    "bg-amber-500/20 text-amber-700 ring-1 ring-amber-400/30 dark:text-amber-200",
};

export default function GroupsList({ groups }: { groups: Group[] }) {
  const { query } = useSearch();
  const q = query.trim().toLowerCase();
  const filtered = q
    ? groups.filter(
        (g) =>
          g.name.toLowerCase().includes(q) ||
          g.description.toLowerCase().includes(q),
      )
    : groups;

  if (groups.length === 0) {
    return (
      <div className="glass rounded-2xl p-16 text-center">
        <p className="text-4xl">📂</p>
        <p className="mt-3 text-muted">You&apos;re not in any group yet.</p>
        <p className="mt-1 text-sm text-subtle">
          Create your first group, or open an invite link a friend sent you.
        </p>
      </div>
    );
  }

  if (filtered.length === 0) {
    return (
      <div className="glass rounded-2xl p-16 text-center">
        <p className="text-4xl">🔍</p>
        <p className="mt-3 text-muted">No groups match “{query}”.</p>
        <p className="mt-1 text-sm text-subtle">Try a different search.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      {filtered.map((group, i) => (
        <div
          key={group.id}
          className="glass glass-hover animate-fade-up group relative overflow-hidden rounded-2xl"
          style={{ animationDelay: `${i * 60}ms` }}
        >
          {group.myRole === "admin" && (
            <Link
              href={`/groups/${group.id}/settings`}
              aria-label={`Manage ${group.name}`}
              className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition hover:bg-black/60"
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
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
              </svg>
            </Link>
          )}
          <Link href={`/groups/${group.id}`} className="block">
            <div
              className="relative h-28 w-full"
              style={{
                backgroundImage: `linear-gradient(135deg, ${group.coverColor}, #a855f7)`,
              }}
            >
              <div className="absolute inset-0 bg-black/10" />
            </div>
            <div className="p-5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-semibold text-app transition group-hover:grad-text">
                  {group.name}
                </h2>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${roleStyle[group.myRole]}`}
                >
                  {ROLE_LABEL[group.myRole]}
                </span>
              </div>
              <p className="mt-1.5 line-clamp-1 text-sm text-faint">
                {group.description || "No description"}
              </p>
              <p className="mt-3 flex items-center gap-1.5 text-xs text-subtle">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-current opacity-50" />
                {group.memberCount}{" "}
                {group.memberCount === 1 ? "member" : "members"}
              </p>
            </div>
          </Link>
        </div>
      ))}
    </div>
  );
}
