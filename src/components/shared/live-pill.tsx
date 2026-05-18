"use client";

import { useEffect, useState } from "react";

export function LivePill() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const res = await fetch("/api/stats/live", { cache: "no-store" });
        const data = (await res.json()) as { live?: number; count?: number };
        if (!alive) return;
        setCount(data.live ?? data.count ?? null);
      } catch {}
    };
    load();
    const timer = setInterval(load, 15000);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, []);

  return <span>{count ?? "--"} live</span>;
}
