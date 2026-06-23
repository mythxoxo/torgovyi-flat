import { findReferralBindingByWallet, getReferralAccounting, upsertReferralAccounting } from "./referral-store";

const REWARD_RATE = 0.01;

export async function accrueReferralRewardFromTrade(params: {
  buyerWallet: string;
  tradeId: string;
  baseAmountTon: number;
}) {
  const binding = await findReferralBindingByWallet(params.buyerWallet);
  if (!binding) {
    return { ok: true, accrued: false, reason: "no_referrer" as const };
  }

  const rewardAmountTon = Number((params.baseAmountTon * REWARD_RATE).toFixed(9));
  if (!(rewardAmountTon > 0)) {
    return { ok: true, accrued: false, reason: "zero_reward" as const };
  }

  const current = await getReferralAccounting(binding.referredByWallet);
  if (current?.rewardedTradeIds?.includes(params.tradeId)) {
    return { ok: true, accrued: false, reason: "duplicate_trade" as const };
  }
  const nextEarned = Number(((current?.earnedTon ?? 0) + rewardAmountTon).toFixed(9));
  const nextClaimable = Number(((current?.claimableTon ?? 0) + rewardAmountTon).toFixed(9));

  await upsertReferralAccounting({
    wallet: binding.referredByWallet,
    earnedTon: nextEarned,
    claimableTon: nextClaimable,
    claimedTon: current?.claimedTon ?? 0,
    status: nextClaimable > 0 ? "claimable" : "pending",
    updatedAt: new Date().toISOString(),
    rewardedTradeIds: [...(current?.rewardedTradeIds ?? []), params.tradeId]
  });

  return {
    ok: true,
    accrued: true,
    referredWallet: params.buyerWallet,
    referrerWallet: binding.referredByWallet,
    tradeId: params.tradeId,
    baseAmountTon: params.baseAmountTon,
    rewardAmountTon,
    status: "claimable" as const
  };
}
