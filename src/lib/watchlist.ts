const WATCHLIST_KEY = "tons-of-gram-watchlist:v1";

const canUseStorage = () => typeof window !== "undefined" && Boolean(window.localStorage);

export function getWatchlist(): string[] {
  if (!canUseStorage()) return [];
  try {
    const raw = window.localStorage.getItem(WATCHLIST_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

export function isWatched(id: string): boolean {
  return getWatchlist().includes(id);
}

export function setWatchlist(items: string[]) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(WATCHLIST_KEY, JSON.stringify(Array.from(new Set(items))));
}

export function toggleWatchlist(id: string): boolean {
  const current = getWatchlist();
  const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
  setWatchlist(next);
  return next.includes(id);
}
