"use client";

import { useEffect, useState } from "react";

import type { TokenRecord } from "../lib/shared";
import { TokenList } from "../components/token-list";
import { getTokenList } from "../lib/api";

export default function HomePage() {
  const [tokens, setTokens] = useState<TokenRecord[]>([]);
  const [filter, setFilter] = useState<"trending" | "new" | "almost-graduated" | "graduated" | "top-volume">("trending");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    getTokenList(filter)
      .then(setTokens)
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Failed to load tokens");
      })
      .finally(() => setLoading(false));
  }, [filter]);

  const filters = [
    { value: "trending" as const, label: "Trending" },
    { value: "new" as const, label: "New" },
    { value: "almost-graduated" as const, label: "Almost Grad" },
    { value: "graduated" as const, label: "Graduated" },
    { value: "top-volume" as const, label: "Top Volume" }
  ];

  return (
    <div className="space-y-4">
      <section>
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Tokens</p>
        <h2 className="mt-2 text-2xl font-semibold text-white">Live launches</h2>
      </section>

      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setFilter(f.value)}
            className={`rounded-lg border px-3 py-1.5 text-xs transition ${
              filter === f.value
                ? "border-cyan-300 text-cyan-200 bg-cyan-300/10"
                : "border-white/10 text-mist hover:border-white/30"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {error ? <p className="text-sm text-rose-300">{error}</p> : null}

      {loading ? (
        <div className="card-surface rounded-xl p-4 text-sm text-mist">Loading tokens...</div>
      ) : (
        <TokenList tokens={tokens} />
      )}
    </div>
  );
}
