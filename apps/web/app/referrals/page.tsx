"use client";

import Image from "next/image";
import { TonConnectButton } from "@tonconnect/ui-react";
import { useEffect, useMemo, useState } from "react";

import type { UserSummary } from "@meme-launchpad/shared";

import { CopyButton } from "../../components/copy-button";
import { TokenBackButton } from "../../components/token-back-button";
import { useWallet } from "../../components/wallet-context";
import { getUser } from "../../lib/api";

export default function ReferralsPage() {
  const { wallet } = useWallet();
  const [user, setUser] = useState<UserSummary | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!wallet) {
      setUser(null);
      return;
    }

    void getUser(wallet).then(setUser).catch((caughtError) => {
      setError(caughtError instanceof Error ? caughtError.message : "Не удалось загрузить рефералы");
    });
  }, [wallet]);

  const refUrl = useMemo(() => {
    if (!user) return "";
    const base = process.env.NEXT_PUBLIC_WEBAPP_URL || (typeof window !== "undefined" ? window.location.origin : "");
    return `${base}/?startapp=ref_${user.referralCode}`;
  }, [user]);

  const share = () => {
    if (!refUrl) return;
    const url = `https://t.me/share/url?url=${encodeURIComponent(refUrl)}`;
    window.Telegram?.WebApp?.openTelegramLink?.(url) ?? window.open(url, "_blank");
  };

  return (
    <div className="px-4 pt-4 pb-24">
      <TokenBackButton />
      <h1 className="mb-1 font-syne text-2xl font-bold text-white">Рефералы</h1>
      <p className="mb-6 text-sm text-[#8ba3c1]">Приглашай друзей — получай % от их комиссий</p>

      <Image src="/brand/img_07.jpg" alt="Рефералы" width={200} height={140} className="mx-auto mb-6 rounded-2xl object-contain" />

      {error ? <p className="mb-4 text-sm text-rose-300">{error}</p> : null}

      <div className="glass-card mb-4 space-y-3 p-4">
        <p className="text-xs text-[#8ba3c1]">Твоя реферальная ссылка</p>
        <div className="flex items-center gap-2 rounded-xl bg-[#1a2235] px-3 py-2.5">
          <span className="flex-1 truncate font-mono text-xs text-white">{user ? refUrl : "Подключи кошелёк"}</span>
          {user ? <CopyButton value={refUrl} /> : null}
        </div>
        {user ? (
          <button
            onClick={share}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0088cc] py-3 text-sm font-medium text-white"
          >
            ✈️ Поделиться в Telegram
          </button>
        ) : (
          <TonConnectButton className="!w-full" />
        )}
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Рефералов", value: user ? "0" : "—" },
          { label: "Заработано", value: user ? `💎 ${user.referralEarnedTon.toFixed(2)}` : "—" },
          { label: "Ожидает", value: user ? `💎 ${user.referralClaimableTon.toFixed(2)}` : "—" }
        ].map((stat) => (
          <div key={stat.label} className="glass-card p-3 text-center">
            <div className="font-mono text-base font-bold text-white">{stat.value}</div>
            <div className="mt-0.5 text-xs text-[#8ba3c1]">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
