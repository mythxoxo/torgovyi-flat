import { calculatePlatformFeeUnits, getDexPlatformFeeBps, subtractFeeUnits } from "../external/fees";
import type { DexSwapPayload, DexSwapRequest } from "../external/types";

const validUntil = () => Math.floor(Date.now() / 1000) + 900;

const result = (input: DexSwapRequest, status: DexSwapPayload["status"], reason: string, platformFee = "0"): DexSwapPayload => ({
  dex: "dedust",
  side: input.side,
  status,
  messages: [],
  validUntil: validUntil(),
  manualSignRequired: true,
  verificationRequired: true,
  platformFee,
  platformFeeBps: getDexPlatformFeeBps(),
  reason
});

export async function buildDedustSwapPayload(input: DexSwapRequest): Promise<DexSwapPayload> {
  const platformFee = input.side === "buy" ? calculatePlatformFeeUnits(input.amount) : "0";
  const offerAfterFee = input.side === "buy" ? subtractFeeUnits(input.amount, platformFee) : input.amount;

  if (input.side === "buy" && BigInt(offerAfterFee) <= 0n) {
    return result(input, "failed", "amount is too small after platform fee", platformFee);
  }
  if (input.side === "sell") {
    return result(input, "proxy_required_for_sell_fee", "DeDust sell with platform fee needs a proxy or official referral mechanism", "0");
  }

  return result(input, "payload_unavailable", "Official DeDust swap message is not wired yet", platformFee);
}
