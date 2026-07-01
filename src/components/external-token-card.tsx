"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo, useState } from "react";
import type { ExternalTokenRecord } from "../lib/external-tokens/types";
import { RiskBadges } from "./risk-badges";
import { WatchlistButton } from "./watchlist-button";
import { useUi } from "./page-shell";

const compact = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 2 });
const priceFormat = new Intl.NumberFormat("en-US", { maximumFractionDigits: 6 });

const normalizeMetric = (value?: number) => {
  if (!value || !Number.isFinite(value) || value <= 0) return null;
  return value;
};

const formatGramMetric = (value?: number) => {
  const normalized = normalizeMetric(value);
  return normalized ? `${compact.format(normalized)} GRAM` : "N/A";
};

const formatPrice = (token: ExternalTokenRecord) => {
  if (token.priceUsd && Number.isFinite(token.priceUsd)) return `$${priceFormat.format(token.priceUsd)}`;
  if (token.priceGram && Number.isFinite(token.priceGram)) return `${priceFormat.format(token.priceGram)} GRAM`;
  return "N/A";
};

const dexLabel = (dex: string) => dex === "DEDUST" ? "DeDust" : dex === "STONFI" ? "STON.fi" : dex;

function isUsableTokenImage(value?: string) {
  return typeof value === "string" && (/^https?:\/\//i.test(value.trim()) || value.startsWith("/"));
}

function TokenPlaceholder({ symbol }: { symbol: string }) {
  return (
    <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_top,#1f3f65,#0f1724_70%)] text-sm font-black uppercase tracking-[0.18em] text-[#bfe9ff]">
      {symbol.slice(0, 4)}
    </div>
  );
}

export function ExternalTokenCard({ token }: { token: ExternalTokenRecord }) {
  const { locale } = useUi();
  const initialImage = useMemo(() => (isUsableTokenImage(token.image) ? token.image!.trim() : ""), [token.image]);
  const [imageSrc, setImageSrc] = useState(initialImage);
  const change = typeof token.change24h === "number" && Number.isFinite(token.change24h) ? token.change24h : null;
  const changeClass = change == null ? "text-[#8ba3c1]" : change >= 0 ? "text-[#86efac]" : "text-[#ff8a95]";
  const dexes = token.dexes.length ? token.dexes : token.primaryDex ? [token.primaryDex] : [];

  return (
    <Link href={`/token/${encodeURIComponent(token.address)}`} className="glass-card block overflow-hidden rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,24,39,0.9),rgba(9,15,26,0.98))] p-5 transition hover:border-[#2aabee]/30">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-[#1e3a5f] bg-white/5">
            {imageSrc ? (
              <Image src={imageSrc} alt={token.name} width={56} height={56} className="h-full w-full object-cover" onError={() => setImageSrc("")} unoptimized />
            ) : (
              <TokenPlaceholder symbol={token.symbol} />
            )}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap gap-1 text-xs uppercase tracking-[0.16em] text-[#8ba3c1]"><span>External</span>{dexes.map((dex) => <span key={dex} className="rounded-full border border-[#2aabee]/30 bg-[#2aabee]/10 px-2 py-0.5 tracking-normal text-[#bfe9ff]">{dexLabel(dex)}</span>)}</div>
            <h3 className="mt-1 truncate font-display text-xl font-bold text-white">{token.name}</h3>
            <div className="truncate font-mono text-sm text-[#5ac8fa]">{token.symbol}</div>
          </div>
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
          <div className={`mt-1 truncate font-semibold ${changeClass}`}>{change == null ? "N/A" : `${change > 0 ? "+" : ""}${change.toFixed(1)}%`}</div>
        </div>
        <div className="min-w-0 rounded-2xl border border-white/8 bg-white/5 p-3">
          <div className="text-xs text-[#8ba3c1]">{locale === "ru" ? "Ликвидность" : "Liquidity"}</div>
          <div className="mt-1 truncate font-semibold text-white" title={formatGramMetric(token.liquidityGram)}>{formatGramMetric(token.liquidityGram)}</div>
        </div>
        <div className="min-w-0 rounded-2xl border border-white/8 bg-white/5 p-3">
          <div className="text-xs text-[#8ba3c1]">{locale === "ru" ? "Объём 24ч" : "24h volume"}</div>
          <div className="mt-1 truncate font-semibold text-white" title={formatGramMetric(token.volume24hGram)}>{formatGramMetric(token.volume24hGram)}</div>
        </div>
      </div>

      <div className="mt-4 overflow-hidden">
        <RiskBadges token={token} />
      </div>
    </Link>
  );
}
