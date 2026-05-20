"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { TokenRecord } from "../lib/shared";
import { TokenList } from "../components/token-list";
import { getTokenList } from "../lib/api";
import { getLaunchpadTargetTon } from "../lib/launch-config";

const steps = [
  {
    title: "Create token",
    text: "Upload an icon, set name and ticker, and prepare wallet-signed launch transactions."
  },
  {
    title: "Bonding to target",
    text: "Start in 5 TON test mode now. Return to 8888 TON production target after live proof."
  },
  {
    title: "Graduate to DeDust",
    text: "Move toward DeDust only after manual verification, live deploy proof and indexer sync."
  }
];

export default function HomePage() {
  const targetTon = getLaunchpadTargetTon();
  const [tokens, setTokens] = useState<TokenRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    getTokenList("trending")
      .then(setTokens)
      .catch(() => setError("Indexer is not connected yet. Live token history will appear after the mainnet dust test and database setup."))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tokens.filter((token) => !q || token.name.toLowerCase().includes(q) || token.ticker.toLowerCase().includes(q));
  }, [tokens, query]);

  return (
    <div className="space-y-8 pb-20">
      <section className="rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(16,26,43,0.96),rgba(8,14,25,0.98))] p-6 shadow-[0_30px_90px_rgba(0,0,0,0.28)] sm:p-8">
        <div className="max-w-3xl">
          <div className="inline-flex items-center rounded-full border border-[#7dd3fc]/25 bg-[#7dd3fc]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#7dd3fc]">Technical MVP</div>
          <h1 className="mt-4 max-w-2xl font-display text-4xl font-black leading-[0.95] text-white sm:text-5xl">Launch TON meme tokens.<br />Graduate to DeDust.</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-[#d3dfef]">A no-custody TON launchpad for meme tokens with verified sandbox buy/mint flow, manual TonConnect signing, and a clean path from test mode to mainnet.</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link href="/create" className="btn-primary text-center">Create token</Link>
            <Link href="/technical-status" className="btn-secondary text-center text-white">View technical status</Link>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2 text-sm">
          <span className="rounded-full border border-[#3df6a2]/20 bg-[#3df6a2]/10 px-3 py-2 text-[#a5fbce]">Sandbox verified</span>
          <span className="rounded-full border border-[#7dd3fc]/25 bg-[#7dd3fc]/10 px-3 py-2 text-[#7dd3fc]">Manual TonConnect ready</span>
          <span className="rounded-full border border-[#7dd3fc]/25 bg-[#7dd3fc]/10 px-3 py-2 text-[#7dd3fc]">Test target: {targetTon} TON</span>
          <span className="rounded-full border border-[#ffcc80]/20 bg-[#ffcc80]/10 px-3 py-2 text-[#ffd89b]">Mainnet proof pending</span>
        </div>

        <div className="mt-4 rounded-2xl border border-white/8 bg-white/5 px-4 py-3 text-sm text-[#c8d5e7]">Production target: 8888 TON</div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="glass-card rounded-[28px] p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-[#7dd3fc]">Current readiness</p>
          <h2 className="mt-2 font-display text-2xl font-bold text-white">Ready for public preview and manual dust-test prep</h2>
          <p className="mt-3 text-sm leading-6 text-[#c6d4ea]">Core checks are green, TonConnect manual flow is ready, and the production UI is live. Mainnet proof, buyer proof and indexer DB proof are still pending.</p>
        </div>
        <div className="glass-card rounded-[28px] p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-[#7dd3fc]">Pending live proof</p>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-[#c6d4ea]">
            <li>• Factory deploy on mainnet</li>
            <li>• First live buy and buyer Jetton receipt</li>
            <li>• Indexer DB row after live sync</li>
            <li>• DeDust listing and LP lock evidence</li>
          </ul>
        </div>
      </section>

      <section>
        <div className="mb-4">
          <p className="text-xs uppercase tracking-[0.2em] text-[#7dd3fc]">How it works</p>
          <h2 className="mt-2 font-display text-2xl font-bold text-white">Three steps to a clean TON launch flow</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {steps.map((step, index) => (
            <div key={step.title} className="glass-card rounded-[24px] p-5">
              <div className="mb-4 inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#7dd3fc]/20 bg-[#7dd3fc]/10 text-sm font-semibold text-[#7dd3fc]">0{index + 1}</div>
              <h3 className="font-display text-xl font-bold text-white">{step.title}</h3>
              <p className="mt-2 text-sm leading-6 text-[#c6d4ea]">{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="glass-card rounded-[28px] p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[#7dd3fc]">Token market</p>
            <h2 className="mt-2 font-display text-2xl font-bold text-white">No live tokens yet</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#c6d4ea]">Mainnet launch proof is pending. The first tokens will appear here after manual Factory deploy, token-flow deploy, and indexer sync.</p>
          </div>
          <div className="flex gap-3">
            <Link href="/create" className="btn-primary text-center">Create test token</Link>
            <Link href="/technical-status" className="btn-secondary text-center text-white">View status</Link>
          </div>
        </div>

        <div className="mt-5 overflow-hidden rounded-[22px] border border-white/10 bg-white/5">
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name or ticker..." className="w-full bg-transparent px-4 py-4 text-sm text-white outline-none placeholder:text-[#8ba3c1]" />
        </div>
        {error ? <div className="mt-4 rounded-2xl border border-[#7dd3fc]/20 bg-[#7dd3fc]/10 px-4 py-3 text-sm text-[#c6e8ff]">{error}</div> : null}
        <div className="mt-4"><TokenList tokens={filtered} loading={loading} searchQuery={query} /></div>
      </section>
    </div>
  );
}
