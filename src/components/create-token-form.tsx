"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronDown, Globe, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { buildCreateTokenDraft, isTonAddress, toMainnetAddress } from "../lib/ton";
import { normalizeCreatorTax } from "../lib/shared";
import { createToken as createTokenRequest, uploadTokenImage as uploadImage } from "../lib/api";
import { useWallet } from "./wallet-context";
import { getTelegramWebApp } from "../lib/telegram";

const taxModes = [
  { id: "normal", label: "Mode A: Normal", desc: "Без creator tax", tax: "0%" },
  { id: "burn", label: "Mode B: Burn", desc: "1% tax, 100% сжигается", tax: "1%" },
  { id: "buyback_burn", label: "Mode C: Buyback + Burn", desc: "1.5% tax, 70% buyback / 30% burn", tax: "1.5%" },
  { id: "custom", label: "Mode D: Custom", desc: "До 2%, кастомный сплит", tax: "до 2%" }
] as const;

export function CreateTokenForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { wallet, walletSource, isMainnet, sendTransaction } = useWallet();
  const app = getTelegramWebApp();
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

  const creatorTax = mode === "normal" ? 0 : mode === "burn" ? 1 : mode === "buyback_burn" ? 1.5 : Number(customRate);
  const totalFee = (0.75 + creatorTax).toFixed(2);
  const isValid = name.trim().length > 1 && ticker.trim().length > 1;

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    if (file.size > 2_000_000) {
      setError("Картинка должна быть меньше 2 МБ");
      return;
    }

    try {
      setUploadingImage(true);
      setError("");
      setPreview(URL.createObjectURL(file));
      const uploaded = await uploadImage(file);
      setImage(uploaded);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Ошибка загрузки картинки");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleLaunch = async () => {
    try {
      if (!wallet) throw new Error("Сначала подключи кошелёк");
      setLoading(true);
      setError("");
      app?.HapticFeedback.impactOccurred("medium");

      const normalizedCreatorTax =
        mode === "custom"
          ? normalizeCreatorTax({ mode, rate: Number(customRate) / 100, buybackSplit: Number(customBuyback) / 100, burnSplit: Number(customBurn) / 100 })
          : normalizeCreatorTax({ mode });

      if (walletSource === "tonconnect") {
        if (!isMainnet) throw new Error("Нужен TON mainnet");
        const factoryAddress = process.env.NEXT_PUBLIC_FACTORY_ADDRESS || "";
        if (!isTonAddress(factoryAddress)) throw new Error("Factory address не настроен");
        await sendTransaction(
          buildCreateTokenDraft({
            factoryAddress: toMainnetAddress(factoryAddress),
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
      app?.HapticFeedback.notificationOccurred("success");
      router.refresh();
    } catch (caughtError) {
      app?.HapticFeedback.notificationOccurred("error");
      setError(caughtError instanceof Error ? caughtError.message : "Ошибка запуска");
    } finally {
      setLoading(false);
    }
  };

  const shareToTelegram = () => {
    if (!successUrl) return;
    app?.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(`${window.location.origin}${successUrl}`)}&text=${encodeURIComponent(`🚀 ${name} ($${ticker}) на TONK.MEM!`)}`);
  };

  return (
    <div className="space-y-4 pb-8">
      <div className="mx-4 glass-card p-4">
        <h2 className="mb-4 font-display text-white text-xl font-bold">Иконка токена</h2>
        <div onClick={() => fileInputRef.current?.click()} className="relative mx-auto flex aspect-square max-w-[180px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-[#1e3a5f] transition-all hover:border-[#0088cc]/50">
          {preview ? <Image src={preview} alt="preview" fill className="object-cover" /> : <><Image src="/brand/img_05.jpg" alt="upload" fill className="object-cover opacity-38" /><div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,12,24,0.1),rgba(6,12,24,0.75))]" /><div className="relative z-10 flex flex-col items-center px-3"><div className="rounded-full border border-white/10 bg-black/25 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7dd3fc]">Drag & drop cover</div><p className="mt-3 text-center text-sm font-semibold text-white">Перетащи арт токена или тапни для загрузки</p><p className="mt-1 text-center text-xs text-[#c4d7ef]">Премиальный launch screen вместо пустого аплоада</p></div></>}
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
        {uploadingImage ? <p className="mt-3 text-center text-xs text-[#8ba3c1]">Загрузка картинки...</p> : null}
      </div>

      <div className="mx-4 glass-card space-y-4 p-4">
        <h2 className="font-display text-xl font-bold text-white">Информация о токене</h2>
        <div className="space-y-1"><label className="text-xs text-[#8ba3c1]">Название *</label><input value={name} onChange={(e) => setName(e.target.value)} placeholder="Например: PEPE ON TON" className="input-field" /></div>
        <div className="space-y-1"><label className="text-xs text-[#8ba3c1]">Тикер *</label><div className="relative"><span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-bold text-[#0088cc]">$</span><input value={ticker} onChange={(e) => setTicker(e.target.value.toUpperCase().replace('$', '').slice(0, 10))} placeholder="PEPE" className="input-field pl-8 font-mono uppercase" maxLength={10} /></div></div>
        <div className="space-y-1"><label className="text-xs text-[#8ba3c1]">Описание</label><textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Расскажи про свой токен..." className="input-field h-20 resize-none" /></div>
      </div>

      <div className="mx-4 overflow-hidden glass-card">
        <button onClick={() => setShowLinks(!showLinks)} className="flex w-full items-center justify-between p-4 text-sm text-[#8ba3c1]">
          <span>🔗 Добавить ссылки (опционально)</span>
          <ChevronDown className={`h-4 w-4 transition-transform ${showLinks ? 'rotate-180' : ''}`} />
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
          <label key={item.id} className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-all ${mode === item.id ? 'border-[#0088cc] bg-[#0088cc]/10' : 'border-[#1e3a5f]'}`}>
            <input type="radio" name="taxMode" value={item.id} className="mt-0.5 accent-[#0088cc]" checked={mode === item.id} onChange={() => setMode(item.id)} />
            <div><div className="text-sm font-bold text-white">{item.label}</div><div className="mt-0.5 text-xs text-[#8ba3c1]">{item.desc}</div></div>
            <span className="ml-auto font-mono text-xs font-bold text-[#00c896]">{item.tax}</span>
          </label>
        ))}
        {mode === "custom" ? <div className="grid grid-cols-3 gap-2"><input value={customRate} onChange={(e) => setCustomRate(e.target.value)} className="input-field" placeholder="Tax %" /><input value={customBuyback} onChange={(e) => setCustomBuyback(e.target.value)} className="input-field" placeholder="Buyback %" /><input value={customBurn} onChange={(e) => setCustomBurn(e.target.value)} className="input-field" placeholder="Burn %" /></div> : null}
      </div>

      <div className="mx-4 glass-card p-4">
        <h3 className="mb-3 text-xs text-[#8ba3c1]">👁 Превью</h3>
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl bg-[#1a2235]">
            {preview ? <Image src={preview} alt="preview" width={48} height={48} className="h-full w-full object-cover" /> : <span className="flex h-full w-full items-center justify-center text-2xl">💎</span>}
          </div>
          <div>
            <div className="font-bold text-white">{name || <span className="text-[#8ba3c1]">Название токена</span>} <span className="font-mono text-sm text-[#0088cc]">${ticker || <span className="text-[#8ba3c1]">TICK</span>}</span></div>
            <div className="text-xs text-[#8ba3c1]">Bonding curve · Комиссия: {totalFee}%</div>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs"><div className="rounded-lg bg-[#1a2235] px-3 py-2"><div className="text-[#8ba3c1]">Взнос</div><div className="font-mono font-bold text-white">💎 1 TON</div></div><div className="rounded-lg bg-[#1a2235] px-3 py-2"><div className="text-[#8ba3c1]">Creator tax</div><div className="font-mono font-bold text-[#00c896]">{creatorTax}%</div></div><div className="rounded-lg bg-[#1a2235] px-3 py-2"><div className="text-[#8ba3c1]">Base fee</div><div className="font-mono font-bold text-white">0.75%</div></div><div className="rounded-lg bg-[#1a2235] px-3 py-2"><div className="text-[#8ba3c1]">Итого</div><div className="font-mono font-bold text-white">{totalFee}%</div></div></div>
      </div>

      {error ? <p className="mx-4 text-sm text-[#ff4757]">{error}</p> : null}

      <div className="mx-4 mb-8">
        <button onClick={handleLaunch} disabled={!isValid || loading || uploadingImage} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#0088cc] to-[#00c896] py-4 text-lg font-bold text-black transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40">
          {loading ? <span>Запуск...</span> : <><span>🚀</span> Запустить на TON</>}
        </button>
        <p className="mt-2 text-center text-xs text-[#8ba3c1]">Взнос: 1 TON · TON Connect</p>
      </div>

      {successUrl ? <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 px-4"><div className="glass-card w-full max-w-md overflow-hidden p-0 text-center"><div className="relative h-40 w-full"><Image src="/brand/img_09.jpg" alt="success" fill className="object-cover" /><div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,12,24,0.08),rgba(6,12,24,0.72))]" /></div><div className="space-y-4 p-6"><h2 className="font-display text-2xl font-bold text-white">Токен запущен! 🎉</h2><p className="text-sm text-[#8ba3c1]">{name} <span className="text-[#0088cc]">${ticker}</span> теперь торгуется</p><div className="flex gap-3"><Link href={successUrl} className="btn-primary flex-1 text-center">Смотреть</Link><button onClick={shareToTelegram} className="flex-1 rounded-xl border border-[#0088cc]/30 py-3 text-sm text-[#0088cc]">✈️ Поделиться</button></div></div></div></div> : null}
    </div>
  );
}
