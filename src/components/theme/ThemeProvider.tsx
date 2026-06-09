"use client";

import {
  createContext,
  useContext,
  useCallback,
  useSyncExternalStore,
} from "react";

export type Theme = "light" | "dark" | "system";
type Resolved = "light" | "dark";

type ThemeContextValue = {
  theme: Theme;
  resolved: Resolved;
  setTheme: (theme: Theme) => void;
  toggle: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);
const STORAGE_KEY = "theme";

function systemPrefersDark(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );
}

function resolve(theme: Theme): Resolved {
  return theme === "system" ? (systemPrefersDark() ? "dark" : "light") : theme;
}

function applyResolved(resolved: Resolved) {
  document.documentElement.classList.toggle("dark", resolved === "dark");
}

// External store so the theme can be read during render via useSyncExternalStore
// — no setState-inside-effect (which the React compiler flags), and SSR-safe via
// a stable server snapshot. Theme is a single global, so a module singleton fits.
const SERVER_SNAPSHOT: { theme: Theme; resolved: Resolved } = {
  theme: "system",
  resolved: "light",
};
let store: { theme: Theme; resolved: Resolved } = SERVER_SNAPSHOT;
const listeners = new Set<() => void>();

function readStoredTheme(): Theme {
  try {
    return (localStorage.getItem(STORAGE_KEY) as Theme | null) ?? "system";
  } catch {
    return "system";
  }
}

// Recompute the snapshot from storage + OS preference, apply it to the DOM,
// and notify subscribers only when something actually changed (keeps the
// snapshot reference stable, as useSyncExternalStore requires).
function recompute() {
  const theme = readStoredTheme();
  const resolved = resolve(theme);
  if (store.theme !== theme || store.resolved !== resolved) {
    store = { theme, resolved };
    applyResolved(resolved);
    for (const l of listeners) l();
  }
}

function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  const onChange = () => recompute();
  mq.addEventListener("change", onChange); // OS theme changes (system mode)
  window.addEventListener("storage", onChange); // other tabs
  recompute(); // sync to the real value now that we're on the client
  return () => {
    listeners.delete(cb);
    mq.removeEventListener("change", onChange);
    window.removeEventListener("storage", onChange);
  };
}

function setThemeGlobal(next: Theme) {
  try {
    localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // ignore (private mode / storage disabled)
  }
  recompute();
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const snapshot = useSyncExternalStore(
    subscribe,
    () => store,
    () => SERVER_SNAPSHOT,
  );

  const setTheme = useCallback((next: Theme) => setThemeGlobal(next), []);
  const toggle = useCallback(
    () => setThemeGlobal(snapshot.resolved === "dark" ? "light" : "dark"),
    [snapshot.resolved],
  );

  return (
    <ThemeContext.Provider
      value={{
        theme: snapshot.theme,
        resolved: snapshot.resolved,
        setTheme,
        toggle,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
