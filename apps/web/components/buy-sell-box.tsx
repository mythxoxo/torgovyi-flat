"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { buildBuyDraft, isTonAddress } from "@meme-launchpad/sdk";

import { quoteBuy, quoteSell } from "@meme-launchpad/shared";
import type { TokenRecord } from "@meme-launchpad/shared";

import { buyToken, resolveReferral, sellToken } from "../lib/api";
import { useWallet } from "./wallet-context";

export function BuySellBox({ token }: { token: TokenRecord }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { wallet, walletSource, isMainnet, sendTransaction } = useWallet();
  const [mode, setMode] = useState<"BUY" | "SELL">("BUY");
  const [amount, setAmount] = useState("1");
  const referralCode = searchParams.get("ref") ?? "";
  const [slippage, setSlippage] = useState("5");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const numericAmount = Number(amount);
  const holderBalance = token.holderBalances[wallet] ?? 0;
  const quote =
    numericAmount > 0 && token.status === "BONDING"
      ? (() => {
          try {
            return mode === "BUY"
              ? quoteBuy(token.state, numericAmount, token.creatorTax)
              : quoteSell(token.state, numericAmount, token.creatorTax);
          } catch {
            return null;
          }
        })()
      : null;

  const submit = async () => {
    try {
      if (!wallet) {
        throw new Error("Connect a TON wallet before trading");
      }

      if (walletSource === "tonconnect" && !isMainnet) {
        throw new Error("Switch your wallet to TON mainnet before trading");
      }

      setLoading(true);
      setError("");

      if (
        mode === "BUY" &&
        walletSource === "tonconnect" &&
        isTonAddress(token.contractAddresses.bondingCurve)
      ) {
        const resolvedReferral =
          referralCode.trim().length > 0
            ? await resolveReferral(referralCode || undefined, wallet)
            : null;
        await sendTransaction(
          buildBuyDraft({
            contractAddress: token.contractAddresses.bondingCurve,
            tonAmountNanoTon: BigInt(Math.floor(numericAmount * 1_000_000_000)),
            referralAddress: resolvedReferral?.wallet ?? undefined,
            minTokensOut:
              quote && "tokenAmount" in quote
                ? BigInt(Math.max(0, Math.floor(quote.tokenAmount)))
                : 0n
          })
        );
      }

      if (mode === "BUY") {
        await buyToken(token.id, {
          wallet,
          tonAmount: numericAmount,
          referralCode: referralCode || undefined,
          slippageBps: Math.round(Number(slippage) * 100)
        });
      } else {
        await sellToken(token.id, {
          wallet,
          tokenAmount: numericAmount,
          referralCode: referralCode || undefined,
          slippageBps: Math.round(Number(slippage) * 100)
        });
      }

      await import("@twa-dev/sdk").then(({ default: WebApp }) => {
        WebApp.HapticFeedback.notificationOccurred("success");
        WebApp.showPopup?.({ title: "Готово", message: "Транзакция подтверждена", buttons: [{ type: "ok" }] });
      });
      router.refresh();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Trade failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card mx-4 mt-4 space-y-4 p-4">
      <div className="grid grid-cols-2 gap-1 rounded-xl bg-[#1a2235] p-1">
        {(["BUY", "SELL"] as const).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => {
              void import("@twa-dev/sdk").then(({ default: WebApp }) => WebApp.HapticFeedback.impactOccurred("light"));
              setMode(item);
              setAmount(item === "BUY" ? "1" : "1000");
            }}
            className={`rounded-lg py-2.5 text-sm font-bold transition ${
              mode === item
                ? item === "BUY"
                  ? "bg-[#00c896] text-black"
                  : "bg-[#ff4757] text-white"
                : "text-[#8ba3c1]"
            }`}
          >
            {item === "BUY" ? "КУПИТЬ" : "ПРОДАТЬ"}
          </button>
        ))}
      </div>

      <div className="relative">
        <input
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          type="number"
          min="0"
          step="0.01"
          placeholder="0.0"
          className="w-full rounded-xl border border-[#1e3a5f] bg-[#1a2235] px-4 py-3 pr-16 font-mono text-lg text-white outline-none focus:border-[#0088cc]"
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[#8ba3c1]">
          {mode === "BUY" ? "💎" : `$${token.ticker}`}
        </span>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {["0.1", "0.5", "1", "5"].map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setAmount(value)}
            className="rounded-lg border border-[#1e3a5f] bg-[#1a2235] py-2 text-xs text-[#8ba3c1] transition hover:border-[#0088cc] hover:text-white"
          >
            {value} 💎
          </button>
        ))}
      </div>

      <div className="rounded-xl bg-[#1a2235] px-4 py-3">
        <div className="flex justify-between">
          <span className="text-sm text-[#8ba3c1]">Получишь ~</span>
          <span className="font-mono font-bold text-white">
            {quote
              ? "tokenAmount" in quote
                ? `${quote.tokenAmount.toFixed(2)} $${token.ticker}`
                : `${quote.tonAmountNet.toFixed(2)} 💎 TON`
              : "—"}
          </span>
        </div>
        {quote ? (
          <p className="mt-2 text-xs text-[#8ba3c1]">
            Комиссия {quote.feeBreakdown.totalFeeTon.toFixed(2)} TON ({(quote.feeBreakdown.totalFeeRate * 100).toFixed(2)}%)
          </p>
        ) : null}
      </div>

      <div className="flex items-center justify-between text-xs text-[#8ba3c1]">
        <span>Проскальзывание</span>
        <label className="flex items-center gap-1 text-[#0088cc]">
          <input
            value={slippage}
            onChange={(event) => setSlippage(event.target.value)}
            type="number"
            min="0.5"
            step="0.5"
            className="w-12 rounded border border-[#1e3a5f] bg-[#1a2235] px-1 py-0.5 text-right font-mono text-xs text-white"
          />
          %
        </label>
      </div>

      <p className="text-xs text-[#8ba3c1]">
        Баланс: {holderBalance.toFixed(2)} ${token.ticker} · Цена: {token.state.currentPriceTon.toFixed(2)} TON
      </p>

      {token.status !== "BONDING" ? (
        <p className="rounded-lg border border-amber-400/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          Bonding curve is closed. Graduation has started and STON.fi migration is tracked in-platform.
        </p>
      ) : mode === "SELL" && walletSource === "tonconnect" ? (
        <p className="rounded-lg border border-amber-400/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
          Sell signing is still simulated in MVP until the deployed jetton wallet transfer path is wired.
        </p>
      ) : walletSource === "tonconnect" && !isTonAddress(token.contractAddresses.bondingCurve) ? (
        <p className="rounded-lg border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-100">
          TonConnect session is real, but bonding contract addresses are still mock values until deployment.
        </p>
      ) : null}

      {error ? <p className="text-sm text-rose-300">{error}</p> : null}

      <button
        type="button"
        disabled={loading || !quote || token.status !== "BONDING"}
        onClick={() => {
          void import("@twa-dev/sdk").then(({ default: WebApp }) => WebApp.HapticFeedback.impactOccurred("medium"));
          void submit();
        }}
        className={`w-full rounded-xl py-4 text-base font-bold transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 ${
          mode === "BUY" ? "bg-gradient-to-r from-[#0088cc] to-[#00c896] text-black" : "bg-[#ff4757] text-white"
        }`}
      >
        {loading ? "..." : mode === "BUY" ? "🚀 Купить" : "💸 Продать"}
      </button>

      <p className="text-center text-xs text-[#8ba3c1]">Транзакция в TON Wallet · ~3 сек</p>
    </div>
  );
}
