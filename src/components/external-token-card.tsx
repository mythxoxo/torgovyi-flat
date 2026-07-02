"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { ExternalTokenRecord } from "../lib/external-tokens/types";
import { RiskBadges } from "./risk-badges";
import { WatchlistButton } from "./watchlist-button";
import { useUi } from "./page-shell";

const compact = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 2 });
const priceFormat = new Intl.NumberFormat("en-US", { maximumFractionDigits: 6 });
const usdPriceFormat = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 8 });
const usdMetricFormat = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", notation: "compact", maximumFractionDigits: 2 });

const normalizeMetric = (value?: number) => {
  if (!value || !Number.isFinite(value) || value <= 0) return null;
  return value;
};

const formatGramMetric = (value?: number) => {
  const normalized = normalizeMetric(value);
  return normalized ? `${compact.format(normalized)} GRAM` : "N/A";
};

const formatUsdMetric = (value?: number) => {
  const normalized = normalizeMetric(value);
  return normalized ? usdMetricFormat.format(normalized) : "N/A";
};

const formatPrice = (token: ExternalTokenRecord) => {
  if (token.priceGram && Number.isFinite(token.priceGram)) return `${priceFormat.format(token.priceGram)} GRAM`;
  if (token.priceUsd && Number.isFinite(token.priceUsd)) return usdPriceFormat.format(token.priceUsd);
  return "N/A";
};

const formatLiquidity = (token: ExternalTokenRecord) => token.liquidityGram ? formatGramMetric(token.liquidityGram) : formatUsdMetric(token.liquidityUsd);
const formatVolume = (token: ExternalTokenRecord) => token.volume24hGram ? formatGramMetric(token.volume24hGram) : formatUsdMetric(token.volume24hUsd);
const dexLabel = (dex: string) => dex === "DEDUST" ? "DeDust" : dex === "STONFI" ? "STON.fi" : dex;

function isUsableTokenImage(value?: string) {
  if (typeof value !== "string") return false;
  const normalized = value.trim();
  return /^https?:\/\//i.test(normalized) || normalized.startsWith("/") || normalized.startsWith("ipfs://");
}

function normalizeTokenImage(value?: string) {
  if (!isUsableTokenImage(value)) return "";
  const normalized = value!.trim();
  if (normalized.startsWith("ipfs://")) return `https://ipfs.io/ipfs/${normalized.slice("ipfs://".length)}`;
  return normalized;
}

function TokenPlaceholder({ symbol }: { symbol: string }) {
  return <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_top,#24324a,#08111f_72%)] text-sm font-black uppercase tracking-[0.18em] text-[#c9f0ff]">{symbol.slice(0, 4)}</div>;
}

export function ExternalTokenCard({ token }: { token: ExternalTokenRecord }) {
  const { locale } = useUi();
  const initialImage = useMemo(() => normalizeTokenImage(token.image), [token.image]);
  const [imageSrc, setImageSrc] = useState(initialImage);
  const change = typeof token.change24h === "number" && Number.isFinite(token.change24h) ? token.change24h : null;
  const changeClass = change == null ? "text-[#90a3b8]" : change >= 0 ? "text-[#9cff2e]" : "text-[#ff5c7a]";
  const dexes = token.dexes.length ? token.dexes : token.primaryDex ? [token.primaryDex] : [];
  const price = formatPrice(token);
  const liquidity = formatLiquidity(token);
  const volume = formatVolume(token);

  return (
    <Link href={`/token/${encodeURIComponent(token.address)}`} className="group block overflow-hidden rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(17,23,34,0.88),rgba(8,12,18,0.96))] p-5 shadow-[0_22px_80px_rgba(0,0,0,0.28)] transition duration-200 hover:-translate-y-0.5 hover:border-[#ff3d9a]/35 hover:shadow-[0_28px_95px_rgba(255,61,154,0.12)]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.055] shadow-[0_16px_44px_rgba(0,0,0,0.24)]">
            {imageSrc ? <Image src={imageSrc} alt={token.name} width={64} height={64} className="h-full w-full object-cover" onError={() => setImageSrc("")} unoptimized /> : <TokenPlaceholder symbol={token.symbol} />}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap gap-1.5">
              <span className="pd-chip pd-chip-hot">External</span>
              {dexes.map((dex) => <span key={dex} className="pd-chip pd-chip-blue">{dexLabel(dex)}</span>)}
            </div>
            <h3 className="mt-3 truncate font-display text-2xl font-black tracking-[-0.045em] text-white">{token.name}</h3>
            <div className="truncate font-mono text-sm font-bold text-[#5ac8fa]">{token.symbol}</div>
          </div>
        </div>
        <WatchlistButton id={token.address} />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
        <div className="min-w-0 rounded-[20px] border border-white/10 bg-white/[0.045] p-3.5">
          <div className="text-xs text-[#90a3b8]">{locale === "ru" ? "Цена" : "Price"}</div>
          <div className="mt-1 truncate font-black text-white" title={price}>{price}</div>
        </div>
        <div className="min-w-0 rounded-[20px] border border-white/10 bg-white/[0.045] p-3.5">
          <div className="text-xs text-[#90a3b8]">24h</div>
          <div className={`mt-1 truncate font-black ${changeClass}`}>{change == null ? "N/A" : `${change > 0 ? "+" : ""}${change.toFixed(1)}%`}</div>
        </div>
        <div className="min-w-0 rounded-[20px] border border-white/10 bg-white/[0.045] p-3.5">
          <div className="text-xs text-[#90a3b8]">{locale === "ru" ? "Ликвидность" : "Liquidity"}</div>
          <div className="mt-1 truncate font-black text-white" title={liquidity}>{liquidity}</div>
        </div>
        <div className="min-w-0 rounded-[20px] border border-white/10 bg-white/[0.045] p-3.5">
          <div className="text-xs text-[#90a3b8]">{locale === "ru" ? "Объём 24ч" : "24h volume"}</div>
          <div className="mt-1 truncate font-black text-white" title={volume}>{volume}</div>
        </div>
      </div>

      <div className="mt-4 overflow-hidden"><RiskBadges token={token} /></div>
    </Link>
  );
}
