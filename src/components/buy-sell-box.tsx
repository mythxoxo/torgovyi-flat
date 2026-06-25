"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { buildBuyDraft, buildSellDraft, isTonAddress, toMainnetAddress } from "../lib/onchain";
import { quoteBuy, quoteSell, spotPriceForSupply } from "../lib/shared";
import type { TokenRecord } from "../lib/shared";
import { buyToken, resolveReferral, sellToken } from "../lib/api";
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
  const [userJettonWalletAddress, setUserJettonWalletAddress] = useState("");
  const app = getTelegramWebApp();
  const referralCode = searchParams.get("ref") || undefined;

  useEffect(() => {
    getTonPrice().then((r) => setGramPrice(r.usd)).catch(() => setGramPrice(null));
  }, []);

  useEffect(() => {
    let cancelled = false;
    if (!wallet || !token.contractAddresses.jettonMaster || mode !== "sell") {
      setUserJettonWalletAddress("");
      return;
    }

    const loadJettonWallet = async () => {
      try {
        const res = await fetch(`/api/wallet/assets?address=${encodeURIComponent(wallet)}`, { cache: "no-store" });
        const data = await res.json() as { jettons?: Array<{ master?: string; address?: string }> };
        if (cancelled) return;
        const match = data.jettons?.find((item) => item.master === token.contractAddresses.jettonMaster);
        setUserJettonWalletAddress(match?.address || "");
      } catch {
        if (!cancelled) setUserJettonWalletAddress("");
      }
    };

    void loadJettonWallet();
    return () => { cancelled = true; };
  }, [wallet, token.contractAddresses.jettonMaster, mode]);

  const numericAmount = Number(amount);
  const buyQuote = useMemo(() => {
    if (!(numericAmount > 0) || token.status !== "BONDING") return null;
    try { return quoteBuy(token.state, numericAmount, token.creatorTax); } catch { return null; }
  }, [numericAmount, token]);

  const sellQuoteData = useMemo(() => {
    if (!(numericAmount > 0) || token.status !== "BONDING") return null;
    try { return quoteSell(token.state, numericAmount, token.creatorTax); } catch { return null; }
  }, [numericAmount, token]);

  const visibleCurrentPrice = useMemo(() => {
    if (buyQuote) return buyQuote.newState.currentPriceTon;
    if (sellQuoteData) return sellQuoteData.newState.currentPriceTon;
    if (token.state.currentPriceTon > 0) return token.state.currentPriceTon;
    if (token.status === "BONDING") return spotPriceForSupply(token.state.soldSupply || 0);
    if (token.state.circulatingSupply > 0 && token.state.marketCapTon > 0) return token.state.marketCapTon / token.state.circulatingSupply;
    if (token.state.soldSupply > 0 && token.state.collectedTon > 0) return token.state.collectedTon / token.state.soldSupply;
    return 0;
  }, [buyQuote, sellQuoteData, token]);

  const submitBuy = async () => {
    if (!buyQuote) throw new Error("Enter a valid amount");
    let resolvedReferral: Awaited<ReturnType<typeof resolveReferral>> | null = null;
    if (referralCode) resolvedReferral = await resolveReferral(wallet!, referralCode);
    if (!isTonAddress(token.contractAddresses.bondingCurve)) throw new Error("Pool address is not indexed yet");
    const tx = await sendTransaction(buildBuyDraft({ poolAddress: toMainnetAddress(token.contractAddresses.bondingCurve), tonAmount: numericAmount, referralAddress: resolvedReferral?.wallet ?? undefined, minTokensOut: BigInt(Math.max(0, Math.floor(buyQuote.tokenAmount))) }));
    const txHash = typeof tx === "object" && tx && "boc" in tx ? String((tx as { boc?: string }).boc || "") : undefined;
    await buyToken(token.id, wallet!, numericAmount, referralCode, 500, txHash);
  };

  const submitSell = async () => {
    if (!sellQuoteData) throw new Error("Enter a valid token amount");
    if (!userJettonWalletAddress || !isTonAddress(userJettonWalletAddress)) throw new Error("Jetton wallet for this token is not available yet");
    if (!isTonAddress(token.contractAddresses.bondingCurve)) throw new Error("Pool address is not indexed yet");
    const tx = await sendTransaction(buildSellDraft({ userJettonWalletAddress, poolAddress: toMainnetAddress(token.contractAddresses.bondingCurve), tokenAmount: BigInt(Math.max(1, Math.floor(numericAmount * 1_000_000_000))), minTonOutNano: BigInt(Math.max(1, Math.floor(sellQuoteData.tonAmountNet * 1_000_000_000))) }));
    const txHash = typeof tx === "object" && tx && "boc" in tx ? String((tx as { boc?: string }).boc || "") : undefined;
    await sellToken(token.id, wallet!, numericAmount, 500, txHash);
  };

  const submit = async () => {
    try {
      if (!wallet) throw new Error(mode === "buy" ? "Connect wallet to buy" : "Connect wallet to sell");
      if (walletSource === "tonconnect" && !isMainnet) throw new Error("GRAM mainnet required");
      setStage("waiting for wallet signature");
      setLoading(true);
      setError("");
      if (mode === "buy") await submitBuy(); else await submitSell();
      setStage(mode === "buy" ? "indexed / verification pending" : "sell submitted / verification pending");
      router.refresh();
    } catch (caughtError) {
      setStage("failed");
      const message = caughtError instanceof Error ? caughtError.message : "Trade failed";
      setError(message);
      app?.HapticFeedback?.notificationOccurred("error");
    } finally { setLoading(false); }
  };

  if (!wallet) {
    return <div className="glass-card rounded-[24px] p-6 text-center"><h3 className="text-xl font-semibold text-white">Connect wallet to trade</h3><p className="mt-2 text-sm text-[#8ba3c1]">Manual signing only. No custody, no private keys.</p><div className="mt-5 flex justify-center"><WalletConnectButton /></div></div>;
  }

  const activeQuote = mode === "buy" ? buyQuote : sellQuoteData;

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
        {mode === "buy" ? <><div className="flex justify-between"><span>Estimated tokens</span><span>{buyQuote ? buyQuote.tokenAmount.toFixed(2) : "—"}</span></div><div className="flex justify-between"><span>GRAM in USD</span><span>{gramPrice ? `$${gramPrice.toFixed(2)}` : "—"}</span></div><div className="flex justify-between"><span>Estimated USD value</span><span>{gramPrice && numericAmount > 0 ? formatTonUsd(numericAmount, gramPrice) : "—"}</span></div></> : <><div className="flex justify-between"><span>Gross TON out</span><span>{sellQuoteData ? `${sellQuoteData.tonAmountGross.toFixed(6)} GRAM` : "—"}</span></div><div className="flex justify-between"><span>Net TON out</span><span>{sellQuoteData ? `${sellQuoteData.tonAmountNet.toFixed(6)} GRAM` : "—"}</span></div><div className="flex justify-between"><span>Jetton wallet</span><span className="max-w-[140px] truncate">{userJettonWalletAddress ? `${userJettonWalletAddress.slice(0, 6)}...${userJettonWalletAddress.slice(-4)}` : "—"}</span></div></>}
      </div>

      {error ? <p className="text-sm text-[#ff4757]">{error}</p> : null}
      <button onClick={submit} disabled={loading || !activeQuote || token.status !== "BONDING"} className="btn-primary flex w-full items-center justify-center">{loading ? "Waiting for wallet signature..." : mode === "buy" ? "Buy with wallet" : "Sell with wallet"}</button>
      <div className="text-xs text-[#8ba3c1]">Status: {stage}</div>
      {mode === "sell" ? <div className="text-xs text-[#8ba3c1]">Sell path uses your jetton wallet, requires manual wallet signing, and must be verified on-chain after execution.</div> : null}
    </div>
  );
}
