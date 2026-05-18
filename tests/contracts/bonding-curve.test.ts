import { describe, expect, it } from "vitest";

import {
  createInitialBondingState,
  graduationPreview,
  grossTonForBuyingTokens,
  normalizeCreatorTax,
  quoteBuy,
  quoteSell
} from "@meme-launchpad/shared";

describe("bonding curve math", () => {
  it("calculates the base fee split for buys", () => {
    const state = createInitialBondingState(new Date("2026-01-01T00:00:00.000Z"));
    const quote = quoteBuy(state, 10, normalizeCreatorTax({ mode: "normal" }));

    expect(quote.feeBreakdown.baseFeeTon).toBeCloseTo(0.075, 6);
    expect(quote.feeBreakdown.platformTon).toBeCloseTo(0.055, 6);
    expect(quote.feeBreakdown.creatorTon).toBeCloseTo(0.02, 6);
    expect(quote.feeBreakdown.referralTon).toBeCloseTo(0, 6);
    expect(quote.newState.reserveTon).toBeCloseTo(9.925, 6);
  });

  it("supports a buy then sell cycle without negative reserve", () => {
    const state = createInitialBondingState(new Date("2026-01-01T00:00:00.000Z"));
    const bought = quoteBuy(state, 5, normalizeCreatorTax({ mode: "burn" }));
    const sold = quoteSell(
      bought.newState,
      bought.tokenAmount * 0.4,
      normalizeCreatorTax({ mode: "burn" })
    );

    expect(sold.tonAmountGross).toBeGreaterThan(0);
    expect(sold.newState.reserveTon).toBeGreaterThan(0);
    expect(sold.newState.soldSupply).toBeLessThan(bought.newState.soldSupply);
  });

  it("reaches graduation and preserves a positive pool ratio", () => {
    let state = createInitialBondingState(new Date("2026-01-01T00:00:00.000Z"));
    const creatorTax = normalizeCreatorTax({ mode: "normal" });

    while (!state.canGraduate) {
      const tokenChunk = Math.min(state.remainingBondingSupply, 20_000_000);
      const grossTon = grossTonForBuyingTokens(state, tokenChunk, creatorTax);
      state = quoteBuy(state, grossTon, creatorTax).newState;
    }

    const preview = graduationPreview(state);
    expect(state.canGraduate).toBe(true);
    expect(preview.reserveAfterTon).toBeGreaterThan(0);
    expect(preview.poolRatioTon).toBeGreaterThan(0);
  });
});
