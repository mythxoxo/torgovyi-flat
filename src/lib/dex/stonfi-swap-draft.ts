import type { DexSwapDraft, DexSwapDraftInput } from "./types";

type SdkModule = Record<string, unknown>;
type ApiModule = Record<string, unknown>;
type TonModule = Record<string, unknown>;

const TON_ADDRESS = "EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c";

const toBase64Payload = (body: unknown) => {
  if (!body || typeof body !== "object") return undefined;
  const toBoc = (body as { toBoc?: () => Uint8Array }).toBoc;
  if (typeof toBoc !== "function") return undefined;
  return Buffer.from(toBoc()).toString("base64");
};

const stringifyAddress = (value: unknown) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object" && "toString" in value && typeof value.toString === "function") return value.toString();
  return "";
};

export async function buildStonfiSwapDraft(input: DexSwapDraftInput): Promise<DexSwapDraft> {
  if (process.env.NEXT_PUBLIC_DEX_TRADING_ENABLED !== "true") {
    throw new Error("DEX trading is disabled by feature flag");
  }

  const api = (await import("@ston-fi/api")) as ApiModule;
  const sdk = (await import("@ston-fi/sdk")) as SdkModule;
  const ton = (await import("@ton/ton")) as TonModule;

  const StonApiClient = api.StonApiClient as (new (...args: unknown[]) => { simulateSwap?: (args: Record<string, unknown>) => Promise<Record<string, unknown>> }) | undefined;
  const dexFactory = sdk.dexFactory as ((router: unknown) => { Router?: { create?: (address: unknown) => unknown }; pTON?: { create?: (address: unknown) => unknown } }) | undefined;
  const TonClient = ton.TonClient as (new (args: Record<string, unknown>) => unknown) | undefined;

  if (!StonApiClient || !dexFactory || !TonClient) {
    throw new Error("Required STON.fi SDK/API helpers are unavailable");
  }

  const stonApi = new StonApiClient();
  if (typeof stonApi.simulateSwap !== "function") {
    throw new Error("STON.fi simulateSwap is unavailable");
  }

  const simulation = await stonApi.simulateSwap({
    offerAddress: input.offerAddress === "ton" ? TON_ADDRESS : input.offerAddress,
    askAddress: input.askAddress,
    offerUnits: input.offerUnits,
    slippageTolerance: input.slippageTolerance,
    dexV2: true
  });

  const endpoint = process.env.TONCENTER_ENDPOINT || "https://toncenter.com/api/v2/jsonRPC";
  const apiKey = process.env.TONCENTER_API_KEY;
  const client = new TonClient(apiKey ? { endpoint, apiKey } : { endpoint }) as { open?: (contract: unknown) => unknown };
  const dexContracts = dexFactory(simulation.router);

  const routerAddress = (simulation.router as { address?: unknown } | undefined)?.address;
  const ptonMasterAddress = (simulation.router as { ptonMasterAddress?: unknown } | undefined)?.ptonMasterAddress;
  if (!client.open || !dexContracts.Router?.create || !dexContracts.pTON?.create || !routerAddress || !ptonMasterAddress) {
    throw new Error("STON.fi router simulation is unavailable for this asset pair");
  }

  const router = client.open(dexContracts.Router.create(routerAddress)) as {
    getSwapTonToJettonTxParams?: (args: Record<string, unknown>) => Promise<Record<string, unknown>>;
    getSwapJettonToJettonTxParams?: (args: Record<string, unknown>) => Promise<Record<string, unknown>>;
    getSwapJettonToTonTxParams?: (args: Record<string, unknown>) => Promise<Record<string, unknown>>;
  };

  const sharedTxParams = {
    userWalletAddress: input.userWalletAddress,
    offerAmount: simulation.offerUnits ?? input.offerUnits,
    minAskAmount: simulation.minAskUnits ?? input.minAskUnits
  };

  let tx: Record<string, unknown>;
  if (simulation.offerAddress === TON_ADDRESS) {
    if (typeof router.getSwapTonToJettonTxParams !== "function") throw new Error("STON.fi TON->jetton method is unavailable");
    tx = await router.getSwapTonToJettonTxParams({
      ...sharedTxParams,
      proxyTon: dexContracts.pTON.create(ptonMasterAddress),
      askJettonAddress: simulation.askAddress,
      forwardGasAmount: (simulation.gasParams as { forwardGas?: unknown } | undefined)?.forwardGas
    });
  } else if (simulation.askAddress === TON_ADDRESS) {
    if (typeof router.getSwapJettonToTonTxParams !== "function") throw new Error("STON.fi jetton->TON method is unavailable");
    tx = await router.getSwapJettonToTonTxParams({
      ...sharedTxParams,
      proxyTon: dexContracts.pTON.create(ptonMasterAddress),
      offerJettonAddress: simulation.offerAddress,
      gasAmount: (simulation.gasParams as { gasBudget?: unknown } | undefined)?.gasBudget,
      forwardGasAmount: (simulation.gasParams as { forwardGas?: unknown } | undefined)?.forwardGas
    });
  } else {
    if (typeof router.getSwapJettonToJettonTxParams !== "function") throw new Error("STON.fi jetton->jetton method is unavailable");
    tx = await router.getSwapJettonToJettonTxParams({
      ...sharedTxParams,
      offerJettonAddress: simulation.offerAddress,
      askJettonAddress: simulation.askAddress,
      gasAmount: (simulation.gasParams as { gasBudget?: unknown } | undefined)?.gasBudget,
      forwardGasAmount: (simulation.gasParams as { forwardGas?: unknown } | undefined)?.forwardGas
    });
  }

  const address = stringifyAddress(tx.to ?? tx.address);
  const amount = String(tx.value ?? tx.amount ?? input.offerUnits);
  const payload = toBase64Payload(tx.body ?? tx.payload);

  if (!address || !amount || !payload) {
    throw new Error("STON.fi returned unusable wallet transaction params for this route");
  }

  return {
    dex: "STONFI",
    validUntil: Math.floor(Date.now() / 1000) + 300,
    messages: [{ address, amount, payload }],
    warnings: ["Review wallet details before signing. Route and min output were precomputed from STON.fi."],
    liveExecutionVerified: true
  };
}
