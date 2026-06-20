"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ExternalTokenRecord } from "../../lib/external-tokens/types";
import { useUi } from "../page-shell";
import { useWallet } from "../wallet-context";

type WalletAssetsResponse = {
  ok: boolean;
  message?: string;
  tonBalanceFormatted?: string | null;
  jettons: Array<{
    master?: string;
    symbol?: string;
    name?: string;
    balanceFormatted: string;
    valueUsd?: number | null;
  }>;
};

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2
});

export function ExternalTokenWalletPanel({ token }: { token: ExternalTokenRecord }) {
  const { locale } = useUi();
  const { wallet, isConnected } = useWallet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [assets, setAssets] = useState<WalletAssetsResponse | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string>("");

  const loadAssets = useCallback(async () => {
    if (!wallet || !isConnected) {
      setAssets(null);
      setError("");
      setUpdatedAt("");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/wallet/assets?address=${encodeURIComponent(wallet)}`, { cache: "no-store" });
      const data = (await res.json()) as WalletAssetsResponse;
      setAssets(data);
      setUpdatedAt(new Date().toLocaleTimeString(locale === "ru" ? "ru-RU" : "en-US", { hour: "2-digit", minute: "2-digit" }));
    } catch {
      setError(locale === "ru" ? "Не удалось загрузить активы кошелька." : "Failed to load wallet assets.");
    } finally {
      setLoading(false);
    }
  }, [wallet, isConnected, locale]);

  useEffect(() => {
    void loadAssets();
  }, [loadAssets]);

  const holding = useMemo(() => {
    const needle = token.address.toLowerCase();
    return assets?.jettons.find((jetton) => (jetton.master || "").toLowerCase() === needle) ?? null;
  }, [assets, token.address]);

  const hasHolding = Boolean(holding && holding.balanceFormatted !== "0");

  return (
    <div className="glass-card rounded-[24px] p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold text-white">{locale === "ru" ? "Твой кошелёк" : "Your wallet"}</h2>
          {updatedAt ? <p className="mt-1 text-xs text-[#8ba3c1]">{locale === "ru" ? `Обновлено: ${updatedAt}` : `Updated: ${updatedAt}`}</p> : null}
        </div>
        {isConnected ? (
          <button
            type="button"
            onClick={() => void loadAssets()}
            disabled={loading}
            className={`rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-[#c7d5e8] hover:bg-white/10 ${loading ? "cursor-not-allowed opacity-50" : ""}`}
          >
            {locale === "ru" ? "Обновить" : "Refresh"}
          </button>
        ) : null}
      </div>

      <div className="mt-4 space-y-3 text-sm">
        {!isConnected ? (
          <div className="rounded-2xl border border-white/8 bg-white/5 p-4 text-[#8ba3c1]">
            {locale === "ru" ? "Подключи кошелёк, чтобы увидеть баланс TON и наличие этого токена." : "Connect your wallet to see TON balance and whether you already hold this token."}
          </div>
        ) : loading ? (
          <div className="rounded-2xl border border-white/8 bg-white/5 p-4 text-[#8ba3c1]">
            {locale === "ru" ? "Загружаю активы кошелька..." : "Loading wallet assets..."}
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-[#ff4757]/30 bg-[#ff4757]/10 p-4 text-[#ff8a95]">{error}</div>
        ) : (
          <>
            <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
              <div className="text-xs text-[#8ba3c1]">TON</div>
              <div className="mt-1 font-semibold text-white">{assets?.tonBalanceFormatted ?? "—"}</div>
            </div>

            <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
              <div className="text-xs text-[#8ba3c1]">{locale === "ru" ? "Баланс этого токена" : "This token balance"}</div>
              <div className="mt-1 font-semibold text-white">{holding?.balanceFormatted ?? "0"} {token.symbol}</div>
              {holding?.valueUsd ? <div className="mt-1 text-xs text-[#8ba3c1]">{usd.format(holding.valueUsd)}</div> : null}
            </div>

            <div className={`rounded-2xl border p-4 ${hasHolding ? "border-[#22c55e]/30 bg-[#22c55e]/10 text-[#d9ffe5]" : "border-[#ffb84d]/30 bg-[#ffb84d]/10 text-[#ffd79a]"}`}>
              {hasHolding
                ? (locale === "ru" ? "Токен уже есть в кошельке. Можно отслеживать позицию, а sell flow логично добивать следующим шагом." : "This token is already in your wallet. You can track the position here, and sell flow is the logical next step.")
                : (locale === "ru" ? "Токен в кошельке пока не найден. Сначала купи его через DEX flow справа." : "This token was not found in your wallet yet. Buy it first using the DEX flow on the right.")}
            </div>

            {assets?.message ? <div className="text-xs text-[#8ba3c1]">{assets.message}</div> : null}
          </>
        )}
      </div>
    </div>
  );
}
