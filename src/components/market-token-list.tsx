import type { MarketToken } from "../lib/market/types";
import { MarketTokenCard } from "./market-token-card";
import { useUi } from "./page-shell";

function MarketSkeleton() {
  return <div className="aspect-[0.84] animate-pulse rounded-[24px] bg-[var(--gram-soft)]" />;
}

export function MarketTokenList({ tokens, loading = false, emptyTitle, emptyText }: { tokens: MarketToken[]; loading?: boolean; emptyTitle?: string; emptyText?: string }) {
  const { locale } = useUi();

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => <MarketSkeleton key={i} />)}
      </div>
    );
  }

  if (tokens.length === 0) {
    return (
      <div className="rounded-[24px] border border-[var(--gram-border)] bg-[var(--gram-card)] p-8 text-center">
        <h3 className="font-display text-2xl font-bold text-[var(--gram-text)]">{emptyTitle ?? (locale === "ru" ? "Пока пусто" : "Nothing here yet")}</h3>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-[var(--gram-muted)]">{emptyText ?? (locale === "ru" ? "Launchpad-рынок появится после индексированных запусков." : "Launchpad market data will appear after indexed launches.")}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {tokens.map((token) => (
        <MarketTokenCard key={token.source === "LAUNCHPAD" ? token.token.id : token.token.address} marketToken={token} />
      ))}
    </div>
  );
}
