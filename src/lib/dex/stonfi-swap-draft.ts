import type { DexSwapDraft, DexSwapDraftInput } from "./types";

type SdkModule = Record<string, unknown>;
type TonModule = Record<string, unknown>;

const requireEnv = (name: string) => {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required for STON.fi swap draft`);
  return value;
};

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

  const sdk = (await import("@ston-fi/sdk")) as SdkModule;
  const ton = (await import("@ton/ton")) as TonModule;

  const DEX = sdk.DEX as Record<string, unknown> | undefined;
  const pTON = sdk.pTON as Record<string, unknown> | undefined;
  const TonClient = ton.TonClient as (new (args: Record<string, unknown>) => unknown) | undefined;
  const Address = ton.Address as { parse?: (value: string) => unknown } | undefined;

  if (!DEX || !pTON || !TonClient || !Address?.parse) {
    throw new Error("Required TON/STON.fi SDK helpers are unavailable");
  }

  const endpoint = process.env.TONCENTER_ENDPOINT || "https://toncenter.com/api/v2/jsonRPC";
  const apiKey = process.env.TONCENTER_API_KEY;
  const routerAddress = requireEnv("STONFI_ROUTER_ADDRESS");
  const proxyTonAddress = requireEnv("STONFI_PTON_ADDRESS");

  const client = new TonClient(apiKey ? { endpoint, apiKey } : { endpoint }) as { open?: (contract: unknown) => unknown };
  const routerFactory = (DEX.v2 as Record<string, unknown> | undefined)?.Router as { create?: (address: unknown) => unknown } | undefined;
  const ptonFactory = (pTON.v2 as { create?: (address: unknown) => unknown } | undefined);

  if (!client.open || !routerFactory?.create || !ptonFactory?.create) {
    throw new Error("STON.fi v2 router helpers are unavailable");
  }

  const router = client.open(routerFactory.create(Address.parse(routerAddress))) as {
    getSwapTonToJettonTxParams?: (args: Record<string, unknown>) => Promise<Record<string, unknown>>;
  };

  if (typeof router.getSwapTonToJettonTxParams !== "function") {
    throw new Error("STON.fi router swap method is unavailable");
  }

  const tx = await router.getSwapTonToJettonTxParams({
    userWalletAddress: Address.parse(input.userWalletAddress),
    proxyTon: ptonFactory.create(Address.parse(proxyTonAddress)),
    offerAmount: BigInt(input.offerUnits),
    askJettonAddress: Address.parse(input.askAddress),
    minAskAmount: BigInt(input.minAskUnits)
  });

  const address = stringifyAddress(tx.to ?? tx.address);
  const amount = String(tx.value ?? tx.amount ?? input.offerUnits);
  const payload = toBase64Payload(tx.body ?? tx.payload);

  if (!address || !amount || !payload) {
    throw new Error("STON.fi swap draft is incomplete");
  }

  return {
    dex: "STONFI",
    validUntil: Math.floor(Date.now() / 1000) + 300,
    messages: [{ address, amount, payload }],
    warnings: ["Swap draft generated but live execution is not verified yet."],
    liveExecutionVerified: false
  };
}
