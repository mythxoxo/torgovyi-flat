"use client";

import { Star } from "lucide-react";
import { useEffect, useState } from "react";
import { isWatched, toggleWatchlist } from "../lib/watchlist";
import { useUi } from "./page-shell";

export function WatchlistButton({ id }: { id: string }) {
  const { locale } = useUi();
  const [active, setActive] = useState(false);

  useEffect(() => {
    setActive(isWatched(id));
  }, [id]);

  return (
    <button
      type="button"
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        setActive(toggleWatchlist(id));
      }}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${active ? "border-[#f5a623]/40 bg-[#f5a623]/15 text-[#ffd38a]" : "border-white/10 bg-white/5 text-[#c6d4ea] hover:border-[#2aabee]/40 hover:text-white"}`}
    >
      <Star className={active ? "h-3.5 w-3.5 fill-current" : "h-3.5 w-3.5"} />
      {active ? (locale === "ru" ? "В списке" : "Watching") : (locale === "ru" ? "Следить" : "Watch")}
    </button>
  );
}
