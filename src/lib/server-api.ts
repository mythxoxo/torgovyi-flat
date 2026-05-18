import { NextResponse, type NextRequest } from "next/server";

import { createMediaStorage } from "./server/media";
import { createSnapshotRepository } from "./server/repository";
import { LaunchpadService } from "./server/service";

// Inline replacements for @meme-launchpad/config
const optionalString = (value: string | undefined, fallback = ""): string =>
  value?.trim() || fallback;

const numberFromEnv = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const booleanFromEnv = (value: string | undefined, fallback: boolean): boolean => {
  if (value === "true") return true;
  if (value === "false") return false;
  return fallback;
};

const apiEnv = {
  publicUrl: optionalString(
    process.env.API_PUBLIC_URL,
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"
  ),
  dataFile: optionalString(process.env.DATA_FILE, "data/launchpad-local.json"),
  databaseUrl: optionalString(process.env.DATABASE_URL),
  telegramWebAppUrl: optionalString(process.env.TELEGRAM_WEBAPP_URL, "http://localhost:3000"),
  allowDevWallet: booleanFromEnv(process.env.ALLOW_DEV_WALLET, false),
  uploadStorage: optionalString(process.env.UPLOAD_STORAGE, "local"),
  s3Bucket: optionalString(process.env.S3_BUCKET),
  s3Region: optionalString(process.env.S3_REGION),
  s3AccessKey: optionalString(process.env.S3_ACCESS_KEY),
  s3SecretKey: optionalString(process.env.S3_SECRET_KEY),
  s3PublicBaseUrl: optionalString(process.env.S3_PUBLIC_BASE_URL)
};

// Singletons — initialized once per serverless cold start
let _repository: ReturnType<typeof createSnapshotRepository> | undefined;
let _mediaStorage: ReturnType<typeof createMediaStorage> | undefined;
let _service: LaunchpadService | undefined;

const getService = () => {
  if (!_service) {
    _repository = createSnapshotRepository(apiEnv.databaseUrl, apiEnv.dataFile);
    _mediaStorage = createMediaStorage({
      mode: apiEnv.uploadStorage,
      publicBaseUrl: apiEnv.publicUrl,
      s3Bucket: apiEnv.s3Bucket,
      s3Region: apiEnv.s3Region,
      s3AccessKey: apiEnv.s3AccessKey,
      s3SecretKey: apiEnv.s3SecretKey,
      s3PublicBaseUrl: apiEnv.s3PublicBaseUrl
    });
    _service = new LaunchpadService(_repository, apiEnv.telegramWebAppUrl, _mediaStorage);
  }
  return { service: _service, mediaStorage: _mediaStorage! };
};

const json = (body: unknown, status = 200) => NextResponse.json(body, { status });

const fail = (error: unknown, status = 400) =>
  json({ error: error instanceof Error ? error.message : "Unknown error" }, status);

const readJson = async <T>(request: NextRequest): Promise<T> => {
  try {
    return (await request.json()) as T;
  } catch {
    return {} as T;
  }
};

export const getHealth = () =>
  json({
    ok: true,
    service: "launchpad-api",
    storage: apiEnv.databaseUrl ? "postgres" : "file",
    uploadStorage: apiEnv.uploadStorage,
    timestamp: new Date().toISOString()
  });

export const uploadImage = async (request: NextRequest) => {
  try {
    const { mediaStorage } = getService();
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
    const { service } = getService();
    const filter = request.nextUrl.searchParams.get("filter") || "trending";
    return json(
      await service.listTokens(
        filter as "trending" | "new" | "almost-graduated" | "graduated" | "top-volume"
      )
    );
  } catch (error) {
    return fail(error);
  }
};

export const createToken = async (request: NextRequest) => {
  try {
    const { service } = getService();
    return json(await service.createToken(await readJson(request)), 201);
  } catch (error) {
    return fail(error);
  }
};

