"use client";

import { useEffect, useMemo, useState } from "react";
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

  useEffect(() => {
    let cancelled = false;
    if (!wallet || !isConnected) {
      setAssets(null);
      setError("");
      return;
    }

    setLoading(true);
    setError("");

    fetch(`/api/wallet/assets?address=${encodeURIComponent(wallet)}`, { cache: "no-store" })
      .then((res) => res.json() as Promise<WalletAssetsResponse>)
      .then((data) => {
        if (!cancelled) setAssets(data);
      })
      .catch(() => {
        if (!cancelled) setError(locale === "ru" ? "Не удалось загрузить активы кошелька." : "Failed to load wallet assets.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [wallet, isConnected, locale]);

  const holding = useMemo(() => {
    const needle = token.address.toLowerCase();
    return assets?.jettons.find((jetton) => (jetton.master || "").toLowerCase() === needle) ?? null;
  }, [assets, token.address]);

  const hasHolding = Boolean(holding && holding.balanceFormatted !== "0");

  return (
    <div className="glass-card rounded-[24px] p-5">
      <h2 className="font-display text-2xl font-bold text-white">{locale === "ru" ? "Твой кошелёк" : "Your wallet"}</h2>
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
                ? (locale === "ru" ? "Токен уже есть в кошельке. Это хороший базис для будущего sell flow." : "This token is already in your wallet. Good baseline for a future sell flow.")
                : (locale === "ru" ? "Токен в кошельке пока не найден. Сначала купи его через DEX flow справа." : "This token was not found in your wallet yet. Buy it first using the DEX flow on the right.")}
            </div>

            {assets?.message ? <div className="text-xs text-[#8ba3c1]">{assets.message}</div> : null}
          </>
        )}
      </div>
    </div>
  );
}
