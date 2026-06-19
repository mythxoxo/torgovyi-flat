"use client";

import { useState } from "react";
import type { ExternalTokenRecord } from "../lib/external-tokens/types";
import type { DexQuote } from "../lib/dex/types";
import { useUi } from "./page-shell";
import { RouteInfoCard } from "./route-info-card";
import { useWallet } from "./wallet-context";

export function DexBuyBox({ token }: { token: ExternalTokenRecord }) {
  const { locale } = useUi();
  const { wallet, isConnected, isMainnet } = useWallet();
  const [amount, setAmount] = useState("1");
  const [loading, setLoading] = useState(false);
  const [quote, setQuote] = useState<DexQuote | null>(null);
  const [error, setError] = useState("");

  const fetchQuote = async () => {
    setLoading(true);
    setError("");
    setQuote(null);
    try {
      const parsedAmount = Number(amount.replace(",", "."));
      if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
        throw new Error(locale === "ru" ? "Введи сумму больше нуля" : "Enter an amount above zero");
      }

      const offerUnits = String(Math.floor(parsedAmount * 1_000_000_000));
      const res = await fetch("/api/dex/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userWalletAddress: wallet,
          offerAddress: "ton",
          askAddress: token.address,
          offerUnits,
          slippageTolerance: "0.01"
        })
      });
      const data = await res.json() as { ok: boolean; quote?: DexQuote; error?: string };
      if (!data.ok || !data.quote) throw new Error(data.error || "Quote failed");
      setQuote(data.quote);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Quote failed");
    } finally {
      setLoading(false);
    }
  };

  const disabled = !isConnected || !isMainnet || loading;

  return (
    <div className="glass-card rounded-[24px] p-4 space-y-4">
      <div>
        <h3 className="font-display text-xl font-bold text-white">{locale === "ru" ? "Покупка через DEX" : "DEX buy"}</h3>
        <p className="mt-2 text-sm leading-6 text-[#8ba3c1]">
          {locale === "ru" ? "Quote-only режим. Реальная покупка будет включена после swap-draft аудита." : "Quote-only mode. Real buying will be enabled after swap-draft audit."}
        </p>
      </div>

      <RouteInfoCard token={token} />

      <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
        <label className="text-xs text-[#8ba3c1]">{locale === "ru" ? "Сумма" : "Amount"}</label>
        <input value={amount} onChange={(event) => setAmount(event.target.value)} inputMode="decimal" className="mt-2 w-full bg-transparent font-mono text-lg text-white outline-none" />
      </div>

      <button type="button" disabled={disabled} onClick={fetchQuote} className={`btn-primary flex w-full items-center justify-center ${disabled ? "cursor-not-allowed opacity-50" : ""}`}>
        {loading ? (locale === "ru" ? "Считаю..." : "Quoting...") : (locale === "ru" ? "Получить quote" : "Get quote")}
      </button>

      {quote ? <div className="rounded-2xl border border-[#22c55e]/30 bg-[#22c55e]/10 p-3 text-sm text-[#86efac]">{locale === "ru" ? "Quote получен" : "Quote ready"}: {quote.dex}</div> : null}
      {error ? <div className="rounded-2xl border border-[#ff4757]/30 bg-[#ff4757]/10 p-3 text-sm text-[#ff8a95]">{error}</div> : null}

      <p className="text-xs leading-5 text-[#8ba3c1]">
        {locale === "ru" ? "Кнопка покупки остаётся выключенной. Это не swap, а только проверка маршрута." : "Buy stays disabled. This is route checking only, not a swap."}
      </p>
    </div>
  );
}