export const getToken = async (id: string) => {
  try {
    const { service } = getService();
    const token = await service.getToken(id);
    return json({
      token,
      shareUrl: service.buildShareUrl(token),
      referralHint: "Pass referral code on buy/sell to route 0.15% to the referrer."
    });
  } catch (error) {
    return fail(error, 404);
  }
};

export const getTrades = async (id: string) => {
  try {
    const { service } = getService();
    return json(await service.getTrades(id));
  } catch (error) {
    return fail(error, 404);
  }
};

export const getComments = async (id: string) => {
  try {
    const { service } = getService();
    return json(await service.getComments(id));
  } catch (error) {
    return fail(error, 404);
  }
};

export const buyToken = async (id: string, request: NextRequest) => {
  try {
    const { service } = getService();
    const body = await readJson<{
      wallet: string;
      tonAmount: number;
      referralCode?: string;
      slippageBps?: number;
    }>(request);
    return json(
      await service.buyToken({
        tokenId: id,
        wallet: body.wallet,
        tonAmount: Number(body.tonAmount),
        referralCode: body.referralCode,
        slippageBps: Number(body.slippageBps ?? 500)
      })
    );
  } catch (error) {
    return fail(error);
  }
};

export const sellToken = async (id: string, request: NextRequest) => {
  try {
    const { service } = getService();
    const body = await readJson<{
      wallet: string;
      tokenAmount: number;
      referralCode?: string;
      slippageBps?: number;
    }>(request);
    return json(
      await service.sellToken({
        tokenId: id,
        wallet: body.wallet,
        tokenAmount: Number(body.tokenAmount),
        referralCode: body.referralCode,
        slippageBps: Number(body.slippageBps ?? 500)
      })
    );
  } catch (error) {
    return fail(error);
  }
};

export const resolveReferral = async (request: NextRequest) => {
  try {
    const { service } = getService();
    const body = await readJson<{ code?: string; wallet: string }>(request);
    return json(await service.resolveReferral(body.code, body.wallet));
  } catch (error) {
    return fail(error);
  }
};

export const claimFunds = async (request: NextRequest) => {
  try {
    const { service } = getService();
    const body = await readJson<{
      wallet: string;
      type: "creator" | "referral" | "refund";
      tokenId?: string;
    }>(request);

    if (body.type === "creator") {
      return json(await service.claimCreator(body.wallet));
    }
    if (body.type === "referral") {
      return json(await service.claimReferral(body.wallet));
    }
    if (body.type === "refund") {
      if (!body.tokenId) throw new Error("tokenId is required for refund claims");
      return json(await service.claimRefund(body.wallet, body.tokenId));
    }

    throw new Error("Unsupported claim type");
  } catch (error) {
    return fail(error);
  }
};

export const getUser = async (wallet: string) => {
  try {
    const { service } = getService();
    return json(await service.getUser(wallet));
  } catch (error) {
    return fail(error);
  }
};

export const dispatchApiPath = async (
  parts: string[],
  request: NextRequest,
  method: string
) => {
  const [resource, id, action] = parts;

  if (resource === "health" && method === "GET") return getHealth();
  if (resource === "uploads" && method === "POST") return uploadImage(request);
  if (resource === "tokens" && !id && method === "GET") return listTokens(request);
  if (resource === "tokens" && !id && method === "POST") return createToken(request);
  if (resource === "tokens" && id && !action && method === "GET") return getToken(id);
  if (resource === "tokens" && id && action === "trades" && method === "GET") return getTrades(id);
  if (resource === "tokens" && id && action === "comments" && method === "GET") return getComments(id);
  if (resource === "tokens" && id && action === "buy" && method === "POST") return buyToken(id, request);
  if (resource === "tokens" && id && action === "sell" && method === "POST") return sellToken(id, request);
  if (resource === "referral" && id === "resolve" && method === "POST") return resolveReferral(request);
  if (resource === "claim" && method === "POST") return claimFunds(request);
  if (resource === "user" && id && method === "GET") return getUser(id);

  return fail(new Error("Route not found"), 404);
};
