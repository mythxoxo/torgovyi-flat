"use client";

import { useEffect, useState } from "react";

import type { UserSummary } from "../../lib/shared";

import { ReferralPanel } from "../../components/referral-panel";
import { useWallet } from "../../components/wallet-context";
import { claimFunds, resolveReferral, getUser } from "../../lib/api";

export default function ReferralsPage() {
  const { wallet } = useWallet();
  const [user, setUser] = useState<UserSummary | null>(null);
  const [error, setError] = useState("");
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    if (!wallet) {
      return;
    }

    void getUser(wallet).then(setUser).catch((caughtError) => {
      setError(caughtError instanceof Error ? caughtError.message : "Failed to load referral data");
    });
  }, [wallet]);

  const claimReferral = async () => {
    try {
      setClaiming(true);
      setError("");
      const result = await claimFunds({
        wallet,
        type: "referral"
      });
      setUser(result.user);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Referral claim failed");
    } finally {
      setClaiming(false);
    }
  };

  return (
    <div className="space-y-4">
      <section>
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Referrals</p>
        <h2 className="mt-2 text-2xl font-semibold text-white">Own the traffic loop</h2>
      </section>
      {error ? <p className="text-sm text-rose-300">{error}</p> : null}
      {!wallet ? (
        <div className="card-surface rounded-xl p-4 text-sm text-mist">
          Connect a TON testnet wallet to generate your referral code, track referred volume, and claim referral TON.
        </div>
      ) : user ? (
        <>
          <ReferralPanel
            referralCode={user.referralCode}
            shareUrl={`${process.env.NEXT_PUBLIC_WEBAPP_URL || "http://localhost:3000"}/?startapp=ref_${user.referralCode}`}
            earnedTon={user.referralEarnedTon}
            volumeTon={user.referredVolumeTon}
          />
          <div className="card-surface rounded-xl p-4">
            <h3 className="text-lg font-semibold text-white">Claim referral income</h3>
            <p className="mt-3 text-sm text-mist">
              Claimable now: {user.referralClaimableTon.toFixed(3)} TON. Already claimed: {user.referralClaimedTon.toFixed(3)} TON.
            </p>
            <button
              type="button"
              onClick={claimReferral}
              disabled={claiming || user.referralClaimableTon <= 0}
              className="mt-4 rounded-lg border border-cyan-300/30 px-4 py-3 text-sm text-cyan-200 disabled:opacity-50"
            >
              {claiming ? "Claiming..." : "Claim referral TON"}
            </button>
            <div className="mt-4 rounded-lg border border-white/10 p-3 text-sm text-mist">
              Referral earnings and claims are backed by the API. Leaderboard can ship after indexed wallet volume is available.
            </div>
          </div>
        </>
      ) : (
        <div className="card-surface rounded-xl p-4 text-sm text-mist">Loading referral stats...</div>
      )}
    </div>
  );
}
