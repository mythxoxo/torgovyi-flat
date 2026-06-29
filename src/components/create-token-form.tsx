"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { TonTransactionDraft } from "../lib/onchain";
import { normalizeCreatorTax } from "../lib/shared";
import { createToken as createTokenRequest, uploadTokenImage as uploadImage } from "../lib/api";
import { useWallet } from "./wallet-context";
import { WalletConnectButton } from "./wallet-connect-button";
import { getTelegramWebApp } from "../lib/telegram";
import { useUi } from "./page-shell";

const primaryButtonClass = "rounded-full bg-[linear-gradient(135deg,#5ac8fa,#2aabee_52%,#229ed9)] px-6 py-3 text-center text-[15px] font-semibold tracking-[-0.01em] text-[#06101a] shadow-[0_16px_36px_rgba(42,171,238,0.26)]";

type LaunchPrepareResponse = {
  ok: boolean;
  error?: string;
  contracts: { factory: string; bondingCurve: string; jettonMaster: string; lpLock: string };
  deploymentDraft: TonTransactionDraft;
  activationDraft: TonTransactionDraft;
  launchFeeTon: number;
  launchFeeTreasury: string;
};

async function prepareLaunchDraft(input: { creatorAddress: string; name: string; ticker: string; description: string; imageUrl: string; targetTon: number }): Promise<LaunchPrepareResponse> {
  const response = await fetch("/api/launch/prepare", { method: "POST", headers: { "Content-Type": "application/json" }, cache: "no-store", body: JSON.stringify(input) });
  const data = (await response.json().catch(() => ({}))) as Partial<LaunchPrepareResponse>;
  if (!response.ok || !data.ok) throw new Error(data.error || "Launch draft preparation failed");
  return data as LaunchPrepareResponse;
}

