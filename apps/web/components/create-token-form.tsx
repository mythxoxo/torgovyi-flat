"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { buildCreateTokenDraft, isTonAddress } from "@meme-launchpad/sdk";
import { normalizeCreatorTax } from "@meme-launchpad/shared";

import { createToken as createTokenRequest, uploadImage } from "../lib/api";
import { useWallet } from "./wallet-context";

const taxOptions = [
  { value: "normal", label: "Mode A: Normal", note: "0% creator tax" },
  { value: "burn", label: "Mode B: Burn", note: "1% tax, 100% burn" },
  { value: "buyback_burn", label: "Mode C: Buyback + Burn", note: "1.5% tax, 70/30 split" },
  { value: "custom", label: "Mode D: Custom", note: "Up to 2%, custom split" }
] as const;

export function CreateTokenForm() {
  const router = useRouter();
  const { wallet, walletSource, isMainnet, sendTransaction } = useWallet();
  const fileRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [ticker, setTicker] = useState("");
  const [description, setDescription] = useState("");
  const [telegramLink, setTelegramLink] = useState("");
  const [twitterLink, setTwitterLink] = useState("");
  const [websiteLink, setWebsiteLink] = useState("");
  const [image, setImage] = useState("");
  const [mode, setMode] = useState<"normal" | "burn" | "buyback_burn" | "custom">("normal");
  const [customRate, setCustomRate] = useState("0.5");
  const [customBuyback, setCustomBuyback] = useState("50");
  const [customBurn, setCustomBurn] = useState("50");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [preview, setPreview] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [launchedTokenId, setLaunchedTokenId] = useState("");

  useEffect(() => {
    setName("");
    setTicker("");
    setDescription("");
    setPreview("");
    setImage("");
    setMode("normal");
    setTelegramLink("");
    setTwitterLink("");
    setWebsiteLink("");
  }, []);

  const creatorTaxRate =
    mode === "normal" ? 0 : mode === "burn" ? 1 : mode === "buyback_burn" ? 1.5 : Number(customRate);
  const totalFee = 0.75 + creatorTaxRate;

  const onFile = async (file: File | undefined) => {
    if (!file) {
      return;
    }

    if (file.size > 2_000_000) {
      setError("Image must stay under 2 MB for MVP upload guardrails.");
      return;
    }

    try {
      setPreview(URL.createObjectURL(file));
      setUploadingImage(true);
      setError("");
      const uploaded = await uploadImage(file);
      setImage(uploaded.url);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Image upload failed");
    } finally {
      setUploadingImage(false);
    }
  };

  const submit = async () => {
    try {
      if (!wallet) {
        throw new Error("Connect a TON wallet before launching a token");
      }

      setLoading(true);
      setError("");
      const creatorTax =
        mode === "custom"
          ? normalizeCreatorTax({
              mode,
              rate: Number(customRate) / 100,
              buybackSplit: Number(customBuyback) / 100,
              burnSplit: Number(customBurn) / 100
            })
          : normalizeCreatorTax({ mode });

      if (walletSource === "tonconnect") {
        if (!isMainnet) {
          throw new Error("Switch your wallet to TON mainnet before launching");
        }

        const factoryAddress = process.env.NEXT_PUBLIC_FACTORY_ADDRESS || "";
        if (!isTonAddress(factoryAddress)) {
          throw new Error("Mainnet factory address is not configured");
        }

        await sendTransaction(
          buildCreateTokenDraft({
            factoryAddress,
            creatorAddress: wallet,
            name,
            ticker,
            metadataUri: image || websiteLink || telegramLink || "",
            creatorTax
          })
        );
      }

      const created = await createTokenRequest({
        name,
        ticker,
        image,
        description,
        telegramLink,
        twitterLink,
        websiteLink,
        creatorWallet: wallet,
        creatorTax
      });

      setLaunchedTokenId(created.id);
      await import("@twa-dev/sdk").then(({ default: WebApp }) => {
        WebApp.HapticFeedback.notificationOccurred("success");
      });
      router.refresh();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Create token failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 px-4">
      <div className="glass-card p-4">
        <div className="space-y-4">
          <div
            onClick={() => fileRef.current?.click()}
            onDrop={(event) => {
              event.preventDefault();
              setIsDragging(false);
              void onFile(event.dataTransfer.files[0]);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDragOver={(event) => {
              event.preventDefault();
              setIsDragging(true);
            }}
            className={`relative mx-auto flex aspect-square max-w-[180px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed transition-all ${
              isDragging ? "border-[#0088cc] bg-[#0088cc]/10" : "border-[#1e3a5f] hover:border-[#0088cc]/50"
            }`}
          >
            {preview ? (
              <Image src={preview} alt="preview" fill className="object-cover" unoptimized />
            ) : (
              <>
                <Image src="/brand/img_05.jpg" alt="upload" width={80} height={80} className="mb-2 rounded-xl object-cover opacity-70" />
                <p className="px-2 text-center text-xs text-[#8ba3c1]">💎 Перетащи или нажми</p>
              </>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(event) => void onFile(event.target.files?.[0])} />
          {uploadingImage ? <p className="text-center text-xs text-[#00b4d8]">Загрузка...</p> : null}

          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Название" className="input-field" />
          <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-bold text-[#0088cc]">$</span>
            <input
              value={ticker}
              onChange={(e) => setTicker(e.target.value.toUpperCase().replace("$", ""))}
              placeholder="PEPE"
              className="input-field pl-8 font-mono uppercase"
              maxLength={10}
            />
          </div>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Описание" className="input-field min-h-28" />
          <input value={telegramLink} onChange={(e) => setTelegramLink(e.target.value)} placeholder="Telegram" className="input-field" />
          <input value={twitterLink} onChange={(e) => setTwitterLink(e.target.value)} placeholder="X / Twitter" className="input-field" />
          <input value={websiteLink} onChange={(e) => setWebsiteLink(e.target.value)} placeholder="Сайт" className="input-field" />
        </div>
      </div>

      <div className="glass-card p-4">
        <h3 className="text-lg font-semibold text-white">Creator tax</h3>
        <div className="mt-4 space-y-2">
          {taxOptions.map((option) => (
            <label
              key={option.value}
              className={`block cursor-pointer rounded-xl border px-4 py-3 transition ${
                mode === option.value ? "border-[#0088cc] bg-[#0088cc]/10" : "border-[#1e3a5f] bg-[#1a2235]"
              }`}
            >
              <input type="radio" name="mode" checked={mode === option.value} onChange={() => setMode(option.value)} className="sr-only" />
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-white">{option.label}</p>
                  <p className="mt-1 text-xs text-[#8ba3c1]">{option.note}</p>
                </div>
                <span className="font-mono text-sm text-[#00c896]">
                  {option.value === "normal" ? "0%" : option.value === "burn" ? "1%" : option.value === "buyback_burn" ? "1.5%" : "до 2%"}
                </span>
              </div>
            </label>
          ))}
        </div>

        {mode === "custom" ? (
          <div className="mt-4 grid grid-cols-3 gap-3">
            <input value={customRate} onChange={(e) => setCustomRate(e.target.value)} placeholder="Tax %" className="input-field" />
            <input value={customBuyback} onChange={(e) => setCustomBuyback(e.target.value)} placeholder="Buyback %" className="input-field" />
            <input value={customBurn} onChange={(e) => setCustomBurn(e.target.value)} placeholder="Burn %" className="input-field" />
          </div>
        ) : null}
      </div>
      {totalFee > 2 ? <p className="text-sm text-amber-300">Комиссия выше 2%.</p> : null}

      {error ? <p className="text-sm text-rose-300">{error}</p> : null}

      <button
        type="button"
        onClick={() => {
          void import("@twa-dev/sdk").then(({ default: WebApp }) => WebApp.HapticFeedback.impactOccurred("medium"));
          void submit();
        }}
        disabled={!name || !ticker || loading || uploadingImage}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#0088cc] to-[#00c896] py-4 font-syne text-lg font-bold text-black transition-all active:scale-[0.98] disabled:opacity-40"
      >
        {loading ? "..." : <><span>🚀</span> Запустить на TON</>}
      </button>
      <p className="mt-2 text-center text-xs text-[#8ba3c1]">Взнос: 1 TON · TON Connect</p>

      {launchedTokenId ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0f1a]/90 px-4">
          <div className="glass-card max-w-sm p-6 text-center">
            <Image src="/brand/img_09.jpg" alt="success" width={160} height={100} className="mx-auto rounded-xl object-contain" />
            <h2 className="mt-4 font-syne text-2xl font-bold text-white">Токен запущен! 🎉</h2>
            <p className="mt-2 text-sm text-[#8ba3c1]">
              {name} <span className="text-[#0088cc]">${ticker}</span> теперь торгуется
            </p>
            <div className="mt-5 flex gap-3">
              <Link href={`/token/${launchedTokenId}`} className="flex-1">
                <button className="w-full rounded-xl bg-gradient-to-r from-[#0088cc] to-[#00c896] py-3 font-bold text-black">
                  Смотреть
                </button>
              </Link>
              <button
                onClick={() => {
                  const url = `${window.location.origin}/token/${launchedTokenId}`;
                  window.Telegram?.WebApp?.openTelegramLink?.(`https://t.me/share/url?url=${encodeURIComponent(url)}`);
                }}
                className="flex-1 rounded-xl border border-[#0088cc]/30 py-3 text-sm text-[#0088cc]"
              >
                ✈️ Поделиться
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
