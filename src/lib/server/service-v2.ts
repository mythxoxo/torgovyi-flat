import type { CreateTokenInput, TokenRecord, UserSummary } from "../shared";
import { listIndexedTokens } from "./indexer-store";
import { executeCreateToken } from "./launch-executor";
import { findReferralBindingByWallet, getReferralAccounting } from "./referral-store";

export const createToken = async (input: CreateTokenInput) => executeCreateToken(input);

const mapCreatedToken = (row: Awaited<ReturnType<typeof listIndexedTokens>>[number]): TokenRecord => ({
  id: row.pool_address,
  name: row.name,
  ticker: row.symbol,
  image: row.image_url || "/brand/img_04.jpg",
  description: row.description || "",
  creatorWallet: row.creator,
  links: {},
  status: row.status === "PENDING" ? "PENDING" : row.is_listed ? "LISTED" : row.status === "GRADUATED_READY" ? "GRADUATED_READY" : "BONDING",
  metadataStatus: "READY",
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  creationFeeEscrowTon: 0,
  refundStatus: "LOCKED",
  creatorTax: { mode: "normal", rate: 0, buybackSplit: 0, burnSplit: 0 },
  state: {
    soldSupply: Number(row.sold_tokens),
    reserveTon: Number(row.collected_ton),
    currentPriceTon: 0,
    progress: Number(row.target_ton) > 0 ? Number(row.collected_ton) / Number(row.target_ton) : 0,
    marketCapTon: Number(row.collected_ton),
    volumeTon: Number(row.collected_ton),
    graduationTargetTon: Number(row.target_ton),
    expectedPoolRatioTon: 0,
    remainingBondingSupply: 0,
    circulatingSupply: Number(row.sold_tokens),
    antiSnipeEndsAt: row.created_at,
    canGraduate: row.status === "GRADUATED_READY" || row.is_listed,
    collectedTon: Number(row.collected_ton),
    targetTon: Number(row.target_ton),
    isGraduated: row.status === "GRADUATED_READY" || row.is_listed,
    isListed: row.is_listed
  },
  trades: [],
  comments: [],
  holderBalances: {},
  holderCount: 0,
  topHolders: [],
  creatorPerformance: { boughtTon: 0, soldTon: 0 },
  feeVault: {
    treasuryTon: 0,
    creatorClaimables: {},
    referralClaimables: {},
    creatorClaimedTon: {},
    referralClaimedTon: {},
    creatorTaxBuybackTon: 0,
    creatorTaxBurnedTon: 0
  },
  platformVesting: {
    totalAllocation: 0,
    immediateUnlockAmount: 0,
    linearUnlockAmount: 0,
    claimedAmount: 0
  },
  migration: {
    adapterStatus: row.is_listed ? "LISTED" : row.status === "GRADUATED_READY" ? "READY" : "PENDING",
    routerAddress: process.env.DEDUST_ROUTER_ADDRESS || "",
    lpState: row.lp_lock_address ? "LOCKED" : "NONE",
    graduationFeeTon: Number(row.target_ton),
    creatorRefundTon: 0,
    liquidityTon: Number(row.collected_ton),
    liquidityTokens: Number(row.sold_tokens),
    lpLockAddress: row.lp_lock_address || undefined,
    dedustPoolAddress: row.dedust_pool_address || undefined
  },
  contractAddresses: {
    factory: process.env.NEXT_PUBLIC_FACTORY_ADDRESS || "",
    jettonMaster: row.jetton_address,
    bondingCurve: row.pool_address,
    lpLock: row.lp_lock_address || undefined
  }
});

export const getUserSummary = async (wallet: string): Promise<UserSummary> => {
  const tokens = await listIndexedTokens("new");
  const createdTokens = tokens.filter((token) => token.creator === wallet).map(mapCreatedToken);
  const binding = await findReferralBindingByWallet(wallet);
  const accounting = await getReferralAccounting(wallet);

  return {
    wallet,
    createdTokens,
    creatorFeeEarnedTon: 0,
    creatorClaimableTon: 0,
    creatorClaimedTon: 0,
    referralCode: binding?.code || "",
    referredVolumeTon: 0,
    referralEarnedTon: accounting?.earnedTon ?? 0,
    referralClaimableTon: accounting?.claimableTon ?? 0,
    referralClaimedTon: accounting?.claimedTon ?? 0,
    refunds: []
  };
};
