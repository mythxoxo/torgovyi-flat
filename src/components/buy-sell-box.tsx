"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { buildBuyDraft, isTonAddress, toMainnetAddress } from "../lib/onchain";
import { quoteBuy, spotPriceForSupply } from "../lib/shared";
import type { TokenRecord } from "../lib/shared";
import { buyToken, resolveReferral } from "../lib/api";
import { useWallet } from "./wallet-context";
import { WalletConnectButton } from "./wallet-connect-button";
import { getTelegramWebApp } from "../lib/telegram";
import { getTonPrice, formatTonUsd } from "../lib/market/ton-price";

export function BuySellBox({ token }: { token: TokenRecord }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { wallet, walletSource, isMainnet, sendTransaction } = useWallet();
  const [mode, setMode] = useState<"buy" | "sell">("buy");
  const [amount, setAmount] = useState("1");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [stage, setStage] = useState("prepared");
  const [gramPrice, setGramPrice] = useState<number | null>(null);
  const app = getTelegramWebApp();
  const referralCode = searchParams.get("ref") || undefined;

  useEffect(() => { getTonPrice().then((r) => setGramPrice(r.usd)).catch(() => setGramPrice(null)); }, []);

  const numericAmount = Number(amount);
  const buyQuote = useMemo(() => {
    if (!(numericAmount > 0) || token.status !== "BONDING") return null;
    try { return quoteBuy(token.state, numericAmount, token.creatorTax); } catch { return null; }
  }, [numericAmount, token]);

  const visibleCurrentPrice = useMemo(() => {
    const soldSupply = token.state.soldSupply || 0;
    const collectedTon = token.state.collectedTon ?? token.state.reserveTon ?? 0;
    if (buyQuote) return buyQuote.newState.currentPriceTon;
    if (token.state.currentPriceTon > 0) return token.state.currentPriceTon;
    if (token.status === "BONDING") return spotPriceForSupply(soldSupply);
    if (token.state.circulatingSupply > 0 && token.state.marketCapTon > 0) return token.state.marketCapTon / token.state.circulatingSupply;
    if (soldSupply > 0 && collectedTon > 0) return collectedTon / soldSupply;
    return 0;
  }, [buyQuote, token]);

  const submitBuy = async () => {
    if (!buyQuote) throw new Error("Enter a valid amount");
    let resolvedReferral: Awaited<ReturnType<typeof resolveReferral>> | null = null;
    if (referralCode) resolvedReferral = await resolveReferral(wallet!, referralCode);
    if (!isTonAddress(token.contractAddresses.bondingCurve)) throw new Error("Pool address is not indexed yet");
    const minTokensOut = BigInt(Math.max(0, Math.floor(buyQuote.tokenAmount * 0.95)));
    const tx = await sendTransaction(buildBuyDraft({ poolAddress: toMainnetAddress(token.contractAddresses.bondingCurve), tonAmount: numericAmount, referralAddress: resolvedReferral?.wallet ?? undefined, minTokensOut }));
    const txHash = typeof tx === "object" && tx && "boc" in tx ? String((tx as { boc?: string }).boc || "") : undefined;
    await buyToken(token.id, wallet!, numericAmount, referralCode, 500, txHash);
  };

  const submit = async () => {
    try {
      if (!wallet) throw new Error("Connect wallet to buy");
      if (walletSource === "tonconnect" && !isMainnet) throw new Error("GRAM mainnet required");
      if (mode !== "buy") throw new Error("Bonding sell is not available yet");
      setStage("waiting for wallet signature");
      setLoading(true);
      setError("");
      await submitBuy();
      setStage("submitted / indexer sync pending");
      setTimeout(() => router.refresh(), 4000);
      setTimeout(() => router.refresh(), 12000);
    } catch (caughtError) {
      setStage("failed");
      const message = caughtError instanceof Error ? caughtError.message : "Trade failed";
      setError(message);
      app?.HapticFeedback?.notificationOccurred("error");
    } finally { setLoading(false); }
  };

  if (!wallet) return <div className="glass-card rounded-[24px] p-6 text-center"><h3 className="text-xl font-semibold text-white">Connect wallet to trade</h3><p className="mt-2 text-sm text-[#8ba3c1]">Manual signing only. No custody, no private keys.</p><div className="mt-5 flex justify-center"><WalletConnectButton /></div></div>;

  const activeQuote = mode === "buy" ? buyQuote : null;

  return (
    <div className="glass-card rounded-[24px] p-4 space-y-4">
      <div className="grid grid-cols-2 gap-2 rounded-xl border border-[#1e3a5f] bg-[#111827] p-1">
        <button onClick={() => setMode("buy")} className={`rounded-lg py-2 text-sm font-medium ${mode === "buy" ? "bg-[#2aabee] text-white" : "text-[#8ba3c1]"}`}>Buy</button>
        <button onClick={() => setMode("sell")} className={`rounded-lg py-2 text-sm font-medium ${mode === "sell" ? "bg-[#2aabee] text-white" : "text-[#8ba3c1]"}`}>Sell</button>
      </div>

      <div><label className="mb-1.5 block text-xs text-[#8ba3c1]">{mode === "buy" ? "Amount in GRAM" : `Amount in ${token.ticker}`}</label><div className="relative"><input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.0" className="w-full rounded-xl border border-[#1e3a5f] bg-[#1a2235] px-4 py-3 pr-20 font-mono text-lg text-white focus:border-[#2aabee] focus:outline-none" /><span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[#8ba3c1]">{mode === "buy" ? "GRAM" : token.ticker}</span></div></div>
      <div className="grid grid-cols-4 gap-2">{(mode === "buy" ? ["0.1", "0.5", "1", "5"] : ["100", "1000", "10000", "50000"]).map((val) => <button key={val} onClick={() => setAmount(val)} className="rounded-lg border border-[#1e3a5f] bg-[#1a2235] py-2 text-xs text-[#8ba3c1] hover:border-[#2aabee] hover:text-white">{val}</button>)}</div>

      <div className="rounded-xl bg-[#1a2235] px-4 py-3 text-sm text-[#c6d4ea] space-y-2">
        <div className="flex justify-between"><span>Current price</span><span>{visibleCurrentPrice > 0 ? `${visibleCurrentPrice.toFixed(8)} GRAM` : "—"}</span></div>
        {mode === "buy" ? <><div className="flex justify-between"><span>Estimated tokens</span><span>{buyQuote ? buyQuote.tokenAmount.toFixed(2) : "—"}</span></div><div className="flex justify-between"><span>GRAM in USD</span><span>{gramPrice ? `$${gramPrice.toFixed(2)}` : "—"}</span></div><div className="flex justify-between"><span>Estimated USD value</span><span>{gramPrice && numericAmount > 0 ? formatTonUsd(numericAmount, gramPrice) : "—"}</span></div></> : <div className="rounded-lg border border-[#f59e0b]/30 bg-[#f59e0b]/10 p-3 text-xs text-[#f7d58a]">Sell is not available yet for bonding launches.</div>}
      </div>

      {error ? <p className="text-sm text-[#ff4757]">{error}</p> : null}
      <button onClick={submit} disabled={loading || !activeQuote || token.status !== "BONDING" || mode !== "buy"} className="btn-primary flex w-full items-center justify-center">{loading ? "Waiting for wallet signature..." : mode === "buy" ? "Buy with wallet" : "Sell unavailable"}</button>
      <div className="text-xs text-[#8ba3c1]">Status: {stage}</div>
    </div>
  );
}
