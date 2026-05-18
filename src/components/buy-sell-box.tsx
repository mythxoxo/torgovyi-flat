"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { buildBuyDraft, isTonAddress, toMainnetAddress } from "../lib/ton";
import { quoteBuy, quoteSell } from "../lib/shared";
import type { TokenRecord } from "../lib/shared";
import { buyToken, resolveReferral, sellToken } from "../lib/api";
import { useWallet } from "./wallet-context";
import { getTelegramWebApp } from "../lib/telegram";

export function BuySellBox({ token }: { token: TokenRecord }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { wallet, walletSource, isMainnet, sendTransaction } = useWallet();
  const [mode, setMode] = useState<"BUY" | "SELL">("BUY");
  const [amount, setAmount] = useState("1");
  const [slippagePercent, setSlippagePercent] = useState("5");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const app = getTelegramWebApp();
  const referralCode = searchParams.get("ref") || undefined;

  const numericAmount = Number(amount);
  const quote = useMemo(() => {
    if (!(numericAmount > 0) || token.status !== "BONDING") return null;
    try {
      return mode === "BUY"
        ? quoteBuy(token.state, numericAmount, token.creatorTax)
        : quoteSell(token.state, numericAmount, token.creatorTax);
    } catch {
      return null;
    }
  }, [mode, numericAmount, token]);

  const estimatedOutput = quote
    ? "tokenAmount" in quote
      ? `${quote.tokenAmount.toFixed(2)} $${token.ticker}`
      : `${quote.tonAmountNet.toFixed(2)} 💎 TON`
    : "—";

  const submit = async () => {
    try {
      if (!wallet) throw new Error("Сначала подключи TON кошелёк");
      if (walletSource === "tonconnect" && !isMainnet) throw new Error("Нужен TON mainnet");
      if (!quote) throw new Error("Введи корректную сумму");

      app?.HapticFeedback.impactOccurred("medium");
      setLoading(true);
      setError("");

      if (mode === "BUY" && walletSource === "tonconnect" && isTonAddress(token.contractAddresses.bondingCurve)) {
        const resolvedReferral = referralCode ? await resolveReferral(wallet, referralCode) : null;
        await sendTransaction(
          buildBuyDraft({
            contractAddress: toMainnetAddress(token.contractAddresses.bondingCurve),
            tonAmountNanoTon: BigInt(Math.floor(numericAmount * 1_000_000_000)),
            referralAddress: resolvedReferral?.wallet ?? undefined,
            minTokensOut: "tokenAmount" in quote ? BigInt(Math.max(0, Math.floor(quote.tokenAmount))) : 0n
          })
        );
      }

      if (mode === "BUY") {
        await buyToken(token.id, wallet, numericAmount, referralCode, Math.round(Number(slippagePercent) * 100));
        app?.HapticFeedback.notificationOccurred("success");
        app?.showPopup({
          title: "Покупка выполнена",
          message: `Куплено ${quote && "tokenAmount" in quote ? quote.tokenAmount.toFixed(2) : 0} $${token.ticker} за ${numericAmount} TON`,
          buttons: [{ type: "ok" }]
        });
      } else {
        await sellToken(token.id, wallet, numericAmount, referralCode, Math.round(Number(slippagePercent) * 100));
        app?.HapticFeedback.notificationOccurred("success");
        app?.showPopup({
          title: "Продажа выполнена",
          message: `Продано ${numericAmount} $${token.ticker}`,
          buttons: [{ type: "ok" }]
        });
      }

      router.refresh();
    } catch (caughtError) {
      app?.HapticFeedback.notificationOccurred("error");
      setError(caughtError instanceof Error ? caughtError.message : "Ошибка сделки");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card p-4 space-y-4">
      <div className="grid grid-cols-2 gap-1 rounded-xl bg-[#1a2235] p-1">
        <button className={mode === "BUY" ? "rounded-lg bg-[#00c896] py-2.5 text-sm font-bold text-black" : "rounded-lg py-2.5 text-sm text-[#8ba3c1]"} onClick={() => setMode("BUY")}>КУПИТЬ</button>
        <button className={mode === "SELL" ? "rounded-lg bg-[#ff4757] py-2.5 text-sm font-bold text-white" : "rounded-lg py-2.5 text-sm text-[#8ba3c1]"} onClick={() => setMode("SELL")}>ПРОДАТЬ</button>
      </div>

      <div>
        <label className="mb-1.5 block text-xs text-[#8ba3c1]">{mode === "BUY" ? "Сумма в TON" : "Количество токенов"}</label>
        <div className="relative">
          <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.0" className="w-full rounded-xl border border-[#1e3a5f] bg-[#1a2235] px-4 py-3 pr-16 font-mono text-lg text-white focus:border-[#0088cc] focus:outline-none" />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[#8ba3c1]">{mode === "BUY" ? "💎" : `$${token.ticker}`}</span>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {["0.1", "0.5", "1", "5"].map((val) => (
          <button key={val} onClick={() => setAmount(val)} className="rounded-lg border border-[#1e3a5f] bg-[#1a2235] py-2 text-xs text-[#8ba3c1] transition-all hover:border-[#0088cc] hover:text-white">
            {val} 💎
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between rounded-xl bg-[#1a2235] px-4 py-3">
        <span className="text-sm text-[#8ba3c1]">Получишь ~</span>
        <span className="font-mono font-bold text-white">{estimatedOutput}</span>
      </div>

      <div className="flex items-center justify-between text-xs text-[#8ba3c1]">
        <span>Проскальзывание</span>
        <button className="font-mono text-[#0088cc]">{slippagePercent}% ✏️</button>
      </div>

      {error ? <p className="text-sm text-[#ff4757]">{error}</p> : null}

      <button
        onClick={submit}
        disabled={loading || !quote || token.status !== "BONDING"}
        className={`w-full rounded-xl py-4 text-base font-bold transition-all active:scale-[0.98] disabled:opacity-40 ${mode === "BUY" ? "bg-gradient-to-r from-[#0088cc] to-[#00c896] text-black" : "bg-[#ff4757] text-white"}`}
      >
        {loading ? "Отправка..." : mode === "BUY" ? "🚀 Купить" : "💸 Продать"}
      </button>

      <p className="text-center text-xs text-[#8ba3c1]">Транзакция в TON Wallet · ~3 сек</p>
    </div>
  );
}
