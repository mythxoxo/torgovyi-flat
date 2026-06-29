import { Address } from "@ton/core";
import type { CreateTokenInput, TokenRecord, TokenRow, UserSummary } from "../shared";
import { listIndexedTokens, upsertTokenRow } from "./indexer-store";
import { findReferralBindingByWallet, getReferralAccounting } from "./referral-store";

const parseTonAddress = (value: unknown, field: string): string => {
  if (typeof value !== "string" || !value.trim()) throw new Error(`${field} is required`);
  try {
    return Address.parse(value.trim()).toString({ bounceable: true, testOnly: false });
  } catch {
    throw new Error(`${field} must be a valid TON mainnet address`);
  }
};

const normalizeName = (value: unknown): string => {
  if (typeof value !== "string") throw new Error("name is required");
  const name = value.trim().replace(/\s+/g, " ");
  if (name.length < 2 || name.length > 64) throw new Error("name must be 2..64 characters");
  return name;
};

const normalizeTicker = (value: unknown): string => {
  if (typeof value !== "string") throw new Error("ticker is required");
  const ticker = value.trim().replace(/^\$/g, "").toUpperCase();
  if (!/^[A-Z0-9]{2,10}$/.test(ticker)) throw new Error("ticker must be 2..10 uppercase letters/numbers");
  return ticker;
};

const normalizeDescription = (value: unknown): string => {
  if (value == null) return "";
  if (typeof value !== "string") throw new Error("description must be a string");
  const description = value.trim();
  if (description.length > 500) throw new Error("description must be <= 500 characters");
  return description;
};

const normalizeImage = (value: unknown): string | null => {
  if (value == null || value === "") return null;
  if (typeof value !== "string") throw new Error("image must be a URL/path string");
  const image = value.trim();
  if (image.length > 512) throw new Error("image URL is too long");
  if (!image.startsWith("/") && !/^https:\/\//i.test(image)) throw new Error("image must be a safe https URL or local path");
  return image;
};

const normalizeTargetTon = (value: unknown): number => {
  const target = Number(value ?? 5);
  if (target !== 5 && target !== 8888) throw new Error("targetTon must be 5 or 8888");
  return target;
};

const validateTotalSupply = (value: unknown): void => {
  const raw = String(value ?? "1000000000").trim();
  if (!/^[1-9][0-9]{0,17}$/.test(raw)) throw new Error("totalSupply must be a positive integer string");
};

export const createToken = async (input: CreateTokenInput) => {
  const name = normalizeName(input.name);
  const ticker = normalizeTicker(input.ticker);
  const description = normalizeDescription(input.description);
  const image = normalizeImage(input.image);
  const creator = parseTonAddress(input.creatorWallet, "creatorWallet");
  validateTotalSupply(input.totalSupply);
  const targetTon = normalizeTargetTon(input.curveConfig?.targetTon);
  const minBuyTon = Number(input.curveConfig?.minBuyTon ?? 0.05);
  const feeBps = Number(input.curveConfig?.feeBps ?? 75);
  if (!Number.isFinite(minBuyTon) || minBuyTon <= 0 || minBuyTon > 10) throw new Error("minBuyTon is out of range");
  if (!Number.isInteger(feeBps) || feeBps < 0 || feeBps > 1000) throw new Error("feeBps is out of range");

  const now = new Date().toISOString();
  const stagedRow: TokenRow = {
    pool_address: `pending:${creator}:${Date.now()}`,
    jetton_address: "",
    creator,
    name,
    symbol: ticker,
    description,
    image_url: image,
    collected_ton: 0,
    target_ton: targetTon,
    sold_tokens: 0,
    status: "PENDING",
    is_listed: false,
    lp_lock_address: null,
    dedust_pool_address: null,
    created_at: now,
    updated_at: now
  };

  await upsertTokenRow(stagedRow);

  return {
    ok: true,
    pending: true,
    creatorWallet: creator,
    submittedVia: "tonconnect-user-signature",
    stagedId: stagedRow.pool_address,
    message: "Launch metadata staged. User-signed TonConnect transaction must be confirmed by the indexer before live status is shown."
  };
};

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
  const normalizedWallet = parseTonAddress(wallet, "wallet");
  const tokens = await listIndexedTokens("new");
  const createdTokens = tokens.filter((token) => token.creator === normalizedWallet || token.creator === wallet).map(mapCreatedToken);
  const binding = await findReferralBindingByWallet(normalizedWallet);
  const accounting = await getReferralAccounting(normalizedWallet);

  return {
    wallet: normalizedWallet,
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
