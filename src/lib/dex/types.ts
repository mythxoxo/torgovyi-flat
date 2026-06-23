export type DexId = "STONFI" | "DEDUST" | "dedust";

export type DexGraduationStatus =
  | "not_ready"
  | "target_reached"
  | "payload_ready"
  | "waiting_for_manual_signature"
  | "pending_confirmation"
  | "liquidity_added"
  | "lp_lock_pending"
  | "failed";

export type PrepareDedustLiquidityInput = {
  jettonMaster: string;
  pool: string;
  creator?: string;
  tonAmountNano: string;
  tokenAmount: string;
  slippageBps: number;
};

export type PreparedDexMessage = {
  address: string;
  amount: string;
  payload?: string;
  stateInit?: string;
};

export type PreparedDedustLiquidityTx = {
  dex: "dedust";
  mode: "manual";
  status: "payload_ready";
  title: string;
  description: string;
  messages: PreparedDexMessage[];
  warnings: string[];
  validUntil: number;
  manualSigningRequired: true;
  liveExecutionVerified: false;
};

export interface DexQuoteInput {
  userWalletAddress: string;
  offerAddress: "ton" | string;
  askAddress: string;
  offerUnits: string;
  slippageTolerance: string;
}

export interface DexQuote {
  dex: "STONFI" | "DEDUST";
  offerAddress: "ton" | string;
  askAddress: string;
  offerUnits: string;
  expectedAskUnits: string;
  minAskUnits: string;
  routerAddress?: string;
  poolAddress?: string;
  priceImpactPct?: number;
  liquidityGram?: number;
  warnings: string[];
  raw?: unknown;
}

export interface DexQuoteResponse {
  ok: true;
  quote: DexQuote;
}

export interface DexQuoteError {
  ok: false;
  error: string;
}

export interface DexSwapDraftInput extends DexQuoteInput {
  minAskUnits: string;
}

export interface DexSwapDraft {
  dex: "STONFI";
  validUntil: number;
  messages: PreparedDexMessage[];
  warnings: string[];
  liveExecutionVerified: boolean;
}

export interface DexSwapDraftResponse {
  ok: true;
  draft: DexSwapDraft;
}

export interface DexSwapDraftError {
  ok: false;
  error: string;
}
