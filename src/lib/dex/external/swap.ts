import { buildDedustSwapPayload } from "../dedust/swap";
import { buildStonfiSwapPayload } from "../stonfi/swap";
import type { DexSwapPayload, DexSwapRequest } from "./types";

export async function buildExternalSwapPayload(input: DexSwapRequest): Promise<DexSwapPayload> {
  if (input.platform === "dedust") {
    return buildDedustSwapPayload(input);
  }
  if (input.platform === "stonfi") {
    return buildStonfiSwapPayload(input);
  }
  return {
    dex: input.platform,
    side: input.side,
    status: "failed",
    messages: [],
    validUntil: Math.floor(Date.now() / 1000) + 900,
    manualSignRequired: true,
    verificationRequired: true,
    platformFee: "0",
    platformFeeBps: 0,
    reason: "unsupported DEX platform"
  };
}
