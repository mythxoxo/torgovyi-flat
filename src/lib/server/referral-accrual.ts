import type { TradeRow } from "../shared";
import { findReferralBindingByWallet, getReferralAccounting, upsertReferralAccounting } from "./referral-store";

const rewardBps = () => Number(process.env.REFERRAL_REWARD_BPS || "100");
const toTon = (value: string | number | undefined) => Number(value || 0) / 1_000_000_000;

export async function accrueReferralRewardFromTrade(params: {
  buyerWallet: string;
  tradeId: string;
  baseAmountTon: number;
  txHash?: string;
}) {
  const binding = await findReferralBindingByWallet(params.buyerWallet);
  if (!binding) {
    return { ok: true, accrued: false, reason: "no_referrer" as const };
  }
  if (binding.referredByWallet === params.buyerWallet || binding.wallet === binding.referredByWallet) {
    return { ok: true, accrued: false, reason: "self_referral" as const };
  }

  const rewardAmountTon = Number(((params.baseAmountTon * rewardBps()) / 10000).toFixed(9));
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
    txHash: params.txHash,
    baseAmountTon: params.baseAmountTon,
    rewardAmountTon,
    status: "claimable" as const
  };
}

export async function accrueReferralRewardsFromTrades(trades: TradeRow[]) {
  const results = [];
  for (const trade of trades) {
    const kind = (trade as TradeRow & { kind?: string }).kind || "buy";
    if (kind !== "buy") continue;
    results.push(await accrueReferralRewardFromTrade({
      buyerWallet: trade.buyer,
      tradeId: trade.tx_hash || `${trade.pool_address}:${trade.lt || trade.created_at}`,
      txHash: trade.tx_hash,
      baseAmountTon: toTon(trade.ton_amount)
    }));
  }
  return results;
}
