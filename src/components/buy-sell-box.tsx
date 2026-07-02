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

  if (!wallet) return <div className="pd-panel rounded-[28px] p-6 text-center"><h3 className="font-display text-2xl font-black tracking-[-0.04em] text-white">Connect wallet to buy or sell</h3><p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-[#90a3b8]">Transactions are signed in your wallet on TON Blockchain. No custody, no private keys.</p><div className="mt-5 flex justify-center"><WalletConnectButton /></div></div>;

  const activeQuote = mode === "buy" ? buyQuote : null;

  return (
    <div className="pd-panel space-y-4 rounded-[28px] p-5">
      <div>
        <div className="pd-kicker">Bonding trade</div>
        <h3 className="mt-1 font-display text-2xl font-black tracking-[-0.045em] text-white">{mode === "buy" ? "Buy / sell" : "Sell"}</h3>
      </div>

      <div className="grid grid-cols-2 gap-2 rounded-2xl border border-white/10 bg-white/[0.045] p-1">
        <button onClick={() => setMode("buy")} className={`rounded-xl py-2.5 text-sm font-bold ${mode === "buy" ? "bg-[#ff3d9a] text-white" : "text-[#90a3b8]"}`}>Buy</button>
        <button onClick={() => setMode("sell")} className={`rounded-xl py-2.5 text-sm font-bold ${mode === "sell" ? "bg-[#ff3d9a] text-white" : "text-[#90a3b8]"}`}>Sell</button>
      </div>

      <div>
        <label className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-[#90a3b8]">{mode === "buy" ? "Amount in GRAM" : `Amount in ${token.ticker}`}</label>
        <div className="relative rounded-[22px] border border-white/10 bg-white/[0.055]">
          <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.0" className="w-full bg-transparent px-4 py-4 pr-20 font-mono text-xl font-black text-white outline-none" />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-[#90a3b8]">{mode === "buy" ? "GRAM" : token.ticker}</span>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-2">{(mode === "buy" ? ["0.1", "0.5", "1", "5"] : ["100", "1000", "10000", "50000"]).map((val) => <button key={val} onClick={() => setAmount(val)} className="rounded-xl border border-white/10 bg-white/[0.045] py-2 text-xs font-bold text-[#90a3b8] hover:border-[#ff3d9a]/45 hover:text-white">{val}</button>)}</div>

      <div className="space-y-2 rounded-[22px] border border-white/10 bg-white/[0.045] px-4 py-3 text-sm text-[#cbd5e1]">
        <div className="flex justify-between"><span>Current price</span><span className="font-mono font-bold text-white">{visibleCurrentPrice > 0 ? `${visibleCurrentPrice.toFixed(8)} GRAM` : "—"}</span></div>
        {mode === "buy" ? <><div className="flex justify-between"><span>Estimated tokens</span><span className="font-mono font-bold text-white">{buyQuote ? buyQuote.tokenAmount.toFixed(2) : "—"}</span></div><div className="flex justify-between"><span>GRAM in USD</span><span className="font-mono font-bold text-white">{gramPrice ? `$${gramPrice.toFixed(2)}` : "—"}</span></div><div className="flex justify-between"><span>Estimated USD value</span><span className="font-mono font-bold text-white">{gramPrice && numericAmount > 0 ? formatTonUsd(numericAmount, gramPrice) : "—"}</span></div></> : <div className="rounded-2xl border border-[#ffd166]/25 bg-[#ffd166]/10 p-3 text-xs text-[#ffe1a3]">Trading is not available for this launch state yet.</div>}
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-3 text-xs text-[#90a3b8]">Market access does not replace proof state. Review launch and market status before trading.</div>
      {error ? <div className="rounded-2xl border border-[#ff5c7a]/30 bg-[#ff5c7a]/10 p-3 text-sm text-[#ff9db0]">{error}</div> : null}
      <button onClick={submit} disabled={loading || !activeQuote || token.status !== "BONDING" || mode !== "buy"} className="pd-btn-primary w-full disabled:cursor-not-allowed disabled:opacity-50">{loading ? "Waiting for wallet signature..." : mode === "buy" ? "Buy with wallet" : "Sell unavailable"}</button>
      <div className="text-xs text-[#90a3b8]">Status: {stage}</div>
    </div>
  );
}
