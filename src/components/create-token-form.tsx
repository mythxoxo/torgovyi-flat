"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { buildCreateTokenDraft, isTonAddress, toTestnetAddress } from "../lib/ton";
import { normalizeCreatorTax } from "../lib/shared";

import { createToken as createTokenRequest, uploadTokenImage as uploadImage } from "../lib/api";
import { useWallet } from "./wallet-context";

const taxOptions = [
  { value: "normal", label: "Mode A: Normal", note: "0% creator tax" },
  { value: "burn", label: "Mode B: Burn", note: "1% tax, 100% burn" },
  { value: "buyback_burn", label: "Mode C: Buyback + Burn", note: "1.5% tax, 70/30 split" },
  { value: "custom", label: "Mode D: Custom", note: "Up to 2%, custom split" }
] as const;

export function CreateTokenForm() {
  const router = useRouter();
  const { wallet, walletSource, isTestnet, sendTransaction } = useWallet();
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
        if (!isTestnet) {
          throw new Error("Switch your wallet to TON testnet before launching");
        }

        const factoryAddress = process.env.NEXT_PUBLIC_FACTORY_ADDRESS || "";
        if (!isTonAddress(factoryAddress)) {
          throw new Error("Testnet factory address is not configured");
        }

        await sendTransaction(
          buildCreateTokenDraft({
            factoryAddress: toTestnetAddress(factoryAddress),
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

      router.push(`/token/${created.id}`);
      router.refresh();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Create token failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="card-surface rounded-xl p-4">
        <h2 className="text-xl font-semibold text-white">Create token</h2>
        <p className="mt-2 text-sm text-mist">
          Launch fee is 1 TON on testnet. It refunds only after graduation.
        </p>

        <div className="mt-4 space-y-3">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Token name" className="w-full rounded-lg border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-cyan-300" />
          <input value={ticker} onChange={(e) => setTicker(e.target.value.toUpperCase())} placeholder="Ticker" className="w-full rounded-lg border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-cyan-300" />
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" className="min-h-28 w-full rounded-lg border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-cyan-300" />
          <input type="file" accept="image/*" onChange={(e) => onFile(e.target.files?.[0])} className="w-full rounded-lg border border-dashed border-white/10 bg-black/20 px-4 py-3 text-sm text-mist" />
          {image ? <p className="text-xs text-emerald-300">Image uploaded and stored outside app state.</p> : null}
          {uploadingImage ? <p className="text-xs text-cyan-200">Uploading image...</p> : null}
          <input value={telegramLink} onChange={(e) => setTelegramLink(e.target.value)} placeholder="Telegram link" className="w-full rounded-lg border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-cyan-300" />
          <input value={twitterLink} onChange={(e) => setTwitterLink(e.target.value)} placeholder="X / Twitter link" className="w-full rounded-lg border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-cyan-300" />
          <input value={websiteLink} onChange={(e) => setWebsiteLink(e.target.value)} placeholder="Website link" className="w-full rounded-lg border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-cyan-300" />
        </div>
      </div>

      <div className="card-surface rounded-xl p-4">
        <h3 className="text-lg font-semibold text-white">Creator tax mode</h3>
        <div className="mt-4 space-y-2">
          {taxOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setMode(option.value)}
              className={`w-full rounded-lg border px-4 py-3 text-left transition ${
                mode === option.value ? "border-cyan-300 bg-cyan-300/10" : "border-white/10"
              }`}
            >
              <p className="text-sm text-white">{option.label}</p>
              <p className="mt-1 text-xs text-mist">{option.note}</p>
            </button>
          ))}
        </div>

        {mode === "custom" ? (
          <div className="mt-4 grid grid-cols-3 gap-3">
            <input value={customRate} onChange={(e) => setCustomRate(e.target.value)} placeholder="Tax %" className="rounded-lg border border-white/10 bg-black/20 px-3 py-3 text-white outline-none focus:border-cyan-300" />
            <input value={customBuyback} onChange={(e) => setCustomBuyback(e.target.value)} placeholder="Buyback %" className="rounded-lg border border-white/10 bg-black/20 px-3 py-3 text-white outline-none focus:border-cyan-300" />
            <input value={customBurn} onChange={(e) => setCustomBurn(e.target.value)} placeholder="Burn %" className="rounded-lg border border-white/10 bg-black/20 px-3 py-3 text-white outline-none focus:border-cyan-300" />
          </div>
        ) : null}
      </div>

      <div className="card-surface rounded-xl p-4">
        <h3 className="text-lg font-semibold text-white">Launch preview</h3>
        <div className="mt-4 space-y-2 text-sm text-mist">
          <p>Creation fee: 1 TON</p>
          <p>Refund rule: refunds only if token graduates</p>
          <p>Base trading fee: 0.75%</p>
          <p>Creator tax: {creatorTaxRate.toFixed(1)}%</p>
          <p>Total fee: {totalFee.toFixed(2)}%</p>
          <p>Platform allocation: 0.5% supply, 50% unlock at graduation, 50% linear over 60 days</p>
          <p>Graduation rule: 30 TON fee deducted from bonding reserve, then migrate with mock-ready STON.fi adapter</p>
          {totalFee > 2 ? <p className="text-amber-300">Warning: total fee exceeds 2%.</p> : null}
        </div>
      </div>

      {error ? <p className="text-sm text-rose-300">{error}</p> : null}

      <button
        type="button"
        onClick={submit}
        disabled={loading || uploadingImage}
        className="w-full rounded-lg bg-cyan-300 px-5 py-4 text-sm font-semibold text-slate-900 transition hover:bg-cyan-200 disabled:bg-slate-500"
      >
        {loading ? "Launching..." : "Launch Token"}
      </button>
    </div>
  );
}
