import { getContractState } from "./chain";
import { getProjectWallets } from "../project-wallets";
import { ensureListingIntent, getListingIntent } from "./listing-store";

export async function verifyListingPool(poolAddress: string) {
  const intent = await getListingIntent(poolAddress);
  if (!intent) {
    return { ok: false, status: "failed", reason: "listing_intent_not_found" };
  }

  try {
    const poolState = await getContractState(poolAddress);
    return {
      ok: false,
      status: poolState.state === "active" ? "verification_pending" : "failed",
      poolAddress,
      listingStatus: intent.status,
      contractState: poolState.state,
      txHash: intent.txHash || null,
      expectedPair: intent.expectedPair,
      reason: poolState.state === "active"
        ? (intent.dedustPoolAddress ? "external_pool_not_found" : "liquidity_not_found")
        : "pool_not_active"
    };
  } catch (error) {
    return {
      ok: false,
      status: "failed",
      poolAddress,
      listingStatus: intent.status,
      txHash: intent.txHash || null,
      reason: error instanceof Error ? error.message : "verification failed"
    };
  }
}

export async function verifyLpLock(poolAddress: string) {
  const intent = await getListingIntent(poolAddress);
  if (!intent) {
    return { ok: false, status: "failed", reason: "listing_intent_not_found" };
  }

  return {
    ok: false,
    status: intent.txHash ? "verification_pending" : "failed",
    poolAddress,
    txHash: intent.txHash || null,
    expectedPair: intent.expectedPair,
    reason: intent.txHash
      ? "lp_not_verified"
      : "lp_not_verified"
  };
}

export async function ensureLivePoolListingIntent() {
  const poolAddress = process.env.LIVE_POOL_ADDRESS || "EQDUYho8-Np3wzUbkbrN36-fCY9utqdjROPmxB0nzpibT6R-";
  const jettonAddress = process.env.LIVE_JETTON_ADDRESS || "EQBq5kppzmz7BJuvQzAW_ZMyXvFhnSPBjyXD_ximwhedL3ca";
  const ownerWallet = process.env.LIVE_BUYER_ADDRESS || process.env.EXAMPLE_CREATOR_ADDRESS || "EQBEz1JfICpZYhsiqDCccu3lTOo5Or91vFOnqiHcdjcddtrx";
  const liquidityWallet = getProjectWallets().liquidity;
  const now = new Date().toISOString();

  return ensureListingIntent({
    poolAddress,
    jettonAddress,
    ownerWallet,
    liquidityWallet,
    targetDex: "dedust",
    expectedPair: { base: "TON", quote: jettonAddress },
    tonAmount: "0",
    jettonAmount: "0",
    status: "not_ready",
    createdAt: now,
    updatedAt: now,
    reason: "seeded live pool listing intent"
  });
}
