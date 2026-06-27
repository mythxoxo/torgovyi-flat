import { Address } from "@ton/core";
import { calculatePlatformFeeUnits, getDexPlatformFeeBps, subtractFeeUnits } from "../external/fees";
import type { DexQuote, DexQuoteRequest } from "../external/types";
import { resolveDedustBuyRoute, resolveDedustSellRoute } from "./route";

const failed = (input: DexQuoteRequest, status: DexQuote["status"], reason: string): DexQuote => ({
  dex: "dedust",
  side: input.side,
  tokenAddress: input.tokenAddress,
  offerAmount: input.amount,
  expectedReceive: "0",
  minReceive: "0",
  platformFee: calculatePlatformFeeUnits(input.amount),
  platformFeeBps: getDexPlatformFeeBps(),
  routeFound: false,
  status,
  reason
});

export async function quoteDedust(input: DexQuoteRequest): Promise<DexQuote> {
  try {
    Address.parse(input.tokenAddress);
  } catch {
    return failed(input, "unknown_error", "tokenAddress is invalid");
  }

  const route = input.side === "buy"
    ? await resolveDedustBuyRoute(input.tokenAddress)
    : await resolveDedustSellRoute(input.tokenAddress, 'EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c');

  if (route.status !== "quote_ready") {
    return failed(input, route.status, route.reason || "DeDust route unavailable");
  }

  const platformFee = input.side === "buy" ? calculatePlatformFeeUnits(input.amount) : "0";
  const offerAfterFee = input.side === "buy" ? subtractFeeUnits(input.amount, platformFee) : input.amount;

  return {
    dex: "dedust",
    side: input.side,
    tokenAddress: input.tokenAddress,
    offerAmount: offerAfterFee,
    expectedReceive: "0",
    minReceive: "0",
    platformFee,
    platformFeeBps: getDexPlatformFeeBps(),
    routeFound: true,
    status: "quote_ready",
    reason: route.poolAddress && route.vaultAddress ? `pool=${route.poolAddress} vault=${route.vaultAddress}` : undefined
  };
}
