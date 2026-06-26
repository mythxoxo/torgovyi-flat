import { calculatePlatformFeeUnits, getDexPlatformFeeBps, subtractFeeUnits } from "../external/fees";
import type { DexQuote, DexQuoteRequest } from "../external/types";

const failed = (input: DexQuoteRequest, status: DexQuote["status"], reason: string): DexQuote => ({
  dex: "stonfi",
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

export async function quoteStonfi(input: DexQuoteRequest): Promise<DexQuote> {
  const platformFee = input.side === "buy" ? calculatePlatformFeeUnits(input.amount) : "0";
  const offerAmount = input.side === "buy" ? subtractFeeUnits(input.amount, platformFee) : input.amount;
  try {
    const { StonApiClient } = await import("@ston-fi/api");
    const client = new StonApiClient();
    const simulation = await client.simulateSwap({
      offerAddress: input.side === "buy" ? "ton" : input.tokenAddress,
      askAddress: input.side === "buy" ? input.tokenAddress : "ton",
      offerUnits: offerAmount,
      slippageTolerance: String(Math.max(0, input.slippageBps ?? 300) / 10000),
    });
    return {
      dex: "stonfi",
      side: input.side,
      tokenAddress: input.tokenAddress,
      offerAmount: String(simulation.offerUnits ?? offerAmount),
      expectedReceive: String(simulation.askUnits ?? "0"),
      minReceive: String(simulation.minAskUnits ?? "0"),
      platformFee,
      platformFeeBps: getDexPlatformFeeBps(),
      routeFound: true,
      status: "quote_ready",
    };
  } catch (error) {
    const reason = error instanceof Error ? error.message : "quote failed";
    if (/400 Bad Request|route|not found/i.test(reason)) return failed(input, "route_not_found", reason);
    if (/liquidity|reserve|pool/i.test(reason)) return failed(input, "liquidity_not_found", reason);
    return failed(input, "unknown_error", reason);
  }
}
