"use client";

import { useEffect, useState } from "react";

export function TonPricePill() {
  const [price, setPrice] = useState<number | null>(null);

  useEffect(() => {
    let alive = true;

    const load = async () => {
      try {
        const res = await fetch("/api/stats/ton-price", { cache: "no-store" });
        const data = (await res.json()) as { usd?: number | null };
        if (!alive) return;
        setPrice(typeof data.usd === "number" && Number.isFinite(data.usd) ? data.usd : null);
      } catch {
        if (!alive) return;
        setPrice(null);
      }
    };

    void load();
    const timer = setInterval(load, 30000);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, []);

  return <span>TON {price !== null ? `$${price.toFixed(2)}` : "--"}</span>;
}
