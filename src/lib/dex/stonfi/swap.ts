import { calculatePlatformFeeUnits, getDexPlatformFeeBps, getDexPlatformFeeTreasury, subtractFeeUnits } from "../external/fees";
import type { DexSwapPayload, DexSwapRequest } from "../external/types";

const validUntil = () => Math.floor(Date.now() / 1000) + 900;

const result = (input: DexSwapRequest, status: DexSwapPayload["status"], reason: string, platformFee = "0"): DexSwapPayload => ({
  dex: "stonfi",
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

const normalizeTxParams = (txParams: any) => [{
  address: txParams.to?.toString?.() || String(txParams.to || ""),
  amount: txParams.value?.toString?.() || String(txParams.value || txParams.amount || "0"),
  payload: txParams.body?.toBoc ? txParams.body.toBoc().toString("base64") : txParams.payload,
}];

export async function buildStonfiSwapPayload(input: DexSwapRequest): Promise<DexSwapPayload> {
  try {
    const { StonApiClient } = await import("@ston-fi/api");
    const { Client, dexFactory } = await import("@ston-fi/sdk");
    const endpoint = process.env.TONCENTER_API_KEY
      ? `https://toncenter.com/api/v2/jsonRPC?api_key=${process.env.TONCENTER_API_KEY}`
      : "https://toncenter.com/api/v2/jsonRPC";
    const apiClient = new StonApiClient();
    const platformFee = input.side === "buy" ? calculatePlatformFeeUnits(input.amount) : "0";
    const offerAmount = input.side === "buy" ? subtractFeeUnits(input.amount, platformFee) : input.amount;
    const simulation = await apiClient.simulateSwap({
      offerAddress: input.side === "buy" ? "ton" : input.tokenAddress,
      askAddress: input.side === "buy" ? input.tokenAddress : "ton",
      offerUnits: offerAmount,
      slippageTolerance: String(Math.max(0, input.slippageBps ?? 300) / 10000),
    });
    const dexContracts = dexFactory(simulation.router);
    const client = new Client({ endpoint });
    const router = client.open(dexContracts.Router.create(simulation.router.address));
    const treasury = getDexPlatformFeeTreasury();
    const referralValue = getDexPlatformFeeBps();
    const referralArgs = treasury ? { referralAddress: treasury, referralValue } : {};
    const proxyTon = dexContracts.pTON.create(simulation.router.ptonMasterAddress);
    const txParams = input.side === "buy"
      ? await router.getSwapTonToJettonTxParams({
          userWalletAddress: input.userWallet,
          offerAmount: simulation.offerUnits,
          minAskAmount: simulation.minAskUnits,
          askJettonAddress: simulation.askAddress,
          proxyTon,
          ...referralArgs,
          queryId: Date.now(),
        })
      : await router.getSwapJettonToTonTxParams({
          userWalletAddress: input.userWallet,
          offerJettonAddress: simulation.offerAddress,
          offerAmount: simulation.offerUnits,
          minAskAmount: simulation.minAskUnits,
          proxyTon,
          ...referralArgs,
          queryId: Date.now(),
        });
    return {
      dex: "stonfi",
      side: input.side,
      status: "payload_ready",
      messages: normalizeTxParams(txParams),
      validUntil: validUntil(),
      manualSignRequired: true,
      verificationRequired: true,
      platformFee,
      platformFeeBps: getDexPlatformFeeBps(),
    };
  } catch (error) {
    const reason = error instanceof Error ? error.message : "STON.fi payload failed";
    if (/400 Bad Request|route|not found/i.test(reason)) return result(input, "route_not_found", reason);
    if (/liquidity|reserve|pool/i.test(reason)) return result(input, "liquidity_not_found", reason);
    return result(input, "unknown_error", reason);
  }
}
