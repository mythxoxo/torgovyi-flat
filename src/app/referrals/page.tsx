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
    void getUser(wallet).then(setUser).catch((caughtError) => setError(caughtError instanceof Error ? caughtError.message : "Failed to load referral data"));
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
    <div className="space-y-4 pb-24 pt-4">
      <section className="px-4">
        <p className="text-xs uppercase tracking-[0.2em] text-[#8ba3c1]">Referrals</p>
        <h2 className="mt-2 font-display text-3xl font-bold text-white">Own the traffic loop</h2>
      </section>
      {error ? <p className="px-4 text-sm text-[#ff4757]">{error}</p> : null}
      {!wallet ? <div className="mx-4 glass-card p-4 text-sm text-[#8ba3c1]">Connect a TON testnet wallet to generate your referral code and claim referral TON.</div> : user ? <>
        <ReferralPanel referralCode={user.referralCode} shareUrl={`${process.env.NEXT_PUBLIC_WEBAPP_URL || "http://localhost:3000"}/?startapp=ref_${user.referralCode}`} earnedTon={user.referralEarnedTon} volumeTon={user.referredVolumeTon} />
        <div className="mx-4 glass-card p-4"><h3 className="text-lg font-semibold text-white">Claim referral income</h3><p className="mt-3 text-sm text-[#8ba3c1]">Claimable now: {user.referralClaimableTon.toFixed(3)} TON. Already claimed: {user.referralClaimedTon.toFixed(3)} TON.</p><button type="button" onClick={claimReferral} disabled={claiming || user.referralClaimableTon <= 0} className="mt-4 rounded-xl border border-[#0088cc]/30 px-4 py-3 text-sm text-[#0088cc] disabled:opacity-50">{claiming ? "Claiming..." : "Claim referral TON"}</button></div>
      </> : <div className="mx-4 glass-card p-4 text-sm text-[#8ba3c1]">Loading referral stats...</div>}
    </div>
  );
}
