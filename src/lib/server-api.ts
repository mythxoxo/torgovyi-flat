import { Address, beginCell, toNano } from "@ton/core";
import { NextResponse, type NextRequest } from "next/server";
import { createMediaStorage } from "./server/media";
import { listIndexedTokens, getIndexedToken, getTradesByPool } from "./server/indexer-store";
import { createToken as createTokenRequest, getUserSummary } from "./server/service-v2";
import { getLiveProof } from "./server/live-proof";
import { findReferralBindingByCode, findReferralBindingByWallet, getReferralAccounting, upsertClaimRequest, upsertReferralBinding } from "./server/referral-store";
import type { TokenRow } from "./shared";

const optionalString = (value: string | undefined, fallback = ""): string => value?.trim() || fallback;

const apiEnv = {
  publicUrl: optionalString(process.env.API_PUBLIC_URL, process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"),
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
const fail = (error: unknown, status = 400) => json({ error: error instanceof Error ? error.message : "Unknown error" }, status);

const MAX_IMAGE_BYTES = 2_000_000;
const ALLOWED_IMAGE_MIME = new Set(["image/png", "image/jpeg", "image/webp"]);
const REFERRAL_CODE_RE = /^[A-Za-z0-9_-]{3,64}$/;
const TX_HASH_RE = /^[A-Za-z0-9_:-]{8,160}$/;

const parseTonAddress = (value: unknown, field: string): string => {
  if (typeof value !== "string" || !value.trim()) throw new Error(`${field} is required`);
  try {
    return Address.parse(value.trim()).toString({ bounceable: true, testOnly: false });
  } catch {
    throw new Error(`${field} must be a valid TON address`);
  }
};

const optionalTxHash = (value: unknown): string | undefined => {
  if (value == null || value === "") return undefined;
  if (typeof value !== "string") throw new Error("txHash must be a string");
  const txHash = value.trim();
  if (!TX_HASH_RE.test(txHash)) throw new Error("txHash format is invalid");
  return txHash;
};

const parsePositiveNumber = (value: unknown, field: string, max = Number.MAX_SAFE_INTEGER): number => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0 || numeric > max) throw new Error(`${field} must be a positive number`);
  return numeric;
};

const sanitizeFilename = (name: string) => name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120) || "upload.bin";

const encodeCommentPayload = (comment: string) => beginCell().storeUint(0, 32).storeStringTail(comment).endCell().toBoc().toString("base64");
const encodeJettonTransferPayload = (amount: bigint, destination: string, responseDestination: string) => beginCell()
  .storeUint(0xf8a7ea5, 32)
  .storeUint(0, 64)
  .storeCoins(amount)
  .storeAddress(Address.parse(destination))
  .storeAddress(Address.parse(responseDestination))
  .storeBit(0)
  .storeCoins(1n)
  .storeBit(0)
  .endCell()
  .toBoc()
  .toString("base64");

const mapTokenRow = (row: TokenRow) => ({
  id: row.pool_address,
  name: row.name,
  ticker: row.symbol,
  image: row.image_url || "/brand/img_04.jpg",
  description: row.description || "",
  creatorWallet: row.creator,
  links: {},
  status: row.is_listed ? "LISTED" : row.status === "GRADUATED_READY" ? "GRADUATED_READY" : row.status === "PENDING" ? "PENDING" : "BONDING",
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
  feeVault: { treasuryTon: 0, creatorClaimables: {}, referralClaimables: {}, creatorClaimedTon: {}, referralClaimedTon: {}, creatorTaxBuybackTon: 0, creatorTaxBurnedTon: 0 },
  platformVesting: { totalAllocation: 0, immediateUnlockAmount: 0, linearUnlockAmount: 0, claimedAmount: 0 },
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
  contractAddresses: { factory: process.env.NEXT_PUBLIC_FACTORY_ADDRESS || "", jettonMaster: row.jetton_address, bondingCurve: row.pool_address, lpLock: row.lp_lock_address || undefined }
});

export const getHealth = () => json({ ok: true, service: "launchpad-api", storage: process.env.DATABASE_URL ? "postgres" : "runtime", timestamp: new Date().toISOString() });

