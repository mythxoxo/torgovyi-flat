"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { buildBuyDraft, isTonAddress, toMainnetAddress } from "../lib/onchain";
import { quoteBuy } from "../lib/shared";
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
  const [amount, setAmount] = useState("1");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [stage, setStage] = useState("prepared");
  const [tonPrice, setTonPrice] = useState<number | null>(null);
  const app = getTelegramWebApp();
  const referralCode = searchParams.get("ref") || undefined;

  useEffect(() => {
    getTonPrice().then((r) => setTonPrice(r.usd)).catch(() => setTonPrice(null));
  }, []);

  const numericAmount = Number(amount);
  const quote = useMemo(() => {
    if (!(numericAmount > 0) || token.status !== "BONDING") return null;
    try {
      return quoteBuy(token.state, numericAmount, token.creatorTax);
    } catch {
      return null;
    }
  }, [numericAmount, token]);

  const submit = async () => {
    try {
      if (!wallet) throw new Error("Connect wallet to buy");
      if (walletSource === "tonconnect" && !isMainnet) throw new Error("TON mainnet required");
      if (!quote) throw new Error("Enter a valid amount");
      setStage("waiting for wallet signature");
      setLoading(true);
      setError("");

      let resolvedReferral: Awaited<ReturnType<typeof resolveReferral>> | null = null;
      if (referralCode) resolvedReferral = await resolveReferral(wallet, referralCode);
      if (!isTonAddress(token.contractAddresses.bondingCurve)) throw new Error("Pool address is not indexed yet");

      const tx = await sendTransaction(
        buildBuyDraft({
          poolAddress: toMainnetAddress(token.contractAddresses.bondingCurve),
          tonAmount: numericAmount,
          referralAddress: resolvedReferral?.wallet ?? undefined,
          minTokensOut: BigInt(Math.max(0, Math.floor(quote.tokenAmount)))
        })
      );

      setStage("pending confirmation");
      const txHash = typeof tx === "object" && tx && "boc" in tx ? String((tx as { boc?: string }).boc || "") : undefined;
      await buyToken(token.id, wallet, numericAmount, referralCode, 500, txHash);
      setStage("indexed / verification pending");
      router.refresh();
    } catch (caughtError) {
      setStage("failed");
      setError(caughtError instanceof Error ? caughtError.message : "Trade failed");
    } finally {
      setLoading(false);
    }
  };

  if (!wallet) {
    return (
      <div className="glass-card rounded-[24px] p-6 text-center">
        <h3 className="text-xl font-semibold text-white">Connect wallet to buy</h3>
        <p className="mt-2 text-sm text-[#8ba3c1]">Manual signing only. No custody, no private keys.</p>
        <div className="mt-5 flex justify-center">
          <WalletConnectButton />
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-[24px] p-4 space-y-4">
      <div>
        <label className="mb-1.5 block text-xs text-[#8ba3c1]">Amount in TON</label>
        <div className="relative">
          <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.0" className="w-full rounded-xl border border-[#1e3a5f] bg-[#1a2235] px-4 py-3 pr-16 font-mono text-lg text-white focus:border-[#0088cc] focus:outline-none" />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[#8ba3c1]">TON</span>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {["0.1", "0.5", "1", "5"].map((val) => (
          <button key={val} onClick={() => setAmount(val)} className="rounded-lg border border-[#1e3a5f] bg-[#1a2235] py-2 text-xs text-[#8ba3c1] hover:border-[#0088cc] hover:text-white">
            {val}
          </button>
        ))}
      </div>

      <div className="rounded-xl bg-[#1a2235] px-4 py-3 text-sm text-[#c6d4ea] space-y-2">
        <div className="flex justify-between"><span>Current price</span><span>{quote ? `${quote.newState.currentPriceTon.toFixed(8)} TON` : "—"}</span></div>
        <div className="flex justify-between"><span>Estimated tokens</span><span>{quote ? quote.tokenAmount.toFixed(2) : "—"}</span></div>
        <div className="flex justify-between"><span>TON in USD</span><span>{tonPrice ? `$${tonPrice.toFixed(2)}` : "TON price unavailable"}</span></div>
        <div className="flex justify-between"><span>Estimated USD value</span><span>{tonPrice && numericAmount > 0 ? formatTonUsd(numericAmount, tonPrice) : "—"}</span></div>
      </div>

      {error ? <p className="text-sm text-[#ff4757]">{error}</p> : null}

      <button onClick={submit} disabled={loading || !quote || token.status !== "BONDING"} className="btn-primary flex w-full items-center justify-center">
        {loading ? "Waiting for wallet signature..." : "Buy with wallet"}
      </button>

      <div className="text-xs text-[#8ba3c1]">Status: {stage}</div>
    </div>
  );
}
