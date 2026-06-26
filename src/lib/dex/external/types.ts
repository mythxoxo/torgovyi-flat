export type ExternalDex = "dedust" | "stonfi";
export type SwapSide = "buy" | "sell";

export type DexQuoteStatus =
  | "quote_ready"
  | "route_not_found"
  | "liquidity_not_found"
  | "pool_not_ready"
  | "sdk_missing"
  | "payload_unavailable"
  | "failed"
  | "unknown_error";

export type DexSwapStatus =
  | "payload_ready"
  | "wallet_resolution_required"
  | "route_not_found"
  | "liquidity_not_found"
  | "pool_not_ready"
  | "proxy_required_for_sell_fee"
  | "sdk_missing"
  | "payload_unavailable"
  | "failed"
  | "unknown_error";

export type DexQuote = {
  dex: ExternalDex;
  side: SwapSide;
  tokenAddress: string;
  offerAmount: string;
  expectedReceive: string;
  minReceive: string;
  platformFee: string;
  platformFeeBps: number;
  dexFee?: string;
  priceImpact?: string;
  routeFound: boolean;
  status: DexQuoteStatus;
  reason?: string;
};

export type DexSwapPayload = {
  dex: ExternalDex;
  side: SwapSide;
  status: DexSwapStatus;
  messages: Array<{
    address: string;
    amount: string;
    payload?: string;
  }>;
  validUntil: number;
  manualSignRequired: true;
  verificationRequired: true;
  platformFee: string;
  platformFeeBps: number;
  reason?: string;
};

export type DexQuoteRequest = {
  tokenAddress: string;
  side: SwapSide;
  amount: string;
  platforms?: ExternalDex[];
  slippageBps?: number;
};

export type DexSwapRequest = DexQuoteRequest & {
  platform: ExternalDex;
  userWallet: string;
};
