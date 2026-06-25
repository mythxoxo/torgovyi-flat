import { evaluateTokenRisk } from "../risk/evaluate-token-risk";
import type { ExternalTokenRecord } from "./types";

type Pool = Record<string, unknown>;
type Asset = Record<string, unknown>;

const DEDUST_API_URL = process.env.DEDUST_API_URL || "https://api.dedust.io";
const TON_SYMBOLS = new Set(["TON", "WTON", "GRAM"]);

const get = (source: unknown, path: string[]) => {
  let current: unknown = source;
  for (const key of path) {
    if (!current || typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[key];
  }
  return current;
};

const str = (value: unknown, fallback = "") => {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return fallback;
};

const num = (value: unknown, fallback = 0) => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "bigint") return Number(value);
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value.replace(/,/g, ""));
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
};

const normalizeMetric = (value: unknown, fallback = 0) => {
  let parsed = num(value, fallback);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  for (let i = 0; i < 4 && parsed > 1_000_000_000_000; i += 1) parsed /= 1_000_000_000;
  return parsed > 0 && parsed <= 1_000_000_000_000 ? parsed : fallback;
};

const first = (values: unknown[], fallback = "") => {
  for (const value of values) {
    const normalized = str(value);
    if (normalized) return normalized;
  }
  return fallback;
};

const firstMetric = (values: unknown[], fallback = 0) => {
  for (const value of values) {
    const normalized = normalizeMetric(value, 0);
    if (normalized > 0) return normalized;
  }
  return fallback;
};

const assetsOf = (pool: Pool): Asset[] => {
  const assets = pool.assets || pool.tokens || pool.reservesAssets || get(pool, ["meta", "assets"]);
  return Array.isArray(assets) ? assets.filter((item): item is Asset => Boolean(item && typeof item === "object")) : [];
};

const reservesOf = (pool: Pool): unknown[] => {
  const reserves = pool.reserves || pool.balances || pool.amounts || get(pool, ["stats", "reserves"]);
  return Array.isArray(reserves) ? reserves : [];
};

const isNativeAsset = (asset: Asset) => {
  const type = first([asset.type, asset.kind, get(asset, ["asset", "type"])]).toLowerCase();
  const symbol = first([asset.symbol, get(asset, ["metadata", "symbol"]), get(asset, ["meta", "symbol"])]).toUpperCase();
  return type === "native" || type === "ton" || TON_SYMBOLS.has(symbol);
};

const assetIndex = (pool: Pool, asset: Asset | null) => {
  if (!asset) return -1;
  return assetsOf(pool).findIndex((item) => item === asset);
};

const reserveAt = (pool: Pool, index: number) => index >= 0 ? reservesOf(pool)[index] : undefined;

const tokenAssetFromPool = (pool: Pool): Asset | null => assetsOf(pool).find((asset) => !isNativeAsset(asset)) || null;
const nativeAssetFromPool = (pool: Pool): Asset | null => assetsOf(pool).find((asset) => isNativeAsset(asset)) || null;

const assetAddress = (asset: Asset) => first([asset.address, asset.contractAddress, asset.jettonAddress, asset.rootAddress, get(asset, ["asset", "address"]), get(asset, ["metadata", "address"]), get(asset, ["meta", "address"])]);
const poolAddress = (pool: Pool) => first([pool.address, pool.poolAddress, pool.contractAddress, get(pool, ["pool", "address"])]);

const tokenFromPool = (pool: Pool): ExternalTokenRecord | null => {
  const asset = tokenAssetFromPool(pool);
  if (!asset) return null;

  const address = assetAddress(asset);
  const symbol = first([asset.symbol, get(asset, ["metadata", "symbol"]), get(asset, ["meta", "symbol"])]);
  if (!address || !symbol) return null;

  const native = nativeAssetFromPool(pool);
  const tokenDecimals = num(asset.decimals ?? get(asset, ["metadata", "decimals"]), 9);
  const tokenReserve = firstMetric([asset.reserve, asset.balance, asset.amount, reserveAt(pool, assetIndex(pool, asset)), get(asset, ["stats", "reserve"])], 0);
  const nativeReserve = firstMetric([native?.reserve, native?.balance, native?.amount, reserveAt(pool, assetIndex(pool, native)), pool.nativeReserve, pool.tonReserve, pool.reserve0, pool.reserve1, get(native, ["stats", "reserve"])], 0);
  const priceGram = tokenReserve > 0 && nativeReserve > 0 ? nativeReserve / tokenReserve : firstMetric([get(pool, ["price", "ton"]), pool.priceTon, pool.priceGram], 0) || undefined;
  const liquidityFromApi = firstMetric([pool.liquidity, pool.tvl, pool.totalLiquidity, get(pool, ["stats", "liquidity"]), get(pool, ["stats", "tvl"])], 0);
  const liquidityGram = liquidityFromApi > 0 ? liquidityFromApi : nativeReserve > 0 ? nativeReserve * 2 : undefined;

  const record: ExternalTokenRecord = {
    source: "EXTERNAL",
    address,
    name: first([asset.name, get(asset, ["metadata", "name"]), get(asset, ["meta", "name"])], symbol),
    symbol,
    image: first([asset.image, asset.imageUrl, get(asset, ["metadata", "image"]), get(asset, ["meta", "image"])]),
    decimals: tokenDecimals,
    priceGram,
    priceUsd: firstMetric([get(pool, ["price", "usd"]), pool.priceUsd], 0) || undefined,
    change24h: num(pool.priceChange24h ?? pool.change24h ?? get(pool, ["stats", "priceChange24h"]), 0),
    volume24hGram: firstMetric([pool.volume24h, pool.volume, get(pool, ["stats", "volume24h"])], 0),
    liquidityGram,
    holders: num(asset.holders ?? get(asset, ["stats", "holders"]), 0) || undefined,
    dexes: ["DEDUST"],
    primaryDex: "DEDUST",
    poolAddress: poolAddress(pool) || undefined,
    verified: Boolean(asset.verified ?? pool.verified),
    riskLevel: "UNKNOWN",
    warnings: [],
    updatedAt: new Date().toISOString()
  };

  const risk = evaluateTokenRisk(record);
  return { ...record, riskLevel: risk.riskLevel, warnings: risk.warnings };
};

export async function listLiveDedustExternalTokens(limit = 80): Promise<ExternalTokenRecord[]> {
  const response = await fetch(`${DEDUST_API_URL.replace(/\/$/, "")}/v2/pools`, { cache: "no-store" });
  if (!response.ok) throw new Error(`DeDust pools API failed with ${response.status}`);
  const data: unknown = await response.json();
  const pools: unknown[] = Array.isArray(data)
    ? data
    : data && typeof data === "object" && Array.isArray((data as { pools?: unknown[] }).pools)
      ? (data as { pools: unknown[] }).pools
      : data && typeof data === "object" && Array.isArray((data as { data?: unknown[] }).data)
        ? (data as { data: unknown[] }).data
        : [];

  return pools
    .map((pool: unknown) => tokenFromPool(pool as Pool))
    .filter((token): token is ExternalTokenRecord => Boolean(token))
    .sort((a: ExternalTokenRecord, b: ExternalTokenRecord) => (b.liquidityGram ?? 0) - (a.liquidityGram ?? 0))
    .slice(0, limit);
}
