"use client";

import { useEffect, useState } from "react";
import type { UserSummary } from "../../lib/shared";
import { ReferralPanel } from "../../components/referral-panel";
import { useWallet } from "../../components/wallet-context";
import { claimFunds, getUser } from "../../lib/api";

export default function ReferralsPage() {
  const { wallet } = useWallet();
  const [user, setUser] = useState<UserSummary | null>(null);
  const [error, setError] = useState("");
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    if (!wallet) return;
    void getUser(wallet).then(setUser).catch((caughtError) => setError(caughtError instanceof Error ? caughtError.message : "Не удалось загрузить рефералы"));
  }, [wallet]);

  const claimReferral = async () => {
    try {
      setClaiming(true);
      const result = await claimFunds({ wallet, type: "referral" });
      setUser(result.user);
    } finally {
      setClaiming(false);
    }
  };

  return (
    <div className="space-y-4 pb-24">
      {error ? <p className="px-4 pt-4 text-sm text-[#ff4757]">{error}</p> : null}
      <ReferralPanel referralCode={user?.referralCode ?? ""} shareUrl="" earnedTon={user?.referralEarnedTon ?? 0} volumeTon={user?.referredVolumeTon ?? 0} pendingTon={user?.referralClaimableTon ?? 0} connected={Boolean(wallet)} />
      {wallet && user ? <div className="mx-4 glass-card p-4"><p className="text-sm text-[#8ba3c1]">К получению: {user.referralClaimableTon.toFixed(3)} TON. Уже получено: {user.referralClaimedTon.toFixed(3)} TON.</p><button type="button" onClick={claimReferral} disabled={claiming || user.referralClaimableTon <= 0} className="mt-4 rounded-xl border border-[#0088cc]/30 px-4 py-3 text-sm text-[#0088cc] disabled:opacity-50">{claiming ? "Получение..." : "Забрать TON"}</button></div> : null}
    </div>
  );
}
