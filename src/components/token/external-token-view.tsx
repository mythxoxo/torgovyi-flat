"use client";

import Image from "next/image";
import { Copy } from "lucide-react";
import type { ExternalTokenRecord } from "../../lib/external-tokens/types";
import { DexBuyBox } from "../dex-buy-box";
import { RiskBadges } from "../risk-badges";
import { WatchlistButton } from "../watchlist-button";
import { useUi } from "../page-shell";

export function ExternalTokenView({ token }: { token: ExternalTokenRecord }) {
  const { locale } = useUi();
  const copyAddress = async () => navigator.clipboard.writeText(token.address);
  const change = token.change24h ?? 0;
  const changeClass = change >= 0 ? "text-[#86efac]" : "text-[#ff8a95]";

  return (
    <div className="space-y-4 pb-24 pt-4">
      <div className="space-y-4 px-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="h-14 w-14 overflow-hidden rounded-xl border border-[#1e3a5f] bg-white/5">
              <Image src={token.image || "/brand/img_04.jpg"} alt={token.name} width={56} height={56} className="h-full w-full object-cover" />
            </div>
            <div className="min-w-0">
              <div className="text-xs uppercase tracking-[0.18em] text-[#5ac8fa]">External token</div>
              <h1 className="truncate font-display text-xl font-bold text-white">{token.name}</h1>
              <span className="font-mono text-sm text-[#2aabee]">{token.symbol}</span>
            </div>
          </div>
          <WatchlistButton id={token.address} />
        </div>

        <p className="text-sm leading-6 text-[#8ba3c1]">
          {locale === "ru" ? "Этот токен не был запущен через TONS of GRAM. Покупка через DEX — дополнительная фича, launchpad остаётся основой продукта." : "This token was not launched through TONS of GRAM. DEX buying is a secondary utility; the launchpad remains the core product."}
        </p>

        <div className="flex items-center gap-2 rounded-lg bg-[#1a2235] px-3 py-2">
          <span className="flex-1 truncate font-mono text-xs text-[#8ba3c1]">{token.address.slice(0, 6)}...{token.address.slice(-4)}</span>
          <button onClick={copyAddress}><Copy className="h-4 w-4 text-[#8ba3c1]" /></button>
        </div>

        <RiskBadges token={token} />
      </div>

      <div className="grid gap-4 px-4 xl:grid-cols-[1.4fr_0.8fr]">
        <div className="glass-card rounded-[24px] p-5">
          <h2 className="font-display text-2xl font-bold text-white">{locale === "ru" ? "Рынок" : "Market"}</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/8 bg-white/5 p-4"><div className="text-xs text-[#8ba3c1]">{locale === "ru" ? "Цена" : "Price"}</div><div className="mt-1 font-semibold text-white">{token.priceGram ? `${token.priceGram.toLocaleString("en-US")} GRAM` : "—"}</div></div>
            <div className="rounded-2xl border border-white/8 bg-white/5 p-4"><div className="text-xs text-[#8ba3c1]">24h</div><div className={`mt-1 font-semibold ${changeClass}`}>{change > 0 ? "+" : ""}{change.toFixed(1)}%</div></div>
            <div className="rounded-2xl border border-white/8 bg-white/5 p-4"><div className="text-xs text-[#8ba3c1]">{locale === "ru" ? "Ликвидность" : "Liquidity"}</div><div className="mt-1 font-semibold text-white">{token.liquidityGram ? `${token.liquidityGram.toLocaleString("en-US")} GRAM` : "—"}</div></div>
            <div className="rounded-2xl border border-white/8 bg-white/5 p-4"><div className="text-xs text-[#8ba3c1]">DEX</div><div className="mt-1 font-semibold text-white">{token.primaryDex ?? "No route"}</div></div>
          </div>
        </div>
        <DexBuyBox token={token} />
      </div>
    </div>
  );
}
