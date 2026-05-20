"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { UserSummary } from "../../lib/shared";
import { useWallet } from "../../components/wallet-context";
import { WalletConnectButton } from "../../components/wallet-connect-button";
import { getUser } from "../../lib/api";
import { ProgressBar } from "../../components/progress-bar";

export default function MyTokensPage() {
  const { wallet } = useWallet();
  const [user, setUser] = useState<UserSummary | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!wallet) return;
    void getUser(wallet).then(setUser).catch((err: unknown) => setError(err instanceof Error ? err.message : "Не удалось загрузить данные"));
  }, [wallet]);

  const stats = useMemo(() => {
    const tokens = user?.createdTokens ?? [];
    return {
      totalVolume: tokens.reduce((sum, token) => sum + (token.state.collectedTon ?? token.state.marketCapTon), 0),
      avgProgress: tokens.length ? Math.round(tokens.reduce((sum, token) => sum + token.state.progress * 100, 0) / tokens.length) : 0
    };
  }, [user]);

  const tokens = user?.createdTokens ?? [];

  if (!wallet) {
    return <div className="glass-card rounded-[28px] p-8 text-center"><h2 className="font-display text-2xl font-bold text-white">Connect your wallet to see your launched tokens.</h2><p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#c6d4ea]">Wallet connection is required to load your created launches and future manual mainnet history.</p><div className="mt-6 flex justify-center"><WalletConnectButton /></div></div>;
  }

  if (tokens.length === 0) {
    return <div className="glass-card rounded-[28px] p-8 text-center"><h2 className="font-display text-2xl font-bold text-white">No launched tokens yet.</h2><p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#c6d4ea]">Create your first test token when manual mainnet flow is ready. Live token history appears after wallet-signed transactions and indexer sync.</p><div className="mt-6 flex justify-center"><Link href="/create" className="btn-primary">Create token</Link></div></div>;
  }

  return (
    <div className="space-y-5 pb-24">
      <section>
        <p className="text-xs uppercase tracking-[0.2em] text-[#7dd3fc]">Portfolio</p>
        <h1 className="mt-2 font-display text-3xl font-bold text-white">My tokens</h1>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="glass-card p-4 text-center"><div className="font-mono text-2xl font-bold text-white">{tokens.length}</div><div className="mt-1 text-xs text-[#8ba3c1]">Tokens</div></div>
          <div className="glass-card p-4 text-center"><div className="font-mono text-2xl font-bold text-[#a5fbce]">💎 {stats.totalVolume.toFixed(1)}</div><div className="mt-1 text-xs text-[#8ba3c1]">Collected TON</div></div>
          <div className="glass-card p-4 text-center"><div className="font-mono text-2xl font-bold text-white">{stats.avgProgress}%</div><div className="mt-1 text-xs text-[#8ba3c1]">Average progress</div></div>
        </div>
      </section>

      {error ? <div className="rounded-2xl border border-[#7dd3fc]/20 bg-[#7dd3fc]/10 px-4 py-3 text-sm text-[#c6e8ff]">Indexer cache is not connected yet. On-chain flow remains available.</div> : null}

      <div className="space-y-3">
        {tokens.map((token) => (
          <div key={token.id} className="glass-card flex items-center gap-3 p-4">
            <div className="h-12 w-12 overflow-hidden rounded-xl flex-shrink-0"><Image src={token.image || "/brand/img_04.jpg"} alt={token.name} width={48} height={48} className="h-full w-full object-cover" /></div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2"><span className="truncate font-bold text-white">{token.name}</span><span className="flex-shrink-0 font-mono text-sm text-[#8fdcff]">{token.ticker}</span></div>
              <ProgressBar progress={token.state.progress} className="mt-1.5" />
              <div className="mt-1 flex justify-between text-xs text-[#8ba3c1]"><span>💎 {(token.state.collectedTon ?? token.state.marketCapTon).toFixed(2)} TON</span><span>{Math.round(token.state.progress * 100)}% to graduation</span></div>
            </div>
            <Link href={`/token/${token.id}`}><ChevronRight className="text-[#8ba3c1]" /></Link>
          </div>
        ))}
      </div>
    </div>
  );
}
