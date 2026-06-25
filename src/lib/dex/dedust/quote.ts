import { Address } from "@ton/core";
import { calculatePlatformFeeUnits, getDexPlatformFeeBps, subtractFeeUnits } from "../external/fees";
import type { DexQuote, DexQuoteRequest } from "../external/types";

const loadDedustSdk = async (): Promise<Record<string, unknown> | null> => {
  try {
    const importer = new Function("moduleName", "return import(moduleName)") as (moduleName: string) => Promise<Record<string, unknown>>;
    return await importer("@dedust/sdk");
  } catch {
    return null;
  }
};

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
    return failed(input, "failed", "tokenAddress is invalid");
  }

  const sdk = await loadDedustSdk();
  if (!sdk) {
    return failed(input, "sdk_missing", "@dedust/sdk is not installed in this branch; install official DeDust SDK before enabling DeDust quotes");
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
    routeFound: false,
    status: "payload_unavailable",
    reason: "official DeDust SDK was detected, but pool/vault quote wiring still needs concrete SDK export mapping before returning live quotes"
  };
}
