import {
  BASE_TRADE_FEE_RATE,
  CREATOR_FEE_RATE,
  PLATFORM_FEE_RATE,
  REFERRAL_FEE_RATE
} from "./constants.js";
import type { CreatorTaxConfig, FeeBreakdown } from "./types.js";
import { roundNumber } from "./utils.js";

export const calculateTradeFees = (
  grossTon: number,
  creatorTax: CreatorTaxConfig,
  referralWallet?: string
): FeeBreakdown => {
  const baseFeeTon = grossTon * BASE_TRADE_FEE_RATE;
  const creatorTaxTon = grossTon * creatorTax.rate;
  const platformTon = grossTon * PLATFORM_FEE_RATE + (referralWallet ? 0 : grossTon * REFERRAL_FEE_RATE);
  const creatorTon = grossTon * CREATOR_FEE_RATE;
  const referralTon = referralWallet ? grossTon * REFERRAL_FEE_RATE : 0;
  const buybackTon = creatorTaxTon * creatorTax.buybackSplit;
  const burnTon = creatorTaxTon * creatorTax.burnSplit;
  const totalFeeTon = baseFeeTon + creatorTaxTon;
  const netTon = grossTon - totalFeeTon;

  return {
    grossTon: roundNumber(grossTon, 12),
    netTon: roundNumber(netTon, 12),
    baseFeeTon: roundNumber(baseFeeTon, 12),
    creatorTaxTon: roundNumber(creatorTaxTon, 12),
    totalFeeTon: roundNumber(totalFeeTon, 12),
    totalFeeRate: roundNumber(BASE_TRADE_FEE_RATE + creatorTax.rate, 6),
    platformTon: roundNumber(platformTon, 12),
    creatorTon: roundNumber(creatorTon, 12),
    referralTon: roundNumber(referralTon, 12),
    buybackTon: roundNumber(buybackTon, 12),
    burnTon: roundNumber(burnTon, 12),
    referralWallet
  };
};
