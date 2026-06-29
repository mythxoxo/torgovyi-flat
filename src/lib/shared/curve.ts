import {
  ANTI_SNIPE_MAX_BUY_TON,
  ANTI_SNIPE_WINDOW_SECONDS,
  BONDING_SALE_SUPPLY,
  CREATION_FEE_TON,
  CREATOR_REFUND_TON,
  GRADUATION_FEE_TON,
  GRADUATION_RESERVE_TARGET_TON,
  LIQUIDITY_SUPPLY,
  TOTAL_SUPPLY
} from "./constants";
import { calculateTradeFees } from "./fees";
import type {
  BondingState,
  BuyQuote,
  CreatorTaxConfig,
  SellQuote,
  TokenStatus
} from "./types";
import { assert, roundNumber } from "./utils";

export const ONCHAIN_TOKENS_PER_TON = 1_000_000;
export const ONCHAIN_MINT_GAS_TON = 0.02;
export const ONCHAIN_SELL_FEE_RATE = 0.0075;

const reserveForSoldSupply = (soldSupply: number): number => soldSupply / ONCHAIN_TOKENS_PER_TON;

export const reserveDeltaForSoldSupply = (fromSoldSupply: number, toSoldSupply: number): number =>
  Math.max(0, (toSoldSupply - fromSoldSupply) / ONCHAIN_TOKENS_PER_TON);

export const spotPriceForSupply = (_soldSupply: number): number => 1 / ONCHAIN_TOKENS_PER_TON;

export const createInitialBondingState = (createdAt = new Date()): BondingState => ({
  soldSupply: 0,
  reserveTon: 0,
  currentPriceTon: spotPriceForSupply(0),
  progress: 0,
  marketCapTon: TOTAL_SUPPLY / ONCHAIN_TOKENS_PER_TON,
  volumeTon: 0,
  graduationTargetTon: GRADUATION_RESERVE_TARGET_TON,
  expectedPoolRatioTon: 0,
  remainingBondingSupply: BONDING_SALE_SUPPLY,
  circulatingSupply: 0,
  antiSnipeEndsAt: new Date(createdAt.getTime() + ANTI_SNIPE_WINDOW_SECONDS * 1000).toISOString(),
  canGraduate: false
});

export const refreshBondingState = (
  state: BondingState,
  volumeDeltaTon = 0,
  soldSupply = state.soldSupply,
  reserveTon = state.reserveTon
): BondingState => {
  const currentPriceTon = spotPriceForSupply(soldSupply);
  const expectedPoolRatioTon =
    reserveTon > GRADUATION_FEE_TON + CREATOR_REFUND_TON
      ? (reserveTon - GRADUATION_FEE_TON - CREATOR_REFUND_TON) / LIQUIDITY_SUPPLY
      : 0;

  return {
    ...state,
    soldSupply: roundNumber(soldSupply, 9),
    reserveTon: roundNumber(reserveTon, 12),
    currentPriceTon: roundNumber(currentPriceTon, 15),
    progress: roundNumber(reserveTon / Math.max(1, state.graduationTargetTon || GRADUATION_RESERVE_TARGET_TON), 9),
    marketCapTon: roundNumber(currentPriceTon * TOTAL_SUPPLY, 6),
    volumeTon: roundNumber(state.volumeTon + volumeDeltaTon, 9),
    expectedPoolRatioTon: roundNumber(expectedPoolRatioTon, 15),
    remainingBondingSupply: roundNumber(Math.max(0, BONDING_SALE_SUPPLY - soldSupply), 9),
    circulatingSupply: roundNumber(soldSupply, 9),
    canGraduate: reserveTon >= (state.graduationTargetTon || GRADUATION_RESERVE_TARGET_TON)
  };
};

const tokensFromGrossTon = (grossTon: number): number => Math.max(0, grossTon - ONCHAIN_MINT_GAS_TON) * ONCHAIN_TOKENS_PER_TON;

export const quoteBuy = (
  state: BondingState,
  grossTon: number,
  creatorTax: CreatorTaxConfig,
  referralWallet?: string,
  now: Date = new Date()
): BuyQuote => {
  assert(grossTon > ONCHAIN_MINT_GAS_TON, "Buy amount too small");
  assert(
    now.toISOString() <= state.antiSnipeEndsAt ? grossTon <= ANTI_SNIPE_MAX_BUY_TON : true,
    "Max buy during anti-snipe window exceeded"
  );

  const feeBreakdown = calculateTradeFees(grossTon, creatorTax, referralWallet);
  const tokenAmount = tokensFromGrossTon(grossTon);
  const remainingBondingSupply = BONDING_SALE_SUPPLY - state.soldSupply;
  assert(tokenAmount > 0, "Buy amount too small");
  assert(tokenAmount <= remainingBondingSupply + 10, "Buy amount too large");

  const appliedTokenAmount = Math.min(tokenAmount, remainingBondingSupply);
  const actualReserveTon = reserveDeltaForSoldSupply(state.soldSupply, state.soldSupply + appliedTokenAmount);
  const newSoldSupply = state.soldSupply + appliedTokenAmount;
  const newReserveTon = state.reserveTon + actualReserveTon;

  return {
    tokenAmount: roundNumber(appliedTokenAmount, 9),
    feeBreakdown,
    newState: refreshBondingState(state, grossTon, newSoldSupply, newReserveTon)
  };
};

export const quoteSell = (
  state: BondingState,
  tokenAmount: number,
  creatorTax: CreatorTaxConfig,
  referralWallet?: string
): SellQuote => {
  assert(tokenAmount > 0, "Sell amount too small");
  assert(tokenAmount <= state.soldSupply, "Cannot sell more than circulating bonding supply");

  const tonAmountGross = tokenAmount / ONCHAIN_TOKENS_PER_TON;
  assert(tonAmountGross <= state.reserveTon + 1e-9, "Negative reserve prevented");

  const feeBreakdown = calculateTradeFees(tonAmountGross, creatorTax, referralWallet);
  const netTon = tonAmountGross * (1 - ONCHAIN_SELL_FEE_RATE);
  return {
    tonAmountGross: roundNumber(tonAmountGross, 12),
    tonAmountNet: roundNumber(netTon, 12),
    feeBreakdown,
    newState: refreshBondingState(state, tonAmountGross, state.soldSupply - tokenAmount, state.reserveTon - tonAmountGross)
  };
};

export const canTradeOnBondingCurve = (status: TokenStatus): boolean => status === "BONDING";

export const grossTonForBuyingTokens = (
  _state: BondingState,
  tokenAmount: number,
  _creatorTax: CreatorTaxConfig
): number => roundNumber(tokenAmount / ONCHAIN_TOKENS_PER_TON + ONCHAIN_MINT_GAS_TON, 12);

export const graduationPreview = (state: BondingState) => {
  const reserveAfterFees = Math.max(0, state.reserveTon - GRADUATION_FEE_TON - CREATOR_REFUND_TON);
  return {
    reserveBeforeTon: roundNumber(state.reserveTon, 9),
    reserveAfterTon: roundNumber(reserveAfterFees, 9),
    creatorRefundTon: CREATOR_REFUND_TON,
    creationFeeTon: CREATION_FEE_TON,
    graduationFeeTon: GRADUATION_FEE_TON,
    liquidityTokens: LIQUIDITY_SUPPLY,
    poolRatioTon: roundNumber(reserveAfterFees / LIQUIDITY_SUPPLY, 12)
  };
};
