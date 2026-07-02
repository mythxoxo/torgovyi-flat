import Link from "next/link";
import { Rocket, Search } from "lucide-react";
import type { TokenRecord } from "../lib/shared";
import { TokenCard } from "./token-card";
import { useUi } from "./page-shell";

function TokenCardSkeleton() {
  return <div className="h-[420px] animate-pulse rounded-[28px] border border-white/10 bg-white/[0.045]" />;
}

export function TokenList({ tokens, loading = false, searchQuery = "" }: { tokens: TokenRecord[]; loading?: boolean; searchQuery?: string }) {
  const { t, locale } = useUi();

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => <TokenCardSkeleton key={i} />)}
      </div>
    );
  }

  if (searchQuery && tokens.length === 0) {
    return (
      <div className="pd-empty rounded-[30px] p-10 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl border border-white/10 bg-white/[0.055]"><Search className="h-7 w-7 text-[#5ac8fa]" /></div>
        <h3 className="mt-5 font-display text-2xl font-black tracking-[-0.04em] text-white">{t.misc.nothingFound}</h3>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-[#90a3b8]">{t.misc.tryAnother}</p>
      </div>
    );
  }

  if (tokens.length === 0) {
    return (
      <div className="pd-empty rounded-[30px] p-10 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl border border-white/10 bg-white/[0.055]"><Rocket className="h-7 w-7 text-[#ff7fc3]" /></div>
        <h3 className="mt-5 font-display text-3xl font-black tracking-[-0.05em] text-white">{t.home.launchesTitle}</h3>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-[#90a3b8]">{locale === "ru" ? "Первый индексированный запуск появится здесь. Пока витрина остаётся чистой и готовой к live feed." : "The first indexed launch will appear here. Until then the feed stays clean and ready."}</p>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/create?target=8888" className="pd-btn-primary">{t.home.launchMain}</Link>
          <Link href="/markets" className="pd-btn-secondary">{t.nav.markets}</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
      {tokens.map((token) => <TokenCard key={token.id} token={token} />)}
    </div>
  );
}
