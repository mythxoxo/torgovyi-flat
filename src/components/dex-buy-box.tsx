"use client";

import type { ExternalTokenRecord } from "../lib/external-tokens/types";
import { useUi } from "./page-shell";
import { RouteInfoCard } from "./route-info-card";

export function DexBuyBox({ token }: { token: ExternalTokenRecord }) {
  const { locale } = useUi();

  return (
    <div className="glass-card rounded-[24px] p-4 space-y-4">
      <div>
        <h3 className="font-display text-xl font-bold text-white">{locale === "ru" ? "Покупка через DEX" : "DEX buy"}</h3>
        <p className="mt-2 text-sm leading-6 text-[#8ba3c1]">
          {locale === "ru" ? "Дополнительная фича. Основной продукт остаётся launchpad." : "Secondary utility. The core product remains the launchpad."}
        </p>
      </div>

      <RouteInfoCard token={token} />

      <button disabled className="btn-primary flex w-full cursor-not-allowed items-center justify-center opacity-50">
        {locale === "ru" ? "DEX покупка пока выключена" : "DEX buying disabled"}
      </button>

      <p className="text-xs leading-5 text-[#8ba3c1]">
        {locale === "ru" ? "Реальные swaps появятся после STON.fi quote-аудита и проверки маршрута." : "Real swaps will be enabled after STON.fi quote audit and route validation."}
      </p>
    </div>
  );
}
