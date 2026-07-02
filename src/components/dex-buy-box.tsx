"use client";

import { useMemo, useState } from "react";
import type { ExternalTokenRecord } from "../lib/external-tokens/types";
import type { DexQuote, DexSwapPayload, ExternalDex, SwapSide } from "../lib/dex/external/types";
import type { TonTransactionDraft } from "../lib/onchain";
import { getTelegramWebApp } from "../lib/telegram";
import { DexPlatformSelector } from "./dex-platform-selector";
import { RouteInfoCard } from "./route-info-card";
import { useUi } from "./page-shell";
import { useWallet } from "./wallet-context";
import { WalletConnectButton } from "./wallet-connect-button";

const toExternalDex = (dex: string): ExternalDex | null => dex === "DEDUST" ? "dedust" : dex === "STONFI" ? "stonfi" : null;

const decimalToUnits = (value: string, decimals: number) => {
  const clean = value.replace(",", ".").trim();
  if (!/^\d+(\.\d+)?$/.test(clean)) throw new Error("Invalid amount");
  const [whole, fraction = ""] = clean.split(".");
  const padded = fraction.slice(0, decimals).padEnd(decimals, "0");
  return (BigInt(whole || "0") * 10n ** BigInt(decimals) + BigInt(padded || "0")).toString();
};

const formatUnits = (value: string, decimals: number) => {
  const raw = BigInt(value || "0");
  const base = 10n ** BigInt(decimals);
  const whole = raw / base;
  const fraction = raw % base;
  if (fraction === 0n) return whole.toString();
  return `${whole.toString()}.${fraction.toString().padStart(decimals, "0").replace(/0+$/, "")}`;
};

const explorerUrl = (boc?: string) => boc ? `https://tonviewer.com/transaction/${encodeURIComponent(boc)}` : null;