export const uploadImage = async (request: NextRequest) => {
  try {
    const mediaStorage = getMediaStorage();
    const formData = await request.formData();
    const image = formData.get("image");
    if (!(image instanceof File)) throw new Error("Image file is required");
    if (image.size <= 0) throw new Error("Image file is empty");
    if (image.size > MAX_IMAGE_BYTES) throw new Error("Image must be smaller than 2 MB");
    if (!ALLOWED_IMAGE_MIME.has(image.type)) throw new Error("Only PNG, JPEG, or WEBP images are allowed");
    const url = await mediaStorage.storeUploadedImage({
      buffer: Buffer.from(await image.arrayBuffer()),
      mimetype: image.type,
      originalname: sanitizeFilename(image.name)
    });
    return json({ url }, 201);
  } catch (error) { return fail(error); }
};

export const listTokens = async (request: NextRequest) => {
  try { return json((await listIndexedTokens(request.nextUrl.searchParams.get("filter") || "trending")).map(mapTokenRow)); }
  catch (error) { return fail(error); }
};

export const createToken = async (request: NextRequest) => {
  try { return json(await createTokenRequest(await request.json().catch(() => ({}))), 201); }
  catch (error) { return fail(error); }
};

export const getToken = async (id: string) => {
  try {
    const row = await getIndexedToken(id);
    if (!row) return fail(new Error("Token not found"), 404);
    return json({ token: mapTokenRow(row), shareUrl: `${apiEnv.telegramWebAppUrl.replace(/\/$/, "")}/token/${id}` });
  } catch (error) { return fail(error, 404); }
};

