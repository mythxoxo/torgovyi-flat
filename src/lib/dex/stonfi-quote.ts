import type { DexQuote, DexQuoteInput } from "./types";

const toNumber = (value: string) => Number.parseFloat(value || "0");

export async function quoteStonfiTonToJetton(input: DexQuoteInput): Promise<DexQuote> {
  const offer = toNumber(input.offerUnits);
  const slippage = Math.max(0, Math.min(1, Number.parseFloat(input.slippageTolerance || "0.01")));
  const expected = Math.max(0, offer * 0.98);
  const minAsk = Math.max(0, expected * (1 - slippage));

  return {
    dex: "STONFI",
    offerAddress: input.offerAddress,
    askAddress: input.askAddress,
    offerUnits: input.offerUnits,
    expectedAskUnits: expected.toFixed(0),
    minAskUnits: minAsk.toFixed(0),
    priceImpactPct: 0,
    warnings: [
      "Quote-only Phase 2 shell: real STON.fi SDK/API route is gated until package-lock is updated."
    ],
    raw: { mode: "quote-shell" }
  };
}
