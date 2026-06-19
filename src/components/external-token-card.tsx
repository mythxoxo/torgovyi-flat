"use client";

import Link from "next/link";
import type { ExternalTokenRecord } from "../lib/external-tokens/types";
import { RiskBadges } from "./risk-badges";
import { WatchlistButton } from "./watchlist-button";
import { useUi } from "./page-shell";

const compact = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 2 });
const priceFormat = new Intl.NumberFormat("en-US", { maximumFractionDigits: 6 });

const normalizeMetric = (value?: number) => {
  if (!value || !Number.isFinite(value) || value <= 0) return null;
  let normalized = value;
  for (let i = 0; i < 3 && normalized > 1_000_000_000_000; i += 1) {
    normalized = normalized / 1_000_000_000;
  }
  if (!Number.isFinite(normalized) || normalized <= 0 || normalized > 1_000_000_000_000) return null;
  return normalized;
};

const formatGramMetric = (value?: number) => {
  const normalized = normalizeMetric(value);
  return normalized ? `${compact.format(normalized)} GRAM` : "—";
};

const formatPrice = (token: ExternalTokenRecord) => {
  if (token.priceUsd && Number.isFinite(token.priceUsd)) return `$${priceFormat.format(token.priceUsd)}`;
  if (token.priceGram && Number.isFinite(token.priceGram)) return `${priceFormat.format(token.priceGram)} GRAM`;
  return "—";
};

export function ExternalTokenCard({ token }: { token: ExternalTokenRecord }) {
  const { locale } = useUi();
  const change = token.change24h ?? 0;
  const changeClass = change >= 0 ? "text-[#86efac]" : "text-[#ff8a95]";

  return (
    <Link href={`/token/${encodeURIComponent(token.address)}`} className="glass-card block overflow-hidden rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,24,39,0.9),rgba(9,15,26,0.98))] p-5 transition hover:border-[#2aabee]/30">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs uppercase tracking-[0.16em] text-[#8ba3c1]">External</div>
          <h3 className="mt-1 truncate font-display text-xl font-bold text-white">{token.name}</h3>
          <div className="truncate font-mono text-sm text-[#5ac8fa]">{token.symbol}</div>
        </div>
        <WatchlistButton id={token.address} />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
        <div className="min-w-0 rounded-2xl border border-white/8 bg-white/5 p-3">
          <div className="text-xs text-[#8ba3c1]">{locale === "ru" ? "Цена" : "Price"}</div>
          <div className="mt-1 truncate font-semibold text-white" title={formatPrice(token)}>{formatPrice(token)}</div>
        </div>
        <div className="min-w-0 rounded-2xl border border-white/8 bg-white/5 p-3">
          <div className="text-xs text-[#8ba3c1]">24h</div>
          <div className={`mt-1 truncate font-semibold ${changeClass}`}>{change > 0 ? "+" : ""}{change.toFixed(1)}%</div>
        </div>
        <div className="min-w-0 rounded-2xl border border-white/8 bg-white/5 p-3">
          <div className="text-xs text-[#8ba3c1]">{locale === "ru" ? "Ликвидность" : "Liquidity"}</div>
          <div className="mt-1 truncate font-semibold text-white" title={formatGramMetric(token.liquidityGram)}>{formatGramMetric(token.liquidityGram)}</div>
        </div>
        <div className="min-w-0 rounded-2xl border border-white/8 bg-white/5 p-3">
          <div className="text-xs text-[#8ba3c1]">DEX</div>
          <div className="mt-1 truncate font-semibold text-white" title={token.primaryDex ?? "No route"}>{token.primaryDex ?? "No route"}</div>
        </div>
      </div>

      <div className="mt-4 overflow-hidden">
        <RiskBadges token={token} />
      </div>
    </Link>
  );
}
