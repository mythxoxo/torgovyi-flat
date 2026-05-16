"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { buildBuyDraft, isTonAddress, toTestnetAddress } from "../lib/ton";

import { quoteBuy, quoteSell } from "../lib/shared";
import type { TokenRecord } from "../lib/shared";

import { buyToken, resolveReferral, sellToken } from "../lib/api";
import { useWallet } from "./wallet-context";

export function BuySellBox({ token }: { token: TokenRecord }) {
  const router = useRouter();
  const { wallet, walletSource, isTestnet, sendTransaction } = useWallet();
  const [mode, setMode] = useState<"BUY" | "SELL">("BUY");
  const [amount, setAmount] = useState("1");
  const [referralCode, setReferralCode] = useState("");
  const [slippageBps, setSlippageBps] = useState("500");
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

      if (walletSource === "tonconnect" && !isTestnet) {
        throw new Error("Switch your wallet to TON testnet before trading");
      }

      setLoading(true);
      setError("");

      if (
        mode === "BUY" &&
        walletSource === "tonconnect" &&
        isTonAddress(token.contractAddresses.bondingCurve)
      ) {
        const cleanReferralCode = referralCode.trim();
        const resolvedReferral =
          cleanReferralCode.length > 0
            ? await resolveReferral(wallet, cleanReferralCode)
            : null;
        await sendTransaction(
          buildBuyDraft({
            contractAddress: toTestnetAddress(token.contractAddresses.bondingCurve),
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
          slippageBps: Number(slippageBps)
        });
      } else {
        await sellToken(token.id, {
          wallet,
          tokenAmount: numericAmount,
          referralCode: referralCode || undefined,
          slippageBps: Number(slippageBps)
        });
      }

      router.refresh();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Trade failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card-surface rounded-xl p-4">
      <div className="mb-4 flex rounded-lg border border-white/10 p-1">
        {(["BUY", "SELL"] as const).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => {
              setMode(item);
              setAmount(item === "BUY" ? "1" : "1000");
            }}
            className={`flex-1 rounded-md px-4 py-2 text-sm transition ${
              mode === item ? "bg-cyan-300 text-slate-900" : "text-mist"
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      <label className="text-xs uppercase tracking-[0.2em] text-mist">
        {mode === "BUY" ? "TON amount" : "Token amount"}
      </label>
      <input
        value={amount}
        onChange={(event) => setAmount(event.target.value)}
        type="number"
        min="0"
        step="0.01"
        className="mt-2 w-full rounded-lg border border-white/10 bg-black/20 px-4 py-4 text-xl text-white outline-none transition focus:border-cyan-300"
      />

      <div className="mt-3 grid grid-cols-2 gap-3">
        <label className="text-xs text-mist">
          Slippage (bps)
          <input
            value={slippageBps}
            onChange={(event) => setSlippageBps(event.target.value)}
            type="number"
            min="50"
            step="50"
            className="mt-2 w-full rounded-lg border border-white/10 bg-black/20 px-3 py-3 text-sm text-white outline-none focus:border-cyan-300"
          />
        </label>
        <label className="text-xs text-mist">
          Referral
          <input
            value={referralCode}
            onChange={(event) => setReferralCode(event.target.value.toUpperCase())}
            placeholder="Optional"
            className="mt-2 w-full rounded-lg border border-white/10 bg-black/20 px-3 py-3 text-sm text-white outline-none focus:border-cyan-300"
          />
        </label>
      </div>

      <div className="mt-4 rounded-lg border border-white/10 bg-black/20 p-4 text-sm text-mist">
        <p>Wallet: {wallet ? `${wallet.slice(0, 6)}...${wallet.slice(-4)}` : "not connected"}</p>
        <p className="mt-2">
          Your balance: {holderBalance.toFixed(2)} {token.ticker}
        </p>
        <p className="mt-2">Current price: {token.state.currentPriceTon.toFixed(9)} TON</p>
        {quote ? (
          <>
            <p className="mt-2 text-white">
              {"tokenAmount" in quote
                ? `Receive ~ ${quote.tokenAmount.toFixed(2)} ${token.ticker}`
                : `Receive ~ ${quote.tonAmountNet.toFixed(3)} TON`}
            </p>
            <p className="mt-1 text-xs text-mist">
              Fee {quote.feeBreakdown.totalFeeTon.toFixed(4)} TON (
              {(quote.feeBreakdown.totalFeeRate * 100).toFixed(2)}%)
            </p>
            {quote.feeBreakdown.totalFeeRate > 0.02 ? (
              <p className="mt-2 text-xs text-amber-300">Warning: total fee is above 2%.</p>
            ) : null}
          </>
        ) : (
          <p className="mt-2 text-xs text-rose-300">Enter a valid amount for a live quote.</p>
        )}
      </div>

      {token.status !== "BONDING" ? (
        <p className="mt-4 rounded-lg border border-amber-400/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          Bonding curve is closed. Graduation has started and STON.fi migration is tracked in-platform.
        </p>
      ) : mode === "SELL" && walletSource === "tonconnect" ? (
        <p className="mt-4 rounded-lg border border-amber-400/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
          Sell signing is still simulated in MVP until the deployed jetton wallet transfer path is wired on testnet.
        </p>
      ) : walletSource === "tonconnect" && !isTonAddress(token.contractAddresses.bondingCurve) ? (
        <p className="mt-4 rounded-lg border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-100">
          TonConnect session is real, but bonding contract addresses are still mock values until testnet deployment.
        </p>
      ) : null}

      {error ? <p className="mt-4 text-sm text-rose-300">{error}</p> : null}

      <button
        type="button"
        disabled={loading || !quote || token.status !== "BONDING"}
        onClick={submit}
        className="mt-4 w-full rounded-lg bg-cyan-300 px-4 py-4 text-sm font-semibold text-slate-900 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:bg-slate-500"
      >
        {loading ? "Submitting..." : mode === "BUY" ? "Buy now" : "Sell now"}
      </button>
    </div>
  );
}
