import Image from "next/image";
import Link from "next/link";
import type { ExternalTokenRecord } from "../lib/external-tokens/types";
import { RiskBadges } from "./risk-badges";
import { WatchlistButton } from "./watchlist-button";
import { useUi } from "./page-shell";

export function ExternalTokenCard({ token }: { token: ExternalTokenRecord }) {
  const { locale } = useUi();
  const change = token.change24h ?? 0;
  const changeClass = change >= 0 ? "text-[#86efac]" : "text-[#ff8a95]";

  return (
    <Link href={`/token/${encodeURIComponent(token.address)}`} className="glass-card block rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,24,39,0.9),rgba(9,15,26,0.98))] p-5 transition hover:border-[#2aabee]/30">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="h-12 w-12 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
            <Image src={token.image || "/brand/img_04.jpg"} alt={token.name} width={48} height={48} className="h-full w-full object-cover" />
          </div>
          <div className="min-w-0">
            <div className="text-xs uppercase tracking-[0.16em] text-[#8ba3c1]">External</div>
            <h3 className="mt-1 truncate font-display text-xl font-bold text-white">{token.name}</h3>
            <div className="font-mono text-sm text-[#5ac8fa]">{token.symbol}</div>
          </div>
        </div>
        <WatchlistButton id={token.address} />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-2xl border border-white/8 bg-white/5 p-3">
          <div className="text-xs text-[#8ba3c1]">{locale === "ru" ? "Цена" : "Price"}</div>
          <div className="mt-1 font-semibold text-white">{token.priceGram ? `${token.priceGram.toLocaleString("en-US")} GRAM` : "—"}</div>
        </div>
        <div className="rounded-2xl border border-white/8 bg-white/5 p-3">
          <div className="text-xs text-[#8ba3c1]">24h</div>
          <div className={`mt-1 font-semibold ${changeClass}`}>{change > 0 ? "+" : ""}{change.toFixed(1)}%</div>
        </div>
        <div className="rounded-2xl border border-white/8 bg-white/5 p-3">
          <div className="text-xs text-[#8ba3c1]">{locale === "ru" ? "Ликвидность" : "Liquidity"}</div>
          <div className="mt-1 font-semibold text-white">{token.liquidityGram ? `${token.liquidityGram.toLocaleString("en-US")} GRAM` : "—"}</div>
        </div>
        <div className="rounded-2xl border border-white/8 bg-white/5 p-3">
          <div className="text-xs text-[#8ba3c1]">DEX</div>
          <div className="mt-1 font-semibold text-white">{token.primaryDex ?? "No route"}</div>
        </div>
      </div>

      <div className="mt-4">
        <RiskBadges token={token} />
      </div>
    </Link>
  );
}
