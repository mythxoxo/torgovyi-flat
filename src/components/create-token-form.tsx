"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { buildCreateTokenDraft, isTonAddress, toMainnetAddress } from "../lib/onchain";
import { normalizeCreatorTax } from "../lib/shared";
import { createToken as createTokenRequest, uploadTokenImage as uploadImage } from "../lib/api";
import { useWallet } from "./wallet-context";
import { WalletConnectButton } from "./wallet-connect-button";
import { getTelegramWebApp } from "../lib/telegram";
import { useUi } from "./page-shell";

export function CreateTokenForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { wallet, walletSource, isMainnet, sendTransaction } = useWallet();
  const { locale } = useUi();
  const app = getTelegramWebApp();
  const [name, setName] = useState("");
  const [ticker, setTicker] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [preview, setPreview] = useState("");
  const [targetMode, setTargetMode] = useState<"test" | "production">("test");
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState("");
  const [successUrl, setSuccessUrl] = useState("");

  useEffect(() => {
    setName("");
    setTicker("");
    setDescription("");
    setPreview("");
    setImage("");
    setTargetMode("test");
  }, []);

  const targetModes = [
    { id: "test" as const, label: locale === "ru" ? "Тест: 5 TON" : "Test: 5 TON", targetTon: 5 },
    { id: "production" as const, label: locale === "ru" ? "Прод: 8888 TON" : "Production: 8888 TON", targetTon: 8888 }
  ];

  const activeTarget = targetModes.find((m) => m.id === targetMode) || targetModes[0];
  const isValid = name.trim().length > 1 && ticker.trim().length > 1;

  const onFile = async (file: File | undefined) => {
    if (!file) return;
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
    } finally {
      setUploadingImage(false);
    }
  };

  const handleLaunch = async () => {
    try {
      if (!wallet) throw new Error(locale === "ru" ? "Сначала подключи кошелёк" : "Connect wallet first");
      setLoading(true);
      setError("");
      app?.HapticFeedback.impactOccurred("medium");
      const creatorTax = normalizeCreatorTax({ mode: "normal" });
      if (walletSource !== "tonconnect") throw new Error("TonConnect is required");
      if (!isMainnet) throw new Error(locale === "ru" ? "Нужен TON mainnet" : "TON mainnet is required");
      const factoryAddress = process.env.NEXT_PUBLIC_FACTORY_ADDRESS || "";
      if (!isTonAddress(factoryAddress)) throw new Error(locale === "ru" ? "Factory address ещё не настроен" : "Factory address is not configured yet");

      await sendTransaction(
        buildCreateTokenDraft({
          factoryAddress: toMainnetAddress(factoryAddress),
          creatorAddress: wallet,
          name,
          ticker,
          description,
          imageUrl: image || "",
          totalSupply: 1_000_000_000n,
          creatorTax,
          curveConfig: { targetTon: activeTarget.targetTon, minBuyTon: 0.05, feeBps: 75 }
        })
      );

      await createTokenRequest({
        name,
        ticker,
        image,
        description,
        creatorWallet: wallet,
        creatorTax,
        totalSupply: "1000000000",
        curveConfig: { targetTon: activeTarget.targetTon, minBuyTon: 0.05, feeBps: 75 }
      });

      setSuccessUrl("/my-tokens");
      app?.HapticFeedback.notificationOccurred("success");
      router.refresh();
    } catch (caughtError) {
      app?.HapticFeedback.notificationOccurred("error");
      setError(caughtError instanceof Error ? caughtError.message : locale === "ru" ? "Подготовка запуска не удалась" : "Launch preparation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5 pb-8">
      {!wallet ? (
        <section className="glass-card rounded-[28px] p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-[#7dd3fc]">{locale === "ru" ? "Нужен кошелёк" : "Wallet required"}</p>
          <h2 className="mt-2 font-display text-2xl font-bold text-white">{locale === "ru" ? "Подключи кошелёк, чтобы подготовить launch транзакции" : "Connect your wallet to prepare launch transactions"}</h2>
          <p className="mt-3 text-sm leading-6 text-[#c6d4ea]">{locale === "ru" ? "Каждую транзакцию ты подпишешь вручную в кошельке." : "You will sign every transaction manually in your wallet."}</p>
          <div className="mt-5"><WalletConnectButton /></div>
        </section>
      ) : (
        <section className="glass-card rounded-[28px] p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-[#7dd3fc]">{locale === "ru" ? "Кошелёк подключён" : "Wallet connected"}</p>
          <div className="mt-2 inline-flex rounded-full border border-[#7dd3fc]/20 bg-[#7dd3fc]/10 px-4 py-2 font-mono text-sm text-white break-all">{wallet}</div>
        </section>
      )}

      <section className="glass-card rounded-[28px] p-5">
        <h2 className="font-display text-2xl font-bold text-white">{locale === "ru" ? "Загрузи иконку токена" : "Upload token icon"}</h2>
        <p className="mt-2 text-sm leading-6 text-[#c6d4ea]">{locale === "ru" ? "PNG, JPG или WEBP. Лучше квадратная картинка." : "PNG, JPG or WEBP. Square image recommended."}</p>
        <div onClick={() => fileInputRef.current?.click()} className="mt-4 flex aspect-square w-full max-w-[240px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-[28px] border border-dashed border-[#2a4e74] bg-[#0b1325] p-4 text-center transition hover:border-[#7dd3fc]">
          {preview ? <Image src={preview} alt="preview" width={240} height={240} className="h-full w-full rounded-[24px] object-cover" /> : <><div className="text-sm font-semibold text-white">{locale === "ru" ? "Загрузить иконку" : "Upload token icon"}</div><div className="mt-2 text-xs text-[#8ba3c1]">{locale === "ru" ? "Нажми, чтобы загрузить квадратную картинку" : "Click to upload a square image"}</div></>}
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
        {uploadingImage ? <p className="mt-3 text-xs text-[#8ba3c1]">{locale === "ru" ? "Загружаю картинку..." : "Uploading image..."}</p> : null}
      </section>

      <section className="glass-card rounded-[28px] p-5 space-y-4">
        <h2 className="font-display text-2xl font-bold text-white">{locale === "ru" ? "Детали токена" : "Token details"}</h2>
        <div><label className="mb-2 block text-xs uppercase tracking-[0.16em] text-[#8ba3c1]">{locale === "ru" ? "Название токена" : "Token name"}</label><input value={name} onChange={(e) => setName(e.target.value)} placeholder={locale === "ru" ? "PEPE на TON" : "PEPE on TON"} className="input-field" /></div>
        <div><label className="mb-2 block text-xs uppercase tracking-[0.16em] text-[#8ba3c1]">Ticker</label><input value={ticker} onChange={(e) => setTicker(e.target.value.toUpperCase().replace("$", "").slice(0, 10))} placeholder="PEPE" className="input-field font-mono uppercase" maxLength={10} /></div>
        <div><label className="mb-2 block text-xs uppercase tracking-[0.16em] text-[#8ba3c1]">{locale === "ru" ? "Описание" : "Description"}</label><textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder={locale === "ru" ? "Опиши токен и почему запуск интересный." : "Describe the token and what makes the launch interesting."} className="input-field h-24 resize-none" /></div>
      </section>

      <section className="glass-card rounded-[28px] p-5">
        <h2 className="font-display text-2xl font-bold text-white">{locale === "ru" ? "Режим цели" : "Target mode"}</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {targetModes.map((mode) => (
            <button key={mode.id} type="button" onClick={() => setTargetMode(mode.id)} className={`rounded-[22px] border p-4 text-left transition ${targetMode === mode.id ? "border-[#7dd3fc] bg-[#7dd3fc]/10" : "border-white/10 bg-white/5"}`}>
              <div className="font-semibold text-white">{mode.label}</div>
              <div className="mt-1 text-sm text-[#8ba3c1]">{mode.id === "test" ? (locale === "ru" ? "Используй для первого manual mainnet dust-test." : "Use this for the first manual mainnet dust-test.") : (locale === "ru" ? "Используй после полного live proof." : "Use this after live proof is complete.")}</div>
            </button>
          ))}
        </div>
      </section>

      <section className="glass-card rounded-[28px] p-5">
        <h3 className="text-xs uppercase tracking-[0.2em] text-[#7dd3fc]">{locale === "ru" ? "Превью" : "Preview"}</h3>
        <div className="mt-4 flex items-center gap-3"><div className="h-14 w-14 overflow-hidden rounded-2xl bg-[#111b2c]">{preview ? <Image src={preview} alt="preview" width={56} height={56} className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center text-2xl">💎</div>}</div><div><div className="font-bold text-white">{name || (locale === "ru" ? "Название токена" : "Token name")} <span className="font-mono text-sm text-[#7dd3fc]">{ticker || "TICK"}</span></div><div className="mt-1 text-sm text-[#8ba3c1]">{locale === "ru" ? "Режим цели:" : "Target mode:"} {activeTarget.label}</div></div></div>
      </section>

      {error ? <div className="rounded-2xl border border-[#7dd3fc]/20 bg-[#7dd3fc]/10 px-4 py-3 text-sm text-[#c6e8ff]">{error}</div> : null}

      <div>
        <button onClick={handleLaunch} disabled={!isValid || loading || uploadingImage || !wallet} className="btn-primary flex w-full items-center justify-center text-center disabled:cursor-not-allowed disabled:opacity-40">{loading ? (locale === "ru" ? "Подготавливаю launch транзакции..." : "Preparing launch transactions...") : (locale === "ru" ? "Подготовить launch транзакции" : "Prepare launch transactions")}</button>
        <p className="mt-3 text-center text-sm text-[#8ba3c1]">{locale === "ru" ? "Ты подпишешь каждую транзакцию вручную в TonConnect / Tonkeeper. Без backend custody." : "You will sign every transaction manually in TonConnect / Tonkeeper. No backend custody."}</p>
      </div>

      {successUrl ? <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 px-4"><div className="glass-card w-full max-w-md p-6 text-center"><h2 className="font-display text-2xl font-bold text-white">{locale === "ru" ? "Launch транзакции подготовлены" : "Launch transactions prepared"}</h2><p className="mt-3 text-sm text-[#8ba3c1]">{locale === "ru" ? "Теперь дождись подтверждения индексера после подписанных транзакций. Fake deploy status не показывается." : "Now wait for indexer confirmation after signed transactions. No fake deploy state is shown before that."}</p><div className="mt-5 flex gap-3"><Link href={successUrl} className="btn-primary flex-1 text-center">{locale === "ru" ? "Мои токены" : "My tokens"}</Link></div></div></div> : null}
    </div>
  );
}
