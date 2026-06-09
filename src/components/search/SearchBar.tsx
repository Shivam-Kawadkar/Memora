"use client";

import { useSearch } from "./SearchProvider";

export default function SearchBar() {
  const { query, setQuery } = useSearch();

  return (
    <div className="relative w-full">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle"
      >
        <circle cx="11" cy="11" r="7" />
        <path d="m21 21-4.3-4.3" />
      </svg>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search your groups…"
        className="w-full rounded-xl border border-app bg-soft py-2 pl-9 pr-8 text-sm text-app outline-none transition placeholder:text-subtle focus:border-indigo-400/60"
      />
      {query && (
        <button
          onClick={() => setQuery("")}
          aria-label="Clear search"
          className="absolute right-2 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full text-subtle transition hover:text-app"
        >
          ✕
        </button>
      )}
    </div>
  );
}
