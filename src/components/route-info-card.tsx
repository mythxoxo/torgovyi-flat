"use client";

import type { ExternalTokenRecord } from "../lib/external-tokens/types";
import { useUi } from "./page-shell";

export function RouteInfoCard({ token }: { token: ExternalTokenRecord }) {
  const { locale } = useUi();
  const routeLabel = token.primaryDex ? `${token.primaryDex} route` : locale === "ru" ? "Маршрут пока недоступен" : "Route unavailable";

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-[#c6d4ea]">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[#8ba3c1]">{locale === "ru" ? "DEX маршрут" : "DEX route"}</span>
        <span className="font-semibold text-white">{routeLabel}</span>
      </div>
      <div className="mt-3 flex items-center justify-between gap-3">
        <span className="text-[#8ba3c1]">{locale === "ru" ? "Ликвидность" : "Liquidity"}</span>
        <span className="font-semibold text-white">{token.liquidityGram ? `${token.liquidityGram.toLocaleString("en-US")} GRAM` : "—"}</span>
      </div>
      <p className="mt-3 text-xs leading-5 text-[#8ba3c1]">
        {locale === "ru" ? "Покупка идёт через TonConnect: сначала считаем маршрут, потом собираем draft транзакции для кошелька." : "Buying uses TonConnect: first we quote the route, then build a wallet transaction draft."}
      </p>
    </div>
  );
}
