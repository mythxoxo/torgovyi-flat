import type { DexQuote, DexQuoteInput } from "./types";

type StonfiApiModule = {
  StonApiClient?: new (...args: unknown[]) => {
    simulateSwap?: (args: Record<string, unknown>) => Promise<unknown>;
  };
};

const pickString = (value: unknown, fallback = "0") => {
  if (typeof value === "string" && value.length > 0) return value;
  if (typeof value === "number" && Number.isFinite(value)) return String(Math.floor(value));
  return fallback;
};

const readPath = (source: unknown, path: string[]) => {
  let current: unknown = source;
  for (const key of path) {
    if (!current || typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[key];
  }
  return current;
};

const normalizeSimulation = (input: DexQuoteInput, simulation: unknown): DexQuote => {
  const expectedAskUnits =
    pickString(readPath(simulation, ["askUnits"])) ||
    pickString(readPath(simulation, ["expectedAskUnits"])) ||
    pickString(readPath(simulation, ["estimatedAskUnits"]));

  const minAskUnits =
    pickString(readPath(simulation, ["minAskUnits"]), expectedAskUnits) ||
    pickString(readPath(simulation, ["minimumAskUnits"]), expectedAskUnits);

  return {
    dex: "STONFI",
    offerAddress: input.offerAddress,
    askAddress: input.askAddress,
    offerUnits: input.offerUnits,
    expectedAskUnits,
    minAskUnits,
    routerAddress: pickString(readPath(simulation, ["router", "address"]), ""),
    poolAddress: pickString(readPath(simulation, ["pool", "address"]), ""),
    priceImpactPct: Number(readPath(simulation, ["priceImpact"])) || 0,
    warnings: [],
    raw: simulation
  };
};

export async function quoteStonfiTonToJetton(input: DexQuoteInput): Promise<DexQuote> {
  const module = (await import("@ston-fi/api")) as StonfiApiModule;
  const Client = module.StonApiClient;

  if (!Client) {
    throw new Error("STON.fi API client is unavailable");
  }

  const client = new Client();

  if (typeof client.simulateSwap !== "function") {
    throw new Error("STON.fi simulateSwap is unavailable");
  }

  const simulation = await client.simulateSwap({
    offerAddress: input.offerAddress,
    askAddress: input.askAddress,
    offerUnits: input.offerUnits,
    units: input.offerUnits,
    slippageTolerance: input.slippageTolerance
  });

  return normalizeSimulation(input, simulation);
}
