"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
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
    void getUser(wallet).then(setUser).catch((err: unknown) => setError(err instanceof Error ? err.message : "Не удалось загрузить данные"));
  }, [wallet]);

  const stats = useMemo(() => {
    const tokens = user?.createdTokens ?? [];
    return {
      totalVolume: tokens.reduce((sum, token) => sum + token.state.marketCapTon, 0),
      avgProgress: tokens.length ? Math.round(tokens.reduce((sum, token) => sum + token.state.progress * 100, 0) / tokens.length) : 0
    };
  }, [user]);

  const claim = async (type: "creator" | "refund", tokenId?: string) => {
    try {
      setClaiming(true);
      const result = await claimFunds({ wallet, type, tokenId });
      setUser(result.user);
    } finally {
      setClaiming(false);
    }
  };

  const tokens = user?.createdTokens ?? [];

  if (!wallet || tokens.length === 0) {
    return <div className="flex flex-col items-center justify-center px-4 py-20 text-center"><Image src="/brand/img_06.png" alt="no tokens" width={140} height={140} className="mb-6 opacity-80" /><h2 className="mb-2 font-display text-xl font-bold text-white">Ваших токенов пока нет</h2><p className="mb-6 text-sm text-[#8ba3c1]">Запустите первый мем-токен прямо сейчас</p><Link href="/create" className="btn-primary">🚀 Запустить токен</Link></div>;
  }

  return (
    <div className="space-y-4 pb-24 pt-4">
      <div className="px-4 pb-3">
        <p className="mb-1 text-xs uppercase tracking-wide text-[#8ba3c1]">Портфель</p>
        <h1 className="mb-4 font-display text-2xl font-bold text-white">Мои токены</h1>

        <div className="mb-4 grid grid-cols-3 gap-2">
          <div className="glass-card p-3 text-center"><div className="font-mono font-bold text-white">{tokens.length}</div><div className="text-xs text-[#8ba3c1]">Токенов</div></div>
          <div className="glass-card p-3 text-center"><div className="font-mono font-bold text-[#00c896]">💎 {stats.totalVolume.toFixed(1)}</div><div className="text-xs text-[#8ba3c1]">Объём</div></div>
          <div className="glass-card p-3 text-center"><div className="font-mono font-bold text-white">{stats.avgProgress}%</div><div className="text-xs text-[#8ba3c1]">Ср. прогресс</div></div>
        </div>
      </div>

      {error ? <p className="px-4 text-sm text-[#ff4757]">{error}</p> : null}
      {user?.creatorClaimableTon ? <div className="mx-4 glass-card p-4"><p className="text-sm text-[#8ba3c1]">Доступно создателю: <span className="font-mono text-white">{user.creatorClaimableTon.toFixed(3)} TON</span></p><button type="button" disabled={claiming} onClick={() => void claim("creator")} className="mt-3 rounded-xl border border-[#0088cc]/30 px-4 py-2 text-sm text-[#0088cc]">{claiming ? "Получение..." : "Забрать"}</button></div> : null}

      <div className="space-y-3 px-4">
        {tokens.map((token) => (
          <div key={token.id} className="glass-card flex items-center gap-3 p-4">
            <div className="h-12 w-12 overflow-hidden rounded-xl flex-shrink-0"><Image src={token.image || "/brand/img_04.png"} alt={token.name} width={48} height={48} className="h-full w-full object-cover" /></div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2"><span className="truncate font-bold text-white">{token.name}</span><span className="flex-shrink-0 font-mono text-sm text-[#0088cc]">${token.ticker}</span></div>
              <ProgressBar progress={token.state.progress} className="mt-1.5" />
              <div className="mt-1 flex justify-between text-xs text-[#8ba3c1]"><span>💎 {token.state.marketCapTon.toFixed(2)} TON</span><span>{Math.round(token.state.progress * 100)}% до выхода</span></div>
            </div>
            <Link href={`/token/${token.id}`}><ChevronRight className="text-[#8ba3c1]" /></Link>
          </div>
        ))}
      </div>

      {user?.refunds.filter((r) => r.status === "CLAIMABLE").map((r) => <div key={r.tokenId} className="mx-4 glass-card flex items-center justify-between p-4 text-sm"><span className="text-[#8ba3c1]">Возврат {r.tokenId}</span><button type="button" disabled={claiming} onClick={() => void claim("refund", r.tokenId)} className="rounded-xl border border-[#1e3a5f] px-3 py-2 text-[#00c896]">Забрать {r.claimableTon.toFixed(3)} TON</button></div>)}
    </div>
  );
}
