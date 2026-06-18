import Link from "next/link";
import type { TokenRecord } from "../lib/shared";
import { TokenCard } from "./token-card";
import { useUi } from "./page-shell";

function TokenCardSkeleton() {
  return <div className="aspect-[0.84] animate-pulse rounded-[24px] bg-[var(--gram-soft)]" />;
}

export function TokenList({ tokens, loading = false, searchQuery = "" }: { tokens: TokenRecord[]; loading?: boolean; searchQuery?: string }) {
  const { t } = useUi();

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <TokenCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (searchQuery && tokens.length === 0) {
    return (
      <div className="rounded-[24px] border border-[var(--gram-border)] bg-[var(--gram-card)] p-8 text-center">
        <h3 className="mt-2 font-display text-2xl font-bold text-[var(--gram-text)]">{t.misc.nothingFound}</h3>
        <p className="mt-3 text-sm leading-6 text-[var(--gram-muted)]">{t.misc.tryAnother}</p>
      </div>
    );
  }

  if (tokens.length === 0) {
    return (
      <div className="rounded-[24px] border border-[var(--gram-border)] bg-[var(--gram-card)] p-8 text-center">
        <h3 className="mt-2 font-display text-2xl font-bold text-[var(--gram-text)]">{t.home.launchesTitle}</h3>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-[var(--gram-muted)]">{t.misc.noLaunches}</p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/create?target=8888" className="rounded-full bg-[#0088cc] px-5 py-2.5 text-center text-sm font-semibold text-white">{t.home.launchMain}</Link>
          <Link href="/markets" className="rounded-full border border-[var(--gram-border)] bg-[var(--gram-soft)] px-5 py-2.5 text-center text-sm font-semibold text-[var(--gram-text)]">{t.nav.markets}</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {tokens.map((token) => (
        <TokenCard key={token.id} token={token} />
      ))}
    </div>
  );
}
