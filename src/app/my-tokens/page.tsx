"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import type { UserSummary } from "../../lib/shared";
import { useWallet } from "../../components/wallet-context";
import { claimFunds, getUser } from "../../lib/api";
import { ProgressBar } from "../../components/progress-bar";

export default function MyTokensPage() {
  const { wallet } = useWallet();
  const [user, setUser] = useState<UserSummary | null>(null);
  const [error, setError] = useState("");
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    if (!wallet) return;
    void getUser(wallet).then(setUser).catch((err: unknown) => setError(err instanceof Error ? err.message : "Failed to load data"));
  }, [wallet]);

  const claim = async (type: "creator" | "refund", tokenId?: string) => {
    try {
      setClaiming(true);
      const result = await claimFunds({ wallet, type, tokenId });
      setUser(result.user);
    } finally {
      setClaiming(false);
    }
  };

  if (!wallet || (user && user.createdTokens.length === 0)) {
    return <div className="flex flex-col items-center justify-center px-4 py-20 text-center"><Image src="/brand/img_06.jpg" alt="no tokens" width={140} height={140} className="mb-6 opacity-80" /><h2 className="mb-2 font-display text-xl font-bold text-white">Ваших токенов пока нет</h2><p className="mb-6 text-sm text-[#8ba3c1]">Запустите первый мем-токен прямо сейчас</p><Link href="/create" className="rounded-xl bg-gradient-to-r from-[#0088cc] to-[#00c896] px-6 py-3 font-bold text-black">🚀 Launch first token</Link></div>;
  }

  return (
    <div className="space-y-4 px-4 pb-24 pt-4">
      <section>
        <p className="text-xs uppercase tracking-[0.2em] text-[#8ba3c1]">Portfolio</p>
        <h2 className="mt-2 font-display text-3xl font-bold text-white">My Tokens</h2>
      </section>
      {error ? <p className="text-sm text-[#ff4757]">{error}</p> : null}
      {user?.creatorClaimableTon ? <div className="glass-card p-4"><p className="text-sm text-[#8ba3c1]">Creator fee claimable: <span className="font-mono text-white">{user.creatorClaimableTon.toFixed(3)} TON</span></p><button type="button" disabled={claiming} onClick={() => void claim("creator")} className="mt-3 rounded-xl border border-[#0088cc]/30 px-4 py-2 text-sm text-[#0088cc]">{claiming ? "Claiming..." : "Claim creator fees"}</button></div> : null}
      <div className="space-y-3">
        {user?.createdTokens.map((token) => (
          <div key={token.id} className="glass-card flex items-center gap-3 p-4 transition-colors hover:border-[#0088cc]/40">
            <Image src={token.image || "/brand/img_04.jpg"} alt={token.name} width={48} height={48} className="rounded-xl object-cover" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2"><span className="truncate font-bold text-white">{token.name}</span><span className="font-mono text-sm text-[#0088cc]">${token.ticker}</span></div>
              <ProgressBar progress={token.state.progress} className="mt-1.5" />
              <div className="mt-1 flex justify-between text-xs text-[#8ba3c1]"><span>💎 {token.state.marketCapTon.toFixed(1)} TON</span><span>{Math.round(token.state.progress * 100)}% to grad</span></div>
            </div>
            <Link href={`/token/${token.id}`}><ChevronRight className="text-[#8ba3c1]" /></Link>
          </div>
        ))}
      </div>
      {user?.refunds.filter((r) => r.status === "CLAIMABLE").map((r) => <div key={r.tokenId} className="glass-card flex items-center justify-between p-4 text-sm"><span className="text-[#8ba3c1]">Refund {r.tokenId}</span><button type="button" disabled={claiming} onClick={() => void claim("refund", r.tokenId)} className="rounded-xl border border-[#1e3a5f] px-3 py-2 text-[#00c896]">Claim {r.claimableTon.toFixed(3)} TON</button></div>)}
    </div>
  );
}
