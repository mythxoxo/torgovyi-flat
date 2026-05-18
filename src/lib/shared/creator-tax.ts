import { CREATOR_TAX_OPTIONS, MAX_CREATOR_TAX_RATE } from "./constants";
import type { CreatorTaxConfig, CreatorTaxMode } from "./types";
import { assert, roundNumber } from "./utils";

const PRESETS: Record<Exclude<CreatorTaxMode, "custom">, CreatorTaxConfig> = {
  normal: {
    mode: "normal",
    rate: 0,
    buybackSplit: 0,
    burnSplit: 0
  },
  burn: {
    mode: "burn",
    rate: 0.01,
    buybackSplit: 0,
    burnSplit: 1
  },
  buyback_burn: {
    mode: "buyback_burn",
    rate: 0.015,
    buybackSplit: 0.7,
    burnSplit: 0.3
  }
};

export const creatorTaxPresets = PRESETS;

export const normalizeCreatorTax = (input?: Partial<CreatorTaxConfig>): CreatorTaxConfig => {
  const mode = input?.mode ?? "normal";
  if (mode !== "custom") {
    return PRESETS[mode];
  }

  const customInput = input ?? {};
  const rate = customInput.rate ?? 0;
  const buybackSplit = customInput.buybackSplit ?? 0;
  const burnSplit = customInput.burnSplit ?? 0;

  assert(rate <= MAX_CREATOR_TAX_RATE, "Creator tax cannot exceed 2%");
  assert(
    CREATOR_TAX_OPTIONS.includes(roundNumber(rate, 3) as (typeof CREATOR_TAX_OPTIONS)[number]),
    "Custom creator tax must be one of 0%, 0.5%, 1%, 1.5%, 2%"
  );
  assert(roundNumber(buybackSplit + burnSplit, 6) === 1, "Custom creator tax split must sum to 100%");
  assert(buybackSplit >= 0 && burnSplit >= 0, "Custom creator tax split must be non-negative");

  return {
    mode,
    rate,
    buybackSplit,
    burnSplit
  };
};
