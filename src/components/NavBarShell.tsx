"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import ThemeToggle from "@/components/theme/ThemeToggle";
import SearchBar from "@/components/search/SearchBar";
import NotificationsBell from "@/components/NotificationsBell";
import UserMenu from "@/components/UserMenu";

const LINKS = [{ href: "/groups", label: "My Groups" }];

export default function NavBarShell({
  name,
  avatarUrl,
}: {
  name: string;
  avatarUrl: string;
}) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile menu on navigation (handled in link onClick below, so we
  // avoid a setState-inside-effect).
  const closeMobile = () => setMobileOpen(false);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");
  const showSearch = pathname === "/groups";

  return (
    <header
      className={`sticky top-0 z-30 glass border-x-0 border-t-0 transition-all duration-300 ${
        scrolled ? "shadow-lg shadow-indigo-500/5 backdrop-blur-xl" : ""
      }`}
    >
      <div
        className={`mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 transition-all duration-300 ${
          scrolled ? "py-2" : "py-3"
        }`}
      >
        <Link
          href="/groups"
          onClick={closeMobile}
          className="flex shrink-0 items-center gap-2.5 font-bold"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg grad-accent text-base shadow-md shadow-indigo-500/30">
            📸
          </span>
          <span className="grad-text hidden text-lg tracking-tight sm:inline">
            Memora
          </span>
        </Link>

        {showSearch && (
          <div className="mx-auto hidden w-full max-w-xs sm:block">
            <SearchBar />
          </div>
        )}

        {/* Desktop actions */}
        <div className="hidden items-center gap-3 sm:flex">
          <nav className="flex items-center gap-1">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                  isActive(l.href)
                    ? "bg-soft text-app"
                    : "text-faint hover:text-app"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <NotificationsBell />
          <ThemeToggle />
          <UserMenu name={name} avatarUrl={avatarUrl} />
        </div>

        {/* Mobile actions */}
        <div className="flex items-center gap-2 sm:hidden">
          <ThemeToggle />
          <button
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
            className="flex h-9 w-9 items-center justify-center rounded-full glass text-app transition hover:border-app active:scale-90"
          >
            <span className="relative block h-4 w-5">
              <span
                className={`absolute left-0 h-0.5 w-5 rounded-full bg-current transition-all duration-300 ${
                  mobileOpen ? "top-1.5 rotate-45" : "top-0"
                }`}
              />
              <span
                className={`absolute left-0 top-1.5 h-0.5 w-5 rounded-full bg-current transition-all duration-300 ${
                  mobileOpen ? "opacity-0" : "opacity-100"
                }`}
              />
              <span
                className={`absolute left-0 h-0.5 w-5 rounded-full bg-current transition-all duration-300 ${
                  mobileOpen ? "top-1.5 -rotate-45" : "top-3"
                }`}
              />
            </span>
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      <div
        className={`overflow-hidden transition-all duration-300 sm:hidden ${
          mobileOpen ? "max-h-96" : "max-h-0"
        }`}
      >
        <div className="space-y-4 border-t border-app px-4 py-4">
          {showSearch && <SearchBar />}
          <nav className="flex flex-col gap-1">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={closeMobile}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isActive(l.href)
                    ? "bg-soft text-app"
                    : "text-faint hover:text-app"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center justify-between border-t border-app pt-4">
            <div className="flex items-center gap-2.5">
              <UserMenu name={name} avatarUrl={avatarUrl} />
              <span className="text-sm font-medium text-app">{name}</span>
            </div>
            <NotificationsBell />
          </div>
        </div>
      </div>
    </header>
  );
}
