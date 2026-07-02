"use client";

import Image from "next/image";
import { Copy } from "lucide-react";
import type { ExternalTokenRecord } from "../../lib/external-tokens/types";
import { DexBuyBox } from "../dex-buy-box";
import { RiskBadges } from "../risk-badges";
import { WatchlistButton } from "../watchlist-button";
import { useUi } from "../page-shell";
import { ExternalTokenWalletPanel } from "./external-token-wallet-panel";

const dexLabel = (dex: string) => dex === "DEDUST" ? "DeDust" : dex === "STONFI" ? "STON.fi" : dex;

export function ExternalTokenView({ token }: { token: ExternalTokenRecord }) {
  const { locale } = useUi();
  const copyAddress = async () => navigator.clipboard.writeText(token.address);
  const change = token.change24h ?? 0;
  const changeClass = change >= 0 ? "text-[#9cff2e]" : "text-[#ff5c7a]";
  const dexes = token.dexes.length ? token.dexes : token.primaryDex ? [token.primaryDex] : [];

  return (
    <div className="space-y-5 pb-24 pt-2">
      <section className="pd-panel overflow-hidden rounded-[34px] p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-[0_18px_60px_rgba(0,0,0,0.28)]">
              <Image src={token.image || "/brand/img_04.jpg"} alt={token.name} width={80} height={80} className="h-full w-full object-cover" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap gap-2">
                <span className="pd-chip pd-chip-hot">External token</span>
                {dexes.map((dex) => <span key={dex} className="pd-chip pd-chip-blue">{dexLabel(dex)}</span>)}
                <span className={change >= 0 ? "pd-chip pd-chip-live" : "pd-chip pd-chip-hot"}>{change > 0 ? "+" : ""}{change.toFixed(1)}% 24h</span>
              </div>
              <h1 className="mt-4 truncate font-display text-5xl font-black tracking-[-0.065em] text-white">{token.name}</h1>
              <div className="mt-1 font-mono text-sm font-bold text-[#5ac8fa]">{token.symbol}</div>
            </div>
          </div>
          <WatchlistButton id={token.address} />
        </div>

        <p className="mt-5 max-w-3xl text-sm leading-7 text-[#90a3b8]">
          {locale === "ru" ? "External DEX токен. Торговля идёт через выбранный DEX-маршрут и подпись в кошельке; TONS of GRAM не хранит средства." : "External DEX token. Trading goes through the selected DEX route and wallet signature; TONS of GRAM does not custody funds."}
        </p>

        <div className="mt-5 flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.045] px-3 py-2">
          <span className="flex-1 truncate font-mono text-xs text-[#90a3b8]">{token.address.slice(0, 6)}...{token.address.slice(-4)}</span>
          <button onClick={copyAddress}><Copy className="h-4 w-4 text-[#90a3b8]" /></button>
        </div>
        <div className="mt-4"><RiskBadges token={token} /></div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-5">
          <div className="pd-panel rounded-[28px] p-5">
            <h2 className="font-display text-2xl font-black text-white">{locale === "ru" ? "Рынок" : "Market"}</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="pd-stat"><div className="text-xs text-[#90a3b8]">{locale === "ru" ? "Цена" : "Price"}</div><div className="mt-1 font-black text-white">{token.priceGram ? `${token.priceGram.toLocaleString("en-US")} GRAM` : token.priceUsd ? `$${token.priceUsd.toLocaleString("en-US")}` : "N/A"}</div></div>
              <div className="pd-stat"><div className="text-xs text-[#90a3b8]">24h</div><div className={`mt-1 font-black ${changeClass}`}>{change > 0 ? "+" : ""}{change.toFixed(1)}%</div></div>
              <div className="pd-stat"><div className="text-xs text-[#90a3b8]">{locale === "ru" ? "Ликвидность" : "Liquidity"}</div><div className="mt-1 font-black text-white">{token.liquidityGram ? `${token.liquidityGram.toLocaleString("en-US")} GRAM` : token.liquidityUsd ? `$${token.liquidityUsd.toLocaleString("en-US")}` : "N/A"}</div></div>
              <div className="pd-stat"><div className="text-xs text-[#90a3b8]">DEX</div><div className="mt-1 flex flex-wrap gap-1">{dexes.length ? dexes.map((dex) => <span key={dex} className="pd-chip pd-chip-blue">{dexLabel(dex)}</span>) : <span className="font-semibold text-white">No route</span>}</div></div>
            </div>
          </div>
          <ExternalTokenWalletPanel token={token} />
        </div>
        <DexBuyBox token={token} />
      </div>
    </div>
  );
}
