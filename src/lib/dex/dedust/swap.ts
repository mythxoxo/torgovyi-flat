import { Address, beginCell, toNano } from "@ton/core";
import { calculatePlatformFeeUnits, getDexPlatformFeeBps, getDexPlatformFeeTreasury, subtractFeeUnits } from "../external/fees";
import type { DexSwapPayload, DexSwapRequest } from "../external/types";
import { resolveDedustBuyRoute } from "./route";

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
    return result(input, "proxy_required_for_sell_fee", "DeDust sell with platform fee needs a PlatformSwapProxy path", "0");
  }

  const route = await resolveDedustBuyRoute(input.tokenAddress);
  if (route.status !== "quote_ready") {
    return result(input, route.status, route.reason || "DeDust route unavailable", platformFee);
  }

  const treasury = getDexPlatformFeeTreasury();
  const messages: DexSwapPayload['messages'] = [];
  if (treasury && BigInt(platformFee) > 0n) {
    messages.push({
      address: treasury,
      amount: platformFee,
    });
  }

  if (!route.vaultAddress || !route.poolAddress) {
    return result(input, "payload_unavailable", "vault or pool address missing after route resolution", platformFee);
  }

  const payload = beginCell()
    .storeUint(0xea06185d, 32)
    .storeUint(0, 64)
    .storeCoins(BigInt(offerAfterFee))
    .storeAddress(Address.parse(route.poolAddress))
    .storeUint(0, 1)
    .storeCoins(0)
    .storeMaybeRef(null)
    .storeRef(beginCell().storeUint(0, 32).storeAddress(Address.parse(input.userWallet)).storeAddress(null).storeMaybeRef(null).storeMaybeRef(null).endCell())
    .endCell()
    .toBoc()
    .toString('base64');

  messages.push({
    address: route.vaultAddress,
    amount: (BigInt(offerAfterFee) + toNano('0.2')).toString(),
    payload,
  });

  if (!messages[messages.length - 1]?.payload) {
    return result(input, "payload_unavailable", "dedust payload body is empty", platformFee);
  }

  return {
    dex: 'dedust',
    side: input.side,
    status: 'payload_ready',
    messages,
    validUntil: validUntil(),
    manualSignRequired: true,
    verificationRequired: true,
    platformFee,
    platformFeeBps: getDexPlatformFeeBps(),
    reason: `pool=${route.poolAddress} vault=${route.vaultAddress}`,
  };
}
