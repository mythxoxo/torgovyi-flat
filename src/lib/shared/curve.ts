import {
  ANTI_SNIPE_MAX_BUY_TON,
  ANTI_SNIPE_WINDOW_SECONDS,
  BONDING_SALE_SUPPLY,
  CREATION_FEE_TON,
  CREATOR_REFUND_TON,
  CURVE_INITIAL_PRICE_TON,
  CURVE_PRICE_SLOPE_TON,
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

const reserveForSoldSupply = (soldSupply: number): number =>
  CURVE_INITIAL_PRICE_TON * soldSupply + 0.5 * CURVE_PRICE_SLOPE_TON * soldSupply * soldSupply;

export const reserveDeltaForSoldSupply = (fromSoldSupply: number, toSoldSupply: number): number =>
  reserveForSoldSupply(toSoldSupply) - reserveForSoldSupply(fromSoldSupply);

export const spotPriceForSupply = (soldSupply: number): number =>
  CURVE_INITIAL_PRICE_TON + CURVE_PRICE_SLOPE_TON * soldSupply;

export const createInitialBondingState = (createdAt = new Date()): BondingState => ({
  soldSupply: 0,
  reserveTon: 0,
  currentPriceTon: CURVE_INITIAL_PRICE_TON,
  progress: 0,
  marketCapTon: CURVE_INITIAL_PRICE_TON * TOTAL_SUPPLY,
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
    progress: roundNumber(soldSupply / BONDING_SALE_SUPPLY, 9),
    marketCapTon: roundNumber(currentPriceTon * TOTAL_SUPPLY, 6),
    volumeTon: roundNumber(state.volumeTon + volumeDeltaTon, 9),
    expectedPoolRatioTon: roundNumber(expectedPoolRatioTon, 15),
    remainingBondingSupply: roundNumber(BONDING_SALE_SUPPLY - soldSupply, 9),
    circulatingSupply: roundNumber(soldSupply, 9),
    canGraduate:
      soldSupply >= BONDING_SALE_SUPPLY ||
      reserveTon >= GRADUATION_RESERVE_TARGET_TON
  };
};

const solveTokensFromNetTon = (currentSoldSupply: number, netTon: number): number => {
  assert(netTon > 0, "Trade amount must be positive");
  const a = 0.5 * CURVE_PRICE_SLOPE_TON;
  const b = spotPriceForSupply(currentSoldSupply);

  if (a === 0) {
    return netTon / b;
  }

  const discriminant = b * b + 4 * a * netTon;
  return (-b + Math.sqrt(discriminant)) / (2 * a);
};

export const quoteBuy = (
  state: BondingState,
  grossTon: number,
  creatorTax: CreatorTaxConfig,
  referralWallet?: string,
  now: Date = new Date()
): BuyQuote => {
  assert(grossTon > 0, "Buy amount too small");
  assert(
    now.toISOString() <= state.antiSnipeEndsAt ? grossTon <= ANTI_SNIPE_MAX_BUY_TON : true,
    "Max buy during anti-snipe window exceeded"
  );

  const feeBreakdown = calculateTradeFees(grossTon, creatorTax, referralWallet);
  const tokenAmount = solveTokensFromNetTon(state.soldSupply, feeBreakdown.netTon);
  const remainingBondingSupply = BONDING_SALE_SUPPLY - state.soldSupply;
  assert(tokenAmount > 0, "Buy amount too small");
  assert(tokenAmount <= remainingBondingSupply + 10, "Buy amount too large");

  const appliedTokenAmount = Math.min(tokenAmount, remainingBondingSupply);
  const actualReserveTon = reserveDeltaForSoldSupply(
    state.soldSupply,
    state.soldSupply + appliedTokenAmount
  );
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

  const nextSoldSupply = state.soldSupply - tokenAmount;
  const tonAmountGross = reserveForSoldSupply(state.soldSupply) - reserveForSoldSupply(nextSoldSupply);
  assert(tonAmountGross <= state.reserveTon + 1e-9, "Negative reserve prevented");

  const feeBreakdown = calculateTradeFees(tonAmountGross, creatorTax, referralWallet);
  return {
    tonAmountGross: roundNumber(tonAmountGross, 12),
    tonAmountNet: feeBreakdown.netTon,
    feeBreakdown,
    newState: refreshBondingState(state, tonAmountGross, nextSoldSupply, state.reserveTon - tonAmountGross)
  };
};

export const canTradeOnBondingCurve = (status: TokenStatus): boolean => status === "BONDING";

export const grossTonForBuyingTokens = (
  state: BondingState,
  tokenAmount: number,
  creatorTax: CreatorTaxConfig
): number => {
  const netTon = reserveDeltaForSoldSupply(state.soldSupply, state.soldSupply + tokenAmount);
  return roundNumber(netTon / (1 - (0.0075 + creatorTax.rate)), 12);
};

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
