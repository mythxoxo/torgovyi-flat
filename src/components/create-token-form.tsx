"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronDown, Globe, Send } from "lucide-react";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { buildCreateTokenDraft, isTonAddress, toTestnetAddress } from "../lib/ton";
import { normalizeCreatorTax } from "../lib/shared";
import { createToken as createTokenRequest, uploadTokenImage as uploadImage } from "../lib/api";
import { useWallet } from "./wallet-context";

const taxModes = [
  { id: "normal", label: "Mode A: Normal", description: "Без creator tax", tax: "0%" },
  { id: "burn", label: "Mode B: Burn", description: "1% tax, 100% сжигается", tax: "1%" },
  { id: "buyback_burn", label: "Mode C: Buyback + Burn", description: "1.5% tax, 70% buyback / 30% burn", tax: "1.5%" },
  { id: "custom", label: "Mode D: Custom", description: "До 2%, кастомный сплит", tax: "до 2%" }
] as const;

export function CreateTokenForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { wallet, walletSource, isTestnet, sendTransaction } = useWallet();
  const [name, setName] = useState("");
  const [ticker, setTicker] = useState("");
  const [description, setDescription] = useState("");
  const [telegramLink, setTelegramLink] = useState("");
  const [twitterLink, setTwitterLink] = useState("");
  const [websiteLink, setWebsiteLink] = useState("");
  const [image, setImage] = useState("");
  const [preview, setPreview] = useState("");
  const [mode, setMode] = useState<(typeof taxModes)[number]["id"]>("normal");
  const [customRate, setCustomRate] = useState("0.5");
  const [customBuyback, setCustomBuyback] = useState("50");
  const [customBurn, setCustomBurn] = useState("50");
  const [showLinks, setShowLinks] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState("");
  const [successUrl, setSuccessUrl] = useState("");

  const creatorTax = mode === "normal" ? 0 : mode === "burn" ? 1 : mode === "buyback_burn" ? 1.5 : Number(customRate);
  const totalFee = (0.75 + creatorTax).toFixed(2);
  const isValid = name.trim().length > 1 && ticker.trim().length > 1;

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    if (file.size > 2_000_000) {
      setError("Image must stay under 2 MB.");
      return;
    }

    try {
      setUploadingImage(true);
      setError("");
      setPreview(URL.createObjectURL(file));
      const uploaded = await uploadImage(file);
      setImage(uploaded);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Image upload failed");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleLaunch = async () => {
    try {
      if (!wallet) throw new Error("Connect wallet first");
      setLoading(true);
      setError("");

      const normalizedCreatorTax =
        mode === "custom"
          ? normalizeCreatorTax({ mode, rate: Number(customRate) / 100, buybackSplit: Number(customBuyback) / 100, burnSplit: Number(customBurn) / 100 })
          : normalizeCreatorTax({ mode });

      if (walletSource === "tonconnect") {
        if (!isTestnet) throw new Error("Switch wallet to TON testnet");
        const factoryAddress = process.env.NEXT_PUBLIC_FACTORY_ADDRESS || "";
        if (!isTonAddress(factoryAddress)) throw new Error("Factory address is not configured");
        await sendTransaction(
          buildCreateTokenDraft({
            factoryAddress: toTestnetAddress(factoryAddress),
            creatorAddress: wallet,
            name,
            ticker,
            metadataUri: image || websiteLink || telegramLink || "",
            creatorTax: normalizedCreatorTax
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
        creatorTax: normalizedCreatorTax
      });

      setSuccessUrl(`/token/${created.id}`);
      router.refresh();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Launch failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 pb-8">
      <div className="mx-4 glass-card p-4">
        <h2 className="mb-4 font-display text-xl font-bold text-white">Иконка токена</h2>
        <div onClick={() => fileInputRef.current?.click()} className="relative mx-auto flex aspect-square max-w-[200px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#1e3a5f] transition-all hover:border-[#0088cc]/50">
          {preview ? <Image src={preview} alt="preview" fill className="rounded-2xl object-cover" /> : <><Image src="/brand/img_05.jpg" alt="upload" width={64} height={64} className="mb-3 opacity-60" /><p className="text-center text-xs text-[#8ba3c1]">💎 Перетащи<br/>или нажми</p></>}
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
        {uploadingImage ? <p className="mt-3 text-center text-xs text-[#8ba3c1]">Uploading image...</p> : null}
      </div>

      <div className="mx-4 glass-card space-y-4 p-4">
        <h2 className="font-display text-xl font-bold text-white">Информация о токене</h2>
        <div className="space-y-1"><label className="text-xs text-[#8ba3c1]">Название токена *</label><input value={name} onChange={(e) => setName(e.target.value)} placeholder="Например: PEPE ON TON" className="input-field" /></div>
        <div className="space-y-1"><label className="text-xs text-[#8ba3c1]">Тикер *</label><div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-[#0088cc]">$</span><input value={ticker} onChange={(e) => setTicker(e.target.value.toUpperCase().slice(0, 10))} placeholder="PEPE" className="input-field pl-8 font-mono uppercase" maxLength={10} /></div></div>
        <div className="space-y-1"><label className="text-xs text-[#8ba3c1]">Описание</label><textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Расскажи про свой токен..." className="input-field h-20 resize-none" /></div>
      </div>

      <div className="mx-4 overflow-hidden glass-card">
        <button onClick={() => setShowLinks(!showLinks)} className="flex w-full items-center justify-between p-4 text-sm text-[#8ba3c1] transition-colors hover:text-white">
          <span>🔗 Добавить ссылки (опционально)</span>
          <ChevronDown className={`h-4 w-4 transition-transform ${showLinks ? "rotate-180" : ""}`} />
        </button>
        {showLinks ? <div className="space-y-3 border-t border-[#1e3a5f] px-4 pb-4">
          <div className="flex items-center gap-3"><Send className="h-5 w-5 flex-shrink-0 text-[#0088cc]" /><input value={telegramLink} onChange={(e) => setTelegramLink(e.target.value)} placeholder="https://t.me/..." className="input-field flex-1" /></div>
          <div className="flex items-center gap-3"><span className="h-5 w-5 flex-shrink-0 text-center text-[#8ba3c1]">𝕏</span><input value={twitterLink} onChange={(e) => setTwitterLink(e.target.value)} placeholder="https://twitter.com/..." className="input-field flex-1" /></div>
          <div className="flex items-center gap-3"><Globe className="h-5 w-5 flex-shrink-0 text-[#8ba3c1]" /><input value={websiteLink} onChange={(e) => setWebsiteLink(e.target.value)} placeholder="https://..." className="input-field flex-1" /></div>
        </div> : null}
      </div>

      <div className="mx-4 glass-card space-y-3 p-4">
        <h2 className="font-display text-xl font-bold text-white">Режим Creator Tax</h2>
        {taxModes.map((item) => (
          <label key={item.id} className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-all ${mode === item.id ? "border-[#0088cc] bg-[#0088cc]/10" : "border-[#1e3a5f] hover:border-[#0088cc]/40"}`}>
            <input type="radio" name="taxMode" value={item.id} className="mt-0.5 accent-[#0088cc]" checked={mode === item.id} onChange={() => setMode(item.id)} />
            <div><div className="text-sm font-bold text-white">{item.label}</div><div className="mt-0.5 text-xs text-[#8ba3c1]">{item.description}</div></div>
            <span className="ml-auto font-mono text-xs font-bold text-[#00c896]">{item.tax}</span>
          </label>
        ))}
        {mode === "custom" ? <div className="grid grid-cols-3 gap-2"><input value={customRate} onChange={(e) => setCustomRate(e.target.value)} className="input-field" placeholder="Tax %" /><input value={customBuyback} onChange={(e) => setCustomBuyback(e.target.value)} className="input-field" placeholder="Buyback %" /><input value={customBurn} onChange={(e) => setCustomBurn(e.target.value)} className="input-field" placeholder="Burn %" /></div> : null}
      </div>

      <div className="mx-4 glass-card border-[#0088cc]/30 p-4">
        <h3 className="mb-3 text-xs text-[#8ba3c1]">👁 Preview</h3>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-[#1a2235]">{preview ? <Image src={preview} alt="preview" width={48} height={48} className="object-cover" /> : <span className="text-2xl">💎</span>}</div>
          <div><div className="font-bold text-white">{name || "Название токена"} <span className="font-mono text-sm text-[#0088cc]">${ticker || "TICK"}</span></div><div className="text-xs text-[#8ba3c1]">Bonding curve · Fee: {totalFee}%</div></div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs"><div className="rounded-lg bg-[#1a2235] px-3 py-2"><div className="text-[#8ba3c1]">Creation fee</div><div className="font-mono font-bold text-white">💎 1 TON</div></div><div className="rounded-lg bg-[#1a2235] px-3 py-2"><div className="text-[#8ba3c1]">Creator tax</div><div className="font-mono font-bold text-[#00c896]">{creatorTax}%</div></div><div className="rounded-lg bg-[#1a2235] px-3 py-2"><div className="text-[#8ba3c1]">Base fee</div><div className="font-mono font-bold text-white">0.75%</div></div><div className="rounded-lg bg-[#1a2235] px-3 py-2"><div className="text-[#8ba3c1]">Total fee</div><div className="font-mono font-bold text-white">{totalFee}%</div></div></div>
      </div>

      {error ? <p className="mx-4 text-sm text-[#ff4757]">{error}</p> : null}

      <div className="mx-4 mb-8">
        <button onClick={handleLaunch} disabled={!isValid || loading || uploadingImage} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#0088cc] to-[#00c896] py-4 text-lg font-bold text-black transition-all active:scale-[0.98] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50">
          {loading ? <span>Launching...</span> : <><span>🚀</span> Launch on TON</>}
        </button>
        <p className="mt-2 text-center text-xs text-[#8ba3c1]">Fee: 1 TON · Testnet · TON Connect</p>
      </div>

      {successUrl ? <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 px-4"><div className="glass-card w-full max-w-md space-y-4 p-6 text-center"><Image src="/brand/img_09.jpg" alt="success" width={120} height={120} className="mx-auto" /><h2 className="font-display text-2xl font-bold text-white">Токен запущен! 🎉</h2><p className="text-sm text-[#8ba3c1]">{name} <span className="text-[#0088cc]">${ticker}</span> теперь торгуется</p><div className="flex gap-3"><Link href={successUrl} className="flex-1 rounded-xl bg-gradient-to-r from-[#0088cc] to-[#00c896] px-4 py-3 font-bold text-black">Смотреть токен</Link><button onClick={() => window.open(`https://t.me/share/url?url=${encodeURIComponent(successUrl)}&text=${encodeURIComponent(`🚀 ${name} ($${ticker}) на TONK.MEM!`)}`)} className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#0088cc]/30 bg-[#0088cc]/15 py-3 text-sm font-medium text-[#0088cc]">Поделиться</button></div></div></div> : null}
    </div>
  );
}
