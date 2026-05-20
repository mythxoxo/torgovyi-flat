import { NextResponse, type NextRequest } from "next/server";
import { createMediaStorage } from "./server/media";
import { listIndexedTokens, getIndexedToken, getTradesByPool } from "./server/indexer-store";
import { createToken as createTokenRequest, getUserSummary } from "./server/service-v2";
import type { TokenRow } from "./shared";

const optionalString = (value: string | undefined, fallback = ""): string => value?.trim() || fallback;

const apiEnv = {
  publicUrl: optionalString(
    process.env.API_PUBLIC_URL,
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"
  ),
  telegramWebAppUrl: optionalString(process.env.TELEGRAM_WEBAPP_URL, "https://torgovyi-flat.vercel.app/")
};

let _mediaStorage: ReturnType<typeof createMediaStorage> | undefined;
const getMediaStorage = () => {
  if (!_mediaStorage) {
    _mediaStorage = createMediaStorage({
      mode: process.env.UPLOAD_STORAGE || "local",
      publicBaseUrl: apiEnv.publicUrl,
      s3Bucket: process.env.S3_BUCKET || "",
      s3Region: process.env.S3_REGION || "",
      s3AccessKey: process.env.S3_ACCESS_KEY || "",
      s3SecretKey: process.env.S3_SECRET_KEY || "",
      s3PublicBaseUrl: process.env.S3_PUBLIC_BASE_URL || ""
    });
  }
  return _mediaStorage;
};

const json = (body: unknown, status = 200) => NextResponse.json(body, { status });
const fail = (error: unknown, status = 400) =>
  json({ error: error instanceof Error ? error.message : "Unknown error" }, status);

const mapTokenRow = (row: TokenRow) => ({
  id: row.pool_address,
  name: row.name,
  ticker: row.symbol,
  image: row.image_url || "/brand/img_04.jpg",
  description: row.description || "",
  creatorWallet: row.creator,
  links: {},
  status: row.is_listed ? "LISTED" : row.status === "GRADUATED_READY" ? "GRADUATED_READY" : "BONDING",
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

export const getHealth = () =>
  json({ ok: true, service: "launchpad-api", storage: "postgres", timestamp: new Date().toISOString() });

export const uploadImage = async (request: NextRequest) => {
  try {
    const mediaStorage = getMediaStorage();
    const formData = await request.formData();
    const image = formData.get("image");
    if (!(image instanceof File)) {
      throw new Error("Image file is required");
    }
    const url = await mediaStorage.storeUploadedImage({
      buffer: Buffer.from(await image.arrayBuffer()),
      mimetype: image.type,
      originalname: image.name
    });
    return json({ url }, 201);
  } catch (error) {
    return fail(error);
  }
};

export const listTokens = async (request: NextRequest) => {
  try {
    const filter = request.nextUrl.searchParams.get("filter") || "trending";
    const rows = await listIndexedTokens(filter);
    return json(rows.map(mapTokenRow));
  } catch (error) {
    return fail(error);
  }
};

export const createToken = async (request: NextRequest) => {
  try {
    const body = await request.json();
    return json(await createTokenRequest(body), 201);
  } catch (error) {
    return fail(error);
  }
};

export const getToken = async (id: string) => {
  try {
    const row = await getIndexedToken(id);
    if (!row) return fail(new Error("Token not found"), 404);
    const token = mapTokenRow(row);
    return json({ token, shareUrl: `${apiEnv.telegramWebAppUrl.replace(/\/$/, "")}/token/${id}` });
  } catch (error) {
    return fail(error, 404);
  }
};

export const getTrades = async (id: string) => {
  try {
    const rows = await getTradesByPool(id);
    return json(rows.map((row, idx) => ({
      id: row.tx_hash || `${id}-${idx}`,
      side: "BUY",
      wallet: row.buyer,
      tokenAmount: Number(row.token_amount),
      tonAmountGross: Number(row.ton_amount),
      tonAmountNet: Number(row.ton_amount),
      spotPriceTon: 0,
      slippageBps: 0,
      txHash: row.tx_hash,
      lt: row.lt || undefined,
      createdAt: row.created_at
    })));
  } catch (error) {
    return fail(error, 404);
  }
};

export const buyToken = async (_id: string, _request: NextRequest) =>
  json({ ok: true, pending: true, message: "On-chain buy submitted. Wait for indexer confirmation." });

export const sellToken = async () =>
  fail(new Error("Sell will be available after bonding/listing through DeDust."), 409);

export const resolveReferral = async (_request: NextRequest) =>
  json({ code: null, valid: false, wallet: null, fallbackToTreasury: true });

export const claimFunds = async () => fail(new Error("Claims are not enabled in MVP yet"), 409);

export const getUser = async (wallet: string) => {
  try {
    return json(await getUserSummary(wallet));
  } catch (error) {
    return fail(error);
  }
};

export const dispatchApiPath = async (parts: string[], request: NextRequest, method: string) => {
  const [resource, id, action] = parts;

  if (resource === "health" && method === "GET") return getHealth();
  if (resource === "uploads" && method === "POST") return uploadImage(request);
  if (resource === "tokens" && !id && method === "GET") return listTokens(request);
  if (resource === "tokens" && !id && method === "POST") return createToken(request);
  if (resource === "tokens" && id && !action && method === "GET") return getToken(id);
  if (resource === "tokens" && id && action === "trades" && method === "GET") return getTrades(id);
  if (resource === "tokens" && id && action === "buy" && method === "POST") return buyToken(id, request);
  if (resource === "tokens" && id && action === "sell" && method === "POST") return sellToken();
  if (resource === "referral" && id === "resolve" && method === "POST") return resolveReferral(request);
  if (resource === "claim" && method === "POST") return claimFunds();
  if (resource === "user" && id && method === "GET") return getUser(id);

  return fail(new Error("Route not found"), 404);
};
