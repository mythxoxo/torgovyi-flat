"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import type { TokenRecord, UserSummary } from "@meme-launchpad/shared";

import { TokenBackButton } from "../../components/token-back-button";
import { useWallet } from "../../components/wallet-context";
import { getUser } from "../../lib/api";

function MiniProgressBar({ value }: { value: number }) {
  return (
    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[#1e3a5f]">
      <div className="h-full rounded-full bg-gradient-to-r from-[#0088cc] to-[#00c896]" style={{ width: `${value}%` }} />
    </div>
  );
}

function TokenRow({ token }: { token: TokenRecord }) {
  const progress = Math.min(Math.round(token.state.progress * 100), 100);

  return (
    <div className="glass-card mx-4 flex items-center gap-3 p-4">
      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl">
        <Image
          src={token.image || "/brand/img_04.jpg"}
          width={48}
          height={48}
          className="h-full w-full object-cover"
          alt={token.name}
          unoptimized
        />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate font-bold text-white">{token.name}</span>
          <span className="shrink-0 font-mono text-sm text-[#0088cc]">${token.ticker}</span>
        </div>
        <MiniProgressBar value={progress} />
        <div className="mt-1 flex justify-between gap-2 text-xs text-[#8ba3c1]">
          <span>💎 {token.state.marketCapTon.toFixed(2)} TON</span>
          <span>{progress}% до выхода</span>
        </div>
      </div>
      <Link href={`/token/${token.id}`} className="text-2xl text-[#8ba3c1]">
        ›
      </Link>
    </div>
  );
}

export default function MyTokensPage() {
  const { wallet } = useWallet();
  const [user, setUser] = useState<UserSummary | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!wallet) {
      setUser(null);
      return;
    }

    void getUser(wallet).then(setUser).catch((caughtError) => {
      setError(caughtError instanceof Error ? caughtError.message : "Не удалось загрузить токены");
    });
  }, [wallet]);

  const tokens = user?.createdTokens ?? [];
  const stats = useMemo(() => {
    const totalVolume = tokens.reduce((sum, token) => sum + token.state.volumeTon, 0);
    const avgProgress = tokens.length
      ? Math.round(tokens.reduce((sum, token) => sum + token.state.progress * 100, 0) / tokens.length)
      : 0;
    return { totalVolume, avgProgress };
  }, [tokens]);

  return (
    <div className="space-y-4 pb-24">
      <TokenBackButton />
      <section className="px-4 pt-4">
        <h1 className="font-syne text-2xl font-bold text-white">Портфель</h1>
        <p className="mt-1 text-sm text-[#8ba3c1]">Твои запущенные токены</p>
      </section>

      {error ? <p className="px-4 text-sm text-rose-300">{error}</p> : null}

      {tokens.length > 0 ? (
        <>
          <div className="grid grid-cols-3 gap-2 px-4">
            <div className="glass-card p-3 text-center">
              <div className="font-mono font-bold text-white">{tokens.length}</div>
              <div className="text-xs text-[#8ba3c1]">Токенов</div>
            </div>
            <div className="glass-card p-3 text-center">
              <div className="font-mono font-bold text-[#00c896]">💎 {stats.totalVolume.toFixed(1)}</div>
              <div className="text-xs text-[#8ba3c1]">Объём</div>
            </div>
            <div className="glass-card p-3 text-center">
              <div className="font-mono font-bold text-white">{stats.avgProgress}%</div>
              <div className="text-xs text-[#8ba3c1]">Ср. прогресс</div>
            </div>
          </div>

          <div className="space-y-3">
            {tokens.map((token) => (
              <TokenRow key={token.id} token={token} />
            ))}
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center px-4 py-20 text-center">
          <Image src="/brand/img_06.jpg" alt="Нет токенов" width={160} height={160} className="mb-6 rounded-2xl object-cover opacity-90" />
          <h2 className="mb-2 font-syne text-xl font-bold text-white">Ваших токенов пока нет</h2>
          <p className="mb-6 text-sm text-[#8ba3c1]">{wallet ? "Запустите первый прямо сейчас" : "Подключи кошелёк, чтобы увидеть портфель"}</p>
          <Link href="/create">
            <button className="rounded-xl bg-gradient-to-r from-[#0088cc] to-[#00c896] px-6 py-3 font-bold text-black">
              🚀 Запустить токен
            </button>
          </Link>
        </div>
      )}
    </div>
  );
}
