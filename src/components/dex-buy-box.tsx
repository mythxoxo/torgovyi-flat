"use client";

import { useState } from "react";
import type { ExternalTokenRecord } from "../lib/external-tokens/types";
import type { DexQuote, DexQuoteResponse, DexSwapDraftResponse } from "../lib/dex/types";
import type { TonTransactionDraft } from "../lib/onchain";
import { getTelegramWebApp } from "../lib/telegram";
import { useUi } from "./page-shell";
import { RouteInfoCard } from "./route-info-card";
import { useWallet } from "./wallet-context";
import { WalletConnectButton } from "./wallet-connect-button";

const formatUnits = (value: string, decimals: number) => {
  const raw = BigInt(value || "0");
  const base = 10n ** BigInt(decimals);
  const whole = raw / base;
  const fraction = raw % base;
  if (fraction === 0n) return whole.toString();
  const fractionText = fraction.toString().padStart(decimals, "0").replace(/0+$/, "");
  return `${whole.toString()}.${fractionText}`;
};

const explorerUrl = (boc?: string) => boc ? `https://tonviewer.com/transaction/${encodeURIComponent(boc)}` : null;

export function DexBuyBox({ token }: { token: ExternalTokenRecord }) {
  const { locale } = useUi();
  const { wallet, isConnected, isMainnet, sendTransaction } = useWallet();
  const app = getTelegramWebApp();
  const [amount, setAmount] = useState("1");
  const [loading, setLoading] = useState(false);
  const [quote, setQuote] = useState<DexQuote | null>(null);
  const [error, setError] = useState("");
  const [warning, setWarning] = useState("");
  const [stage, setStage] = useState<"idle" | "quoting" | "quoted" | "building" | "signing" | "submitted" | "failed">("idle");
  const [txInfo, setTxInfo] = useState<{ hash?: string } | null>(null);

  const requestQuote = async () => {
    setLoading(true);
    setError("");
    setWarning("");
    setQuote(null);
    setTxInfo(null);
    setStage("quoting");
    try {
      const parsedAmount = Number(amount.replace(",", "."));
      if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
        throw new Error(locale === "ru" ? "Введи сумму больше нуля" : "Enter an amount above zero");
      }
      if (!wallet) {
        throw new Error(locale === "ru" ? "Сначала подключи кошелёк" : "Connect wallet first");
      }

      const offerUnits = String(Math.floor(parsedAmount * 1_000_000_000));
      const res = await fetch("/api/dex/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userWalletAddress: wallet,
          offerAddress: "ton",
          askAddress: token.address,
          offerUnits,
          slippageTolerance: "0.01"
        })
      });
      const data = (await res.json()) as DexQuoteResponse | { ok: false; error?: string };
      if (!res.ok || !data.ok || !("quote" in data)) {
        const message = "error" in data && typeof data.error === "string" ? data.error : "Quote failed";
        throw new Error(message);
      }
      setQuote(data.quote);
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

  const executeBuy = async () => {
    setLoading(true);
    setError("");
    setWarning("");
    setTxInfo(null);
    setStage("building");
    try {
      if (!wallet) {
        throw new Error(locale === "ru" ? "Сначала подключи кошелёк" : "Connect wallet first");
      }
      if (!isMainnet) {
        throw new Error(locale === "ru" ? "Нужен TON mainnet" : "TON mainnet is required");
      }
      if (!quote) {
        throw new Error(locale === "ru" ? "Сначала получи quote" : "Fetch a quote first");
      }

      const draftResponse = await fetch("/api/dex/swap-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userWalletAddress: wallet,
          offerAddress: quote.offerAddress,
          askAddress: quote.askAddress,
          offerUnits: quote.offerUnits,
          minAskUnits: quote.minAskUnits,
          slippageTolerance: "0.01"
        })
      });

      const draftData = (await draftResponse.json()) as DexSwapDraftResponse | { ok: false; error?: string };
      if (!draftResponse.ok || !draftData.ok || !("draft" in draftData)) {
        const message = "error" in draftData && typeof draftData.error === "string" ? draftData.error : "Swap draft failed";
        throw new Error(message);
      }

      if (draftData.draft.warnings.length > 0) {
        setWarning(draftData.draft.warnings[0]);
      }

      setStage("signing");
      const tx = (await sendTransaction({
        validUntil: draftData.draft.validUntil,
        messages: draftData.draft.messages
      } as TonTransactionDraft)) as { boc?: string } | unknown;

      const nextTxInfo = typeof tx === "object" && tx ? { hash: "boc" in tx && typeof tx.boc === "string" ? tx.boc : undefined } : null;
      setTxInfo(nextTxInfo);
      setStage("submitted");
      app?.HapticFeedback?.notificationOccurred("success");
      app?.showPopup?.({
        title: locale === "ru" ? "Транзакция отправлена" : "Transaction submitted",
        message: locale === "ru" ? "Проверь подтверждение в кошельке и статус в обозревателе." : "Check your wallet confirmation and explorer status.",
        buttons: [{ type: "ok", text: "OK" }]
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Buy failed";
      setStage("failed");
      setError(message);
      app?.HapticFeedback?.notificationOccurred("error");
      app?.showPopup?.({
        title: locale === "ru" ? "Покупка не прошла" : "Buy failed",
        message,
        buttons: [{ type: "close", text: "OK" }]
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="glass-card rounded-[24px] p-6 text-center">
        <h3 className="font-display text-xl font-bold text-white">{locale === "ru" ? "Подключи кошелёк" : "Connect wallet"}</h3>
        <p className="mt-2 text-sm text-[#8ba3c1]">
          {locale === "ru" ? "Покупка existing tokens идёт через TonConnect, без custody." : "Existing token buying goes through TonConnect with no custody."}
        </p>
        <div className="mt-5 flex justify-center">
          <WalletConnectButton />
        </div>
      </div>
    );
  }

  const disabledQuote = loading || !wallet || !isMainnet;
  const disabledBuy = loading || !quote || !wallet || !isMainnet;
  const txExplorer = explorerUrl(txInfo?.hash);

  return (
    <div className="glass-card rounded-[24px] p-4 space-y-4">
      <div>
        <h3 className="font-display text-xl font-bold text-white">{locale === "ru" ? "Покупка через DEX" : "DEX buy"}</h3>
        <p className="mt-2 text-sm leading-6 text-[#8ba3c1]">
          {locale === "ru"
            ? "TON → token через STON.fi маршрут. Транзакция подписывается прямо в кошельке."
            : "TON → token via STON.fi route. The transaction is signed directly in the wallet."}
        </p>
      </div>

      <RouteInfoCard token={token} />

      <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
        <label className="text-xs text-[#8ba3c1]">{locale === "ru" ? "Сумма в TON" : "Amount in TON"}</label>
        <input value={amount} onChange={(event) => setAmount(event.target.value)} inputMode="decimal" className="mt-2 w-full bg-transparent font-mono text-lg text-white outline-none" />
      </div>

      <div className="grid grid-cols-4 gap-2">
        {["0.2", "0.5", "1", "5"].map((val) => (
          <button key={val} type="button" onClick={() => setAmount(val)} className="rounded-lg border border-[#1e3a5f] bg-[#1a2235] py-2 text-xs text-[#8ba3c1] hover:border-[#2aabee] hover:text-white">
            {val}
          </button>
        ))}
      </div>

      <button type="button" disabled={disabledQuote} onClick={requestQuote} className={`btn-primary flex w-full items-center justify-center ${disabledQuote ? "cursor-not-allowed opacity-50" : ""}`}>
        {loading && stage === "quoting" ? (locale === "ru" ? "Считаю маршрут..." : "Quoting route...") : (locale === "ru" ? "Получить quote" : "Get quote")}
      </button>

      {quote ? (
        <div className="rounded-2xl border border-[#22c55e]/30 bg-[#22c55e]/10 p-3 text-sm text-[#d9ffe5] space-y-2">
          <div className="flex items-center justify-between gap-3">
            <span>{locale === "ru" ? "Маршрут" : "Route"}</span>
            <span className="font-semibold text-white">{quote.dex}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span>{locale === "ru" ? "Ожидаемо получишь" : "Expected output"}</span>
            <span className="font-mono text-white">{formatUnits(quote.expectedAskUnits, token.decimals)} {token.symbol}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span>{locale === "ru" ? "Минимум с учётом slippage" : "Minimum after slippage"}</span>
            <span className="font-mono text-white">{formatUnits(quote.minAskUnits, token.decimals)} {token.symbol}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span>{locale === "ru" ? "Price impact" : "Price impact"}</span>
            <span className="font-mono text-white">{(quote.priceImpactPct ?? 0).toFixed(2)}%</span>
          </div>
          {quote.poolAddress ? (
            <div className="text-xs text-[#b6f3c8] break-all">Pool: {quote.poolAddress}</div>
          ) : null}
        </div>
      ) : null}

      <button type="button" disabled={disabledBuy} onClick={executeBuy} className={`btn-primary flex w-full items-center justify-center ${disabledBuy ? "cursor-not-allowed opacity-50" : ""}`}>
        {loading && stage === "building"
          ? (locale === "ru" ? "Собираю транзакцию..." : "Building transaction...")
          : loading && stage === "signing"
            ? (locale === "ru" ? "Подтверди в кошельке..." : "Confirm in wallet...")
            : stage === "submitted"
              ? (locale === "ru" ? "Отправлено" : "Submitted")
              : (locale === "ru" ? "Купить через кошелёк" : "Buy with wallet")}
      </button>

      {!isMainnet ? (
        <div className="rounded-2xl border border-[#ffb84d]/30 bg-[#ffb84d]/10 p-3 text-sm text-[#ffd79a]">
          {locale === "ru" ? "Переключи кошелёк на TON mainnet." : "Switch your wallet to TON mainnet."}
        </div>
      ) : null}

      {warning ? <div className="rounded-2xl border border-[#ffb84d]/30 bg-[#ffb84d]/10 p-3 text-sm text-[#ffd79a]">{warning}</div> : null}

      {txInfo?.hash ? (
        <div className="rounded-2xl border border-[#2aabee]/30 bg-[#2aabee]/10 p-3 text-xs text-[#bfe9ff] break-all space-y-2">
          <div>BOC: {txInfo.hash}</div>
          {txExplorer ? <a href={txExplorer} target="_blank" rel="noreferrer" className="inline-flex text-[#8fd6ff] underline underline-offset-2">{locale === "ru" ? "Открыть в Tonviewer" : "Open in Tonviewer"}</a> : null}
        </div>
      ) : null}

      {error ? <div className="rounded-2xl border border-[#ff4757]/30 bg-[#ff4757]/10 p-3 text-sm text-[#ff8a95]">{error}</div> : null}

      <p className="text-xs leading-5 text-[#8ba3c1]">
        {locale === "ru"
          ? `Статус: ${stage === "idle" ? "ожидание" : stage === "quoting" ? "расчёт quote" : stage === "quoted" ? "quote готов" : stage === "building" ? "сборка транзакции" : stage === "signing" ? "ожидание подписи" : stage === "submitted" ? "отправлено в кошелёк" : "ошибка"}`
          : `Status: ${stage}`}
      </p>
    </div>
  );
}
