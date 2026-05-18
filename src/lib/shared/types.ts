export type TokenStatus =
  | "PENDING"
  | "BONDING"
  | "GRADUATED_READY"
  | "LISTED"
  | "FAILED_LISTING";

export type MetadataStatus = "READY" | "PENDING" | "FAILED_UPLOAD";
export type RefundStatus = "LOCKED" | "CLAIMABLE" | "REFUNDED" | "FORFEITED";
export type TradeSide = "BUY" | "SELL";
export type CreatorTaxMode = "normal" | "burn" | "buyback_burn" | "custom";
export type MigrationAdapterStatus = "PENDING" | "READY" | "LISTED" | "FAILED";

export interface CreatorTaxConfig {
  mode: CreatorTaxMode;
  rate: number;
  buybackSplit: number;
  burnSplit: number;
}

export interface FeeBreakdown {
  grossTon: number;
  netTon: number;
  baseFeeTon: number;
  creatorTaxTon: number;
  totalFeeTon: number;
  totalFeeRate: number;
  platformTon: number;
  creatorTon: number;
  referralTon: number;
  buybackTon: number;
  burnTon: number;
  referralWallet?: string;
}

export interface BondingState {
  soldSupply: number;
  reserveTon: number;
  currentPriceTon: number;
  progress: number;
  marketCapTon: number;
  volumeTon: number;
  graduationTargetTon: number;
  expectedPoolRatioTon: number;
  remainingBondingSupply: number;
  circulatingSupply: number;
  antiSnipeEndsAt: string;
  canGraduate: boolean;
  collectedTon?: number;
  targetTon?: number;
  isGraduated?: boolean;
  isListed?: boolean;
}

export interface TradeRecord {
  id: string;
  side: TradeSide;
  wallet: string;
  tokenAmount: number;
  tonAmountGross: number;
  tonAmountNet: number;
  spotPriceTon: number;
  slippageBps: number;
  feeBreakdown?: FeeBreakdown;
  referralCode?: string;
  referralWallet?: string;
  createdAt: string;
  txHash?: string;
  lt?: string;
}

export interface TokenComment {
  id: string;
  author: string;
  body: string;
  createdAt: string;
}

export interface HolderSnapshot {
  wallet: string;
  amount: number;
  percentage: number;
}

export interface PlatformVestingSnapshot {
  totalAllocation: number;
  immediateUnlockAmount: number;
  linearUnlockAmount: number;
  graduatedAt?: string;
  claimedAmount: number;
}

export interface FeeVaultSnapshot {
  treasuryTon: number;
  creatorClaimables: Record<string, number>;
  referralClaimables: Record<string, number>;
  creatorClaimedTon: Record<string, number>;
  referralClaimedTon: Record<string, number>;
  creatorTaxBuybackTon: number;
  creatorTaxBurnedTon: number;
}

export interface MigrationState {
  adapterStatus: MigrationAdapterStatus;
  routerAddress: string;
  lastError?: string;
  lpState: "NONE" | "LOCKED" | "BURNED";
  migratedAt?: string;
  graduationFeeTon: number;
  creatorRefundTon: number;
  liquidityTon: number;
  liquidityTokens: number;
  lpLockAddress?: string;
  stonfiPoolAddress?: string;
  listingTxHash?: string;
}

export interface TokenContractAddresses {
  factory: string;
  jettonMaster: string;
  bondingCurve: string;
  feeVault?: string;
  platformVestingVault?: string;
  liquidityMigrator?: string;
  lpLock?: string;
}

export interface TokenRecord {
  id: string;
  name: string;
  ticker: string;
  image: string;
  description: string;
  creatorWallet: string;
  creatorTelegramId?: string;
  links: {
    telegram?: string;
    twitter?: string;
    website?: string;
  };
  status: TokenStatus;
  metadataStatus: MetadataStatus;
  createdAt: string;
  updatedAt: string;
  creationFeeEscrowTon: number;
  refundStatus: RefundStatus;
  creatorTax: CreatorTaxConfig;
  state: BondingState;
  trades: TradeRecord[];
  comments: TokenComment[];
  holderBalances: Record<string, number>;
  holderCount: number;
  topHolders: HolderSnapshot[];
  creatorPerformance: {
    boughtTon: number;
    soldTon: number;
  };
  feeVault: FeeVaultSnapshot;
  platformVesting: PlatformVestingSnapshot;
  migration: MigrationState;
  contractAddresses: TokenContractAddresses;
}

export interface ReferralEntry {
  code: string;
  wallet: string;
  totalVolumeTon: number;
  earnedTon: number;
  createdAt: string;
}

export interface UserSummary {
  wallet: string;
  createdTokens: TokenRecord[];
  creatorFeeEarnedTon: number;
  creatorClaimableTon: number;
  creatorClaimedTon: number;
  referralCode: string;
  referredVolumeTon: number;
  referralEarnedTon: number;
  referralClaimableTon: number;
  referralClaimedTon: number;
  refunds: Array<{
    tokenId: string;
    status: RefundStatus;
    claimableTon: number;
  }>;
}

export type ClaimType = "creator" | "referral" | "refund";

export interface ClaimRequest {
  wallet: string;
  type: ClaimType;
  tokenId?: string;
}

export interface ClaimResponse {
  wallet: string;
  type: ClaimType;
  claimedTon: number;
  tokenId?: string;
  user: UserSummary;
}

export interface LaunchpadSnapshot {
  tokens: TokenRecord[];
  referrals: ReferralEntry[];
  version: number;
  updatedAt: string;
}

export interface CreateTokenInput {
  name: string;
  ticker: string;
  image?: string;
  description?: string;
  telegramLink?: string;
  twitterLink?: string;
  websiteLink?: string;
  creatorWallet: string;
  creatorTelegramId?: string;
  creatorTax?: Partial<CreatorTaxConfig>;
  totalSupply?: string | number;
  curveConfig?: Record<string, unknown>;
}

export interface BuySellRequest {
  wallet: string;
  tokenId: string;
  referralCode?: string;
  slippageBps?: number;
  txHash?: string;
}

export interface BuyRequest extends BuySellRequest {
  tonAmount: number;
}

export interface SellRequest extends BuySellRequest {
  tokenAmount: number;
}

export interface BuyQuote {
  tokenAmount: number;
  feeBreakdown: FeeBreakdown;
  newState: BondingState;
}

export interface SellQuote {
  tonAmountGross: number;
  tonAmountNet: number;
  feeBreakdown: FeeBreakdown;
  newState: BondingState;
}

export interface TokenRow {
  pool_address: string;
  jetton_address: string;
  creator: string;
  name: string;
  symbol: string;
  description: string | null;
  image_url: string | null;
  collected_ton: string | number;
  target_ton: string | number;
  sold_tokens: string | number;
  status: string;
  is_listed: boolean;
  lp_lock_address: string | null;
  stonfi_pool_address: string | null;
  created_at: string;
  updated_at: string;
}

export interface TradeRow {
  id?: number;
  pool_address: string;
  buyer: string;
  ton_amount: string | number;
  token_amount: string | number;
  tx_hash: string;
  lt: string | null;
  created_at: string;
}

export interface ListingRow {
  id?: number;
  pool_address: string;
  jetton_address: string;
  ton_amount: string | number;
  jetton_amount: string | number;
  lp_lock_address: string;
  stonfi_tx_hash: string | null;
  status: string;
  error: string | null;
  created_at: string;
  updated_at: string;
}