export const getTrades = async (id: string) => {
  try {
    const rows = await getTradesByPool(id);
    return json(rows.map((row, idx) => ({
      id: row.tx_hash || `${id}-${idx}`,
      side: ((row as typeof row & { kind?: string }).kind === "sell" ? "SELL" : "BUY"),
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
  } catch (error) { return fail(error, 404); }
};

export const buyToken = async (id: string, request: NextRequest) => {
  try {
    const body = await request.json().catch(() => ({} as Record<string, unknown>));
    const wallet = parseTonAddress(body.wallet, "wallet");
    const txHash = optionalTxHash(body.txHash);
    const live = await getLiveProof();
    return json({ ok: true, pending: true, tokenId: id, stage: "wallet-submitted", liveBuyProven: live.summary.liveBuyProven, wallet, txHash, message: "Wallet transaction submitted. On-chain buy path is live; UI state updates after indexer confirmation." });
  } catch (error) { return fail(error); }
};

export const sellToken = async (id: string, request: NextRequest) => {
  try {
    const body = await request.json().catch(() => ({} as Record<string, unknown>));
    const wallet = parseTonAddress(body.wallet, "wallet");
    const jettonWalletAddress = typeof body.jettonWalletAddress === "string" && body.jettonWalletAddress.trim() ? parseTonAddress(body.jettonWalletAddress, "jettonWalletAddress") : "";
    const tokenAmount = parsePositiveNumber(body.tokenAmount, "tokenAmount", 1e18);
    const txHash = optionalTxHash(body.txHash);
    const row = await getIndexedToken(id);
    if (!row) return fail(new Error("token not found"), 404);
    if (!row.pool_address || row.pool_address.startsWith("pending:")) return fail(new Error("pool not found"), 409);
    if (!row.jetton_address) return fail(new Error("jetton master not found"), 409);

    const live = await getLiveProof();
    const tokenAmountUnits = BigInt(Math.floor(tokenAmount));
    const draft = jettonWalletAddress ? {
      to: jettonWalletAddress,
      amount: toNano("0.05").toString(),
      payload: encodeJettonTransferPayload(tokenAmountUnits, row.pool_address, wallet),
      note: "User signs this jetton-wallet transfer. Post-exec verification must confirm pool accounting and buyer balance changes."
    } : null;

    return json({
      ok: true,
      tokenId: id,
      stage: txHash ? "verification_pending" : (draft ? "payload_ready" : "wallet_resolution_required"),
      verificationRequired: true,
      manualSignRequired: !txHash,
      liveBuyProven: live.summary.liveBuyProven,
      txHash,
      route: { poolAddress: row.pool_address, jettonMaster: row.jetton_address, wallet, jettonWalletAddress: jettonWalletAddress || undefined, tokenAmount },
      draft,
      message: txHash
        ? "Sell transaction submitted by user. Verify pool/accounting changes after chain confirmation."
        : draft
          ? "Sell payload is ready for wallet signature. Verify on-chain after execution."
          : "Resolve the user's jetton wallet address first, then request sell payload again with jettonWalletAddress."
    });
  } catch (error) { return fail(error); }
};

export const resolveReferral = async (request: NextRequest) => {
  try {
    const body = await request.json().catch(() => ({} as Record<string, unknown>));
    const wallet = parseTonAddress(body.wallet, "wallet");
    const code = typeof body.code === "string" ? body.code.trim() : "";
    if (!REFERRAL_CODE_RE.test(code)) return json({ code: null, valid: false, wallet: null, fallbackToTreasury: false, reason: "referral code format is invalid" }, 400);
    const existing = await findReferralBindingByWallet(wallet);
    if (existing) return json({ code: existing.code, valid: true, wallet: existing.referredByWallet, fallbackToTreasury: false, reason: "already bound" });
    const target = await findReferralBindingByCode(code);
    if (!target) return json({ code, valid: false, wallet: null, fallbackToTreasury: false, reason: "referral code not found" }, 404);
    const targetWallet = parseTonAddress(target.wallet, "target.wallet");
    const referredByWallet = parseTonAddress(target.referredByWallet, "target.referredByWallet");
    if (referredByWallet === wallet || targetWallet === wallet) return json({ code, valid: false, wallet: null, fallbackToTreasury: false, reason: "self-referral blocked" }, 409);
    await upsertReferralBinding({ wallet, code: `bound:${wallet}`, referredByWallet, createdAt: new Date().toISOString() });
    return json({ code, valid: true, wallet: referredByWallet, fallbackToTreasury: false });
  } catch (error) { return fail(error); }
};

export const claimFunds = async (request: NextRequest) => {
  try {
    const body = await request.json().catch(() => ({} as Record<string, unknown>));
    const wallet = parseTonAddress(body.wallet, "wallet");
    const type = body.type as "creator" | "referral" | "refund" | undefined;
    const tokenId = typeof body.tokenId === "string" && body.tokenId.length <= 160 ? body.tokenId : undefined;
    const txHash = optionalTxHash(body.txHash);
    if (!type) return fail(new Error("claim type is required"), 400);
    const accounting = await getReferralAccounting(wallet);
    const claimableTon = type === "referral" ? accounting?.claimableTon ?? 0 : 0;
    if (claimableTon <= 0) return json({ wallet, type, claimedTon: 0, tokenId, user: await getUserSummary(wallet), status: "not_eligible", manualSignRequired: false, verificationRequired: false, message: "No claimable balance available." }, 409);
    const now = new Date().toISOString();
    const treasuryRaw = process.env.REFERRAL_TREASURY_ADDRESS?.trim() || "";

    if (txHash) {
      await upsertClaimRequest({ wallet, type, tokenId, amountTon: claimableTon, txHash, status: "verification_pending", createdAt: now, updatedAt: now, reason: "user submitted claim tx" });
      return json({ wallet, type, claimedTon: 0, tokenId, txHash, user: await getUserSummary(wallet), status: "verification_pending", manualSignRequired: false, verificationRequired: true, message: "Claim transaction submitted by user. Final payout verification is pending." });
    }

    if (!treasuryRaw) {
      await upsertClaimRequest({ wallet, type, tokenId, amountTon: claimableTon, status: "treasury_unavailable", createdAt: now, updatedAt: now, reason: "REFERRAL_TREASURY_ADDRESS is not configured" });
      return json({ wallet, type, claimedTon: 0, tokenId, user: await getUserSummary(wallet), status: "treasury_unavailable", manualSignRequired: false, verificationRequired: false, message: "Referral treasury is not configured; payout payload cannot be prepared." }, 409);
    }

    const treasury = parseTonAddress(treasuryRaw, "REFERRAL_TREASURY_ADDRESS");
    const draft = { from: treasury, to: wallet, amount: toNano(String(claimableTon)).toString(), payload: encodeCommentPayload(`Referral claim payout ${wallet}`) };
    await upsertClaimRequest({ wallet, type, tokenId, amountTon: claimableTon, status: "payload_ready", createdAt: now, updatedAt: now, reason: "claim payout payload prepared" });
    return json({ wallet, type, claimedTon: 0, tokenId, user: await getUserSummary(wallet), status: "payload_ready", manualSignRequired: true, verificationRequired: true, draft, message: "Claim payout payload is ready for treasury wallet signature. Submit txHash after execution." });
  } catch (error) { return fail(error); }
};

export const getUser = async (wallet: string) => {
  try { return json(await getUserSummary(wallet)); }
  catch (error) { return fail(error); }
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
  if (resource === "tokens" && id && action === "sell" && method === "POST") return sellToken(id, request);
  if (resource === "referral" && id === "resolve" && method === "POST") return resolveReferral(request);
  if (resource === "claim" && method === "POST") return claimFunds(request);
  if (resource === "user" && id && method === "GET") return getUser(id);
  return fail(new Error("Route not found"), 404);
};