export function CreateTokenForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { wallet, walletSource, isMainnet, sendTransaction } = useWallet();
  const { locale, t } = useUi();
  const app = getTelegramWebApp();
  const [name, setName] = useState("");
  const [ticker, setTicker] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [preview, setPreview] = useState("");
  const [targetMode, setTargetMode] = useState<"test" | "production">("production");
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState("");
  const [successUrl, setSuccessUrl] = useState("");
  const [launchStatus, setLaunchStatus] = useState("");

  useEffect(() => {
    setName("");
    setTicker("");
    setDescription("");
    setPreview("");
    setImage("");
    setTargetMode("production");
  }, []);

  const targetModes = [
    { id: "production" as const, label: t.create.modeMain, targetTon: 8888 },
    { id: "test" as const, label: t.create.modeTest, targetTon: 5 }
  ];

  const activeTarget = targetModes.find((m) => m.id === targetMode) || targetModes[0];
  const cleanName = name.trim().replace(/\s+/g, " ").slice(0, 64);
  const cleanTicker = ticker.trim().replace(/^\$/g, "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10);
  const isValid = cleanName.length > 1 && /^[A-Z0-9]{2,10}$/.test(cleanTicker);

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      setError(locale === "ru" ? "Только PNG, JPG или WEBP" : "Only PNG, JPG or WEBP");
      return;
    }
    if (file.size > 2_000_000) {
      setError(locale === "ru" ? "Картинка должна быть меньше 2 MB" : "Image must be smaller than 2 MB");
      return;
    }
    try {
      setUploadingImage(true);
      setError("");
      setPreview(URL.createObjectURL(file));
      const uploaded = await uploadImage(file);
      setImage(uploaded);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : locale === "ru" ? "Загрузка не удалась" : "Upload failed");
    } finally { setUploadingImage(false); }
  };

  const handleLaunch = async () => {
    try {
      if (!wallet) throw new Error(locale === "ru" ? "Сначала подключи кошелёк" : "Connect wallet first");
      if (walletSource !== "tonconnect") throw new Error("TonConnect is required");
      if (!isMainnet) throw new Error(locale === "ru" ? "Нужен TON mainnet" : "TON mainnet is required");
      if (!isValid) throw new Error(locale === "ru" ? "Проверь название и ticker" : "Check name and ticker");
      setLoading(true);
      setError("");
      setSuccessUrl("");
      app?.HapticFeedback.impactOccurred("medium");
      const creatorTax = normalizeCreatorTax({ mode: "normal" });

      setLaunchStatus(locale === "ru" ? "Готовлю полный launch draft..." : "Preparing full launch draft...");
      const launch = await prepareLaunchDraft({ creatorAddress: wallet, name: cleanName, ticker: cleanTicker, description: description.trim().slice(0, 500), imageUrl: image || "", targetTon: activeTarget.targetTon });

      setLaunchStatus(locale === "ru" ? "Шаг 1/2: подпиши deploy контрактов..." : "Step 1/2: sign contract deploy...");
      await sendTransaction(launch.deploymentDraft);

      setLaunchStatus(locale === "ru" ? "Шаг 2/2: подпиши activation + commission..." : "Step 2/2: sign activation + fee...");
      await sendTransaction(launch.activationDraft);

      await createTokenRequest({
        name: cleanName,
        ticker: cleanTicker,
        image,
        description: description.trim().slice(0, 500),
        creatorWallet: wallet,
        creatorTax,
        totalSupply: "1000000000",
        curveConfig: { targetTon: activeTarget.targetTon, minBuyTon: 0.05, feeBps: 75 },
        contractAddresses: { factory: launch.contracts.factory, bondingCurve: launch.contracts.bondingCurve, jettonMaster: launch.contracts.jettonMaster, lpLock: launch.contracts.lpLock }
      });

      setLaunchStatus(locale === "ru" ? "Launch активирован. Открываю токен..." : "Launch activated. Opening token...");
      setSuccessUrl(`/token/${encodeURIComponent(launch.contracts.bondingCurve)}`);
      app?.HapticFeedback.notificationOccurred("success");
      router.refresh();
    } catch (caughtError) {
      app?.HapticFeedback.notificationOccurred("error");
      setLaunchStatus("");
      setError(caughtError instanceof Error ? caughtError.message : locale === "ru" ? "Запуск не удался" : "Launch failed");
    } finally { setLoading(false); }
  };

  return (
    <div className="space-y-5 pb-8">
      {!wallet ? (
        <section className="glass-card rounded-[28px] p-5"><p className="text-xs uppercase tracking-[0.2em] text-[#5ac8fa]">{locale === "ru" ? "Нужен кошелёк" : "Wallet required"}</p><h2 className="mt-2 font-display text-2xl font-bold text-white">{locale === "ru" ? "Подключи кошелёк, чтобы запустить токен" : "Connect your wallet to launch a token"}</h2><p className="mt-3 text-sm leading-6 text-[#c6d4ea]">{locale === "ru" ? "Лаунч создаст реальные pool/jetton контракты и комиссию через TonConnect." : "Launch creates real pool/jetton contracts and fee through TonConnect."}</p><div className="mt-5"><WalletConnectButton /></div></section>
      ) : (
        <section className="glass-card rounded-[28px] p-5"><p className="text-xs uppercase tracking-[0.2em] text-[#5ac8fa]">{locale === "ru" ? "Кошелёк подключён" : "Wallet connected"}</p><div className="mt-2 inline-flex rounded-full border border-[#5ac8fa]/20 bg-[#5ac8fa]/10 px-4 py-2 font-mono text-sm text-white break-all">{wallet}</div></section>
      )}

      <section className="glass-card rounded-[28px] p-5"><h2 className="font-display text-2xl font-bold text-white">{locale === "ru" ? "Загрузи иконку токена" : "Upload token icon"}</h2><p className="mt-2 text-sm leading-6 text-[#c6d4ea]">{locale === "ru" ? "PNG, JPG или WEBP. Лучше квадратная картинка." : "PNG, JPG or WEBP. Square image recommended."}</p><div onClick={() => fileInputRef.current?.click()} className="mt-4 flex aspect-square w-full max-w-[240px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-[28px] border border-dashed border-[#2a4e74] bg-[#0b1325] p-4 text-center transition hover:border-[#5ac8fa]">{preview ? <Image src={preview} alt="preview" width={240} height={240} className="h-full w-full rounded-[24px] object-cover" /> : <><div className="text-sm font-semibold text-white">{locale === "ru" ? "Загрузить иконку" : "Upload token icon"}</div><div className="mt-2 text-xs text-[#8ba3c1]">{locale === "ru" ? "Нажми, чтобы загрузить квадратную картинку" : "Click to upload a square image"}</div></>}</div><input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />{uploadingImage ? <p className="mt-3 text-xs text-[#8ba3c1]">{locale === "ru" ? "Загружаю картинку..." : "Uploading image..."}</p> : null}</section>

      <section className="glass-card rounded-[28px] p-5 space-y-4"><h2 className="font-display text-2xl font-bold text-white">{locale === "ru" ? "Детали токена" : "Token details"}</h2><div><label className="mb-2 block text-xs uppercase tracking-[0.16em] text-[#8ba3c1]">{locale === "ru" ? "Название токена" : "Token name"}</label><input value={name} onChange={(e) => setName(e.target.value.slice(0, 64))} placeholder="PEPE on GRAM" className="input-field" /></div><div><label className="mb-2 block text-xs uppercase tracking-[0.16em] text-[#8ba3c1]">Ticker</label><input value={ticker} onChange={(e) => setTicker(e.target.value.toUpperCase().replace(/^\$/g, "").replace(/[^A-Z0-9]/g, "").slice(0, 10))} placeholder="PEPE" className="input-field font-mono uppercase" maxLength={10} /></div><div><label className="mb-2 block text-xs uppercase tracking-[0.16em] text-[#8ba3c1]">{locale === "ru" ? "Описание" : "Description"}</label><textarea value={description} onChange={(e) => setDescription(e.target.value.slice(0, 500))} placeholder={locale === "ru" ? "Опиши токен и почему запуск интересный." : "Describe the token and what makes the launch interesting."} className="input-field h-24 resize-none" maxLength={500} /></div></section>

      <section className="glass-card rounded-[28px] p-5"><h2 className="font-display text-2xl font-bold text-white">{t.create.modeTitle}</h2><div className="mt-4 grid gap-3 md:grid-cols-2">{targetModes.map((mode) => <button key={mode.id} type="button" onClick={() => setTargetMode(mode.id)} className={`rounded-[22px] border p-4 text-left transition ${targetMode === mode.id ? "border-[#5ac8fa] bg-[#5ac8fa]/10" : "border-white/10 bg-white/5"}`}><div className="font-semibold text-white">{mode.label}</div><div className="mt-1 text-sm text-[#8ba3c1]">{mode.id === "test" ? (locale === "ru" ? "Внутренний режим для проверки." : "Internal check mode.") : (locale === "ru" ? "Публичный запуск по умолчанию." : "Default public launch.")}</div></button>)}</div></section>

      <section className="glass-card rounded-[28px] p-5"><h3 className="text-xs uppercase tracking-[0.2em] text-[#5ac8fa]">{locale === "ru" ? "Превью" : "Preview"}</h3><div className="mt-4 flex items-center gap-3"><div className="h-14 w-14 overflow-hidden rounded-2xl bg-[#111b2c]">{preview ? <Image src={preview} alt="preview" width={56} height={56} className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center text-2xl">💎</div>}</div><div><div className="font-bold text-white">{cleanName || (locale === "ru" ? "Название токена" : "Token name")} <span className="font-mono text-sm text-[#5ac8fa]">{cleanTicker || "TICK"}</span></div><div className="mt-1 text-sm text-[#8ba3c1]">{locale === "ru" ? "Режим цели:" : "Target mode:"} {activeTarget.label}</div></div></div></section>

      {error ? <div className="rounded-2xl border border-[#5ac8fa]/20 bg-[#5ac8fa]/10 px-4 py-3 text-sm text-[#c6e8ff]">{error}</div> : null}

      <div><button onClick={handleLaunch} disabled={!isValid || loading || uploadingImage || !wallet} className={`${primaryButtonClass} flex w-full items-center justify-center disabled:cursor-not-allowed disabled:opacity-40`}>{loading ? (launchStatus || (locale === "ru" ? "Готовлю launch..." : "Preparing launch...")) : (locale === "ru" ? "Запустить публичный launch" : "Launch public token")}</button><p className="mt-3 text-center text-sm text-[#8ba3c1]">{launchStatus || (locale === "ru" ? "По умолчанию 8888 GRAM. Две подписи: deploy, затем activation + commission." : "Defaults to 8888 GRAM. Two signatures: deploy, then activation + fee.")}</p></div>
      {successUrl ? <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 px-4"><div className="glass-card w-full max-w-md p-6 text-center"><h2 className="font-display text-2xl font-bold text-white">{locale === "ru" ? "Launch активирован" : "Launch activated"}</h2><p className="mt-3 text-sm text-[#8ba3c1]">{locale === "ru" ? "Токен сохранён как BONDING. Покупки доступны после открытия страницы токена." : "Token is saved as BONDING. Buys are available on the token page."}</p><div className="mt-5 flex gap-3"><Link href={successUrl} className={`${primaryButtonClass} flex-1`}>{locale === "ru" ? "Открыть токен" : "Open token"}</Link></div></div></div> : null}
    </div>
  );
}