export function DexBuyBox({ token }: { token: ExternalTokenRecord }) {
  const { locale } = useUi();
  const { wallet, isConnected, isMainnet, sendTransaction } = useWallet();
  const app = getTelegramWebApp();
  const [side, setSide] = useState<SwapSide>("buy");
  const [amount, setAmount] = useState("1");
  const [quotes, setQuotes] = useState<DexQuote[]>([]);
  const [selectedDex, setSelectedDex] = useState<ExternalDex | null>(toExternalDex(token.primaryDex || "") ?? "dedust");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [warning, setWarning] = useState("");
  const [stage, setStage] = useState<"idle" | "quoting" | "quoted" | "building" | "signing" | "submitted" | "failed">("idle");
  const [txInfo, setTxInfo] = useState<{ hash?: string } | null>(null);

  const selectedQuote = useMemo(() => quotes.find((quote) => quote.dex === selectedDex) ?? quotes.find((quote) => quote.status === "quote_ready") ?? null, [quotes, selectedDex]);
  const availablePlatforms = useMemo(() => {
    const fromToken = token.dexes.map(toExternalDex).filter((dex): dex is ExternalDex => Boolean(dex));
    return fromToken.length ? fromToken : ["dedust", "stonfi"];
  }, [token.dexes]);

  const inputUnits = () => decimalToUnits(amount, side === "buy" ? 9 : token.decimals);

  const requestQuote = async () => {
    setLoading(true);
    setError("");
    setWarning("");
    setQuotes([]);
    setTxInfo(null);
    setStage("quoting");
    try {
      if (!wallet) throw new Error(locale === "ru" ? "Сначала подключи кошелёк" : "Connect wallet first");
      const res = await fetch("/api/dex/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tokenAddress: token.address, side, amount: inputUnits(), platforms: availablePlatforms, slippageBps: 300 })
      });
      const data = (await res.json()) as { ok?: boolean; quotes?: DexQuote[]; error?: string };
      const nextQuotes = Array.isArray(data.quotes) ? data.quotes : [];
      if (!res.ok || !data.ok || nextQuotes.length === 0) throw new Error(data.error || "Quote failed");
      setQuotes(nextQuotes);
      const firstReady = nextQuotes.find((quote) => quote.status === "quote_ready");
      setSelectedDex((current) => current && nextQuotes.some((quote) => quote.dex === current && quote.status === "quote_ready") ? current : firstReady?.dex ?? nextQuotes[0]?.dex ?? null);
      setStage("quoted");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Quote failed";
      setStage("failed");
      setError(message);
      app?.HapticFeedback?.notificationOccurred("error");
    } finally {
      setLoading(false);
    }
  };

  const execute = async () => {
    setLoading(true);
    setError("");
    setWarning("");
    setTxInfo(null);
    setStage("building");
    try {
      if (!wallet) throw new Error(locale === "ru" ? "Сначала подключи кошелёк" : "Connect wallet first");
      if (!isMainnet) throw new Error(locale === "ru" ? "Нужен TON mainnet" : "TON mainnet is required");
      if (!selectedDex) throw new Error(locale === "ru" ? "Выбери платформу" : "Choose platform");
      if (!selectedQuote || selectedQuote.status !== "quote_ready") throw new Error(locale === "ru" ? "Сначала получи рабочий quote" : "Fetch a working route first");
      const res = await fetch("/api/dex/swap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tokenAddress: token.address, side, amount: inputUnits(), platform: selectedDex, userWallet: wallet, slippageBps: 300 })
      });
      const data = (await res.json()) as { ok?: boolean; result?: DexSwapPayload; error?: string };
      if (!res.ok || !data.result) throw new Error(data.error || "Swap payload failed");
      if (data.result.status !== "payload_ready") throw new Error(data.result.reason || data.result.status);
      setStage("signing");
      const tx = (await sendTransaction({ validUntil: data.result.validUntil, messages: data.result.messages } as TonTransactionDraft)) as { boc?: string } | unknown;
      const nextTxInfo = typeof tx === "object" && tx ? { hash: "boc" in tx && typeof tx.boc === "string" ? tx.boc : undefined } : null;
      setTxInfo(nextTxInfo);
      setStage("submitted");
      app?.HapticFeedback?.notificationOccurred("success");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Trade failed";
      setStage("failed");
      setError(message);
      app?.HapticFeedback?.notificationOccurred("error");
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected) {
    return <div className="pd-panel rounded-[28px] p-6 text-center"><h3 className="font-display text-2xl font-black tracking-[-0.04em] text-white">{locale === "ru" ? "Подключи кошелёк" : "Connect wallet"}</h3><p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-[#90a3b8]">{locale === "ru" ? "Покупка и продажа идут через TonConnect, без custody." : "Buy and sell are wallet-signed on TON Blockchain with no custody."}</p><div className="mt-5 flex justify-center"><WalletConnectButton /></div></div>;
  }

  const disabledQuote = loading || !wallet || !isMainnet;
  const disabledTrade = loading || !selectedQuote || selectedQuote.status !== "quote_ready" || !wallet || !isMainnet;
  const txExplorer = explorerUrl(txInfo?.hash);

  return (
    <div className="pd-panel space-y-4 rounded-[28px] p-5">
      <div>
        <div className="pd-kicker">DEX trade</div>
        <h3 className="mt-1 font-display text-2xl font-black tracking-[-0.045em] text-white">{locale === "ru" ? "Маршрут через DEX" : "Route through DEX"}</h3>
        <p className="mt-2 text-sm leading-6 text-[#90a3b8]">{locale === "ru" ? "Выбери DEX route и подпиши транзакцию в кошельке. DeDust или STON.fi на TON Blockchain." : "Choose a DEX route and sign the transaction in your wallet. DeDust or STON.fi on TON Blockchain."}</p>
      </div>
      <RouteInfoCard token={token} />
      <div className="grid grid-cols-2 gap-2 rounded-2xl border border-white/10 bg-white/[0.045] p-1">
        <button type="button" onClick={() => setSide("buy")} className={`rounded-xl py-2.5 text-sm font-bold ${side === "buy" ? "bg-[#ff3d9a] text-white" : "text-[#90a3b8]"}`}>{locale === "ru" ? "Купить" : "Buy"}</button>
        <button type="button" onClick={() => setSide("sell")} className={`rounded-xl py-2.5 text-sm font-bold ${side === "sell" ? "bg-[#ff3d9a] text-white" : "text-[#90a3b8]"}`}>{locale === "ru" ? "Продать" : "Sell"}</button>
      </div>
      <div className="rounded-[22px] border border-white/10 bg-white/[0.055] p-3"><label className="text-xs font-bold uppercase tracking-[0.14em] text-[#90a3b8]">{side === "buy" ? (locale === "ru" ? "Сумма в TON" : "Amount in TON") : `${locale === "ru" ? "Сумма в" : "Amount in"} ${token.symbol}`}</label><input value={amount} onChange={(event) => setAmount(event.target.value)} inputMode="decimal" className="mt-2 w-full bg-transparent font-mono text-xl font-black text-white outline-none" /></div>
      <div className="grid grid-cols-4 gap-2">{(side === "buy" ? ["0.2", "0.5", "1", "5"] : ["100", "1000", "10000", "50000"]).map((val) => <button key={val} type="button" onClick={() => setAmount(val)} className="rounded-xl border border-white/10 bg-white/[0.045] py-2 text-xs font-bold text-[#90a3b8] hover:border-[#ff3d9a]/45 hover:text-white">{val}</button>)}</div>
      <button type="button" disabled={disabledQuote} onClick={requestQuote} className={`pd-btn-secondary w-full ${disabledQuote ? "cursor-not-allowed opacity-50" : ""}`}>{loading && stage === "quoting" ? (locale === "ru" ? "Считаю маршрут..." : "Quoting route...") : (locale === "ru" ? "Получить маршрут" : "Fetch market route")}</button>
      <DexPlatformSelector quotes={quotes} selected={selectedDex} onSelect={setSelectedDex} />
      {selectedQuote ? <div className="space-y-2 rounded-[22px] border border-[#9cff2e]/25 bg-[#9cff2e]/10 p-3 text-sm text-[#dfff9f]"><div className="flex justify-between"><span>{locale === "ru" ? "Ожидаемо получишь" : "Expected output"}</span><span className="font-mono font-bold text-white">{formatUnits(selectedQuote.expectedReceive, side === "buy" ? token.decimals : 9)} {side === "buy" ? token.symbol : "TON"}</span></div><div className="flex justify-between"><span>{locale === "ru" ? "Минимум" : "Minimum"}</span><span className="font-mono font-bold text-white">{formatUnits(selectedQuote.minReceive, side === "buy" ? token.decimals : 9)} {side === "buy" ? token.symbol : "TON"}</span></div></div> : null}
      <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-3 text-xs text-[#90a3b8]">{locale === "ru" ? "Рабочий route нужен до исполнения. Route availability не заменяет broader liquidity или proof state." : "A working route is required before execution. Route availability does not replace broader liquidity or proof state."}</div>
      <button type="button" disabled={disabledTrade} onClick={execute} className={`pd-btn-primary w-full ${disabledTrade ? "cursor-not-allowed opacity-50" : ""}`}>{loading && stage === "building" ? (locale === "ru" ? "Собираю транзакцию..." : "Building transaction...") : loading && stage === "signing" ? (locale === "ru" ? "Подтверди в кошельке..." : "Confirm in wallet...") : stage === "submitted" ? (locale === "ru" ? "Отправлено" : "Submitted") : side === "buy" ? (locale === "ru" ? "Купить через кошелёк" : "Buy with wallet") : (locale === "ru" ? "Продать через кошелёк" : "Sell with wallet")}</button>
      {!isMainnet ? <div className="rounded-2xl border border-[#ffd166]/30 bg-[#ffd166]/10 p-3 text-sm text-[#ffe1a3]">{locale === "ru" ? "Переключи кошелёк на TON mainnet." : "Switch wallet to TON mainnet."}</div> : null}
      {warning ? <div className="rounded-2xl border border-[#ffd166]/30 bg-[#ffd166]/10 p-3 text-sm text-[#ffe1a3]">{warning}</div> : null}
      {txInfo?.hash ? <div className="space-y-2 break-all rounded-2xl border border-[#5ac8fa]/30 bg-[#5ac8fa]/10 p-3 text-xs text-[#c9f0ff]"><div>BOC: {txInfo.hash}</div>{txExplorer ? <a href={txExplorer} target="_blank" rel="noreferrer" className="inline-flex text-[#8fd6ff] underline underline-offset-2">{locale === "ru" ? "Открыть в Tonviewer" : "Open in Tonviewer"}</a> : null}</div> : null}
      {error ? <div className="rounded-2xl border border-[#ff5c7a]/30 bg-[#ff5c7a]/10 p-3 text-sm text-[#ff9db0]">{error}</div> : null}
      <p className="text-xs leading-5 text-[#90a3b8]">{locale === "ru" ? `Статус: ${stage}` : `Status: ${stage}`}</p>
    </div>
  );
}
