"use client";

import { useEffect, useState } from "react";
import { getLiveStats } from "@/lib/stats";

export function LivePill({ className = "" }: { className?: string }) {
  const [live, setLive] = useState(25);

  useEffect(() => {
    const fetchStats = () => getLiveStats().then((d) => setLive(d.live)).catch(() => {});
    fetchStats();
    const interval = setInterval(fetchStats, 30_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`flex items-center gap-1.5 text-xs text-[#8ba3c1] ${className}`}>
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#00c896]" />
      <span>{live} live</span>
    </div>
  );
}
