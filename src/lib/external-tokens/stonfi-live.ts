import { evaluateTokenRisk } from "../risk/evaluate-token-risk";
import type { ExternalTokenRecord } from "./types";

type ApiModule = Record<string, unknown>;
type Asset = Record<string, unknown>;

const get = (source: unknown, path: string[]) => {
  let current: unknown = source;
  for (const key of path) {
    if (!current || typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[key];
  }
  return current;
};

const str = (value: unknown, fallback = "") => {
  if (typeof value === "string" && value.length > 0) return value;
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return fallback;
};

const num = (value: unknown, fallback = 0) => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value.replace(/,/g, ""));
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
};

const safeMarketMetric = (values: unknown[], fallback = 0) => {
  for (const value of values) {
    let parsed = num(value, Number.NaN);
    if (!Number.isFinite(parsed) || parsed <= 0) continue;
    for (let i = 0; i < 4 && parsed > 1_000_000_000_000; i += 1) parsed = parsed / 1_000_000_000;
    if (parsed > 0 && parsed <= 1_000_000_000_000) return parsed;
  }
  return fallback;
};

const first = (values: unknown[], fallback = "") => {
  for (const value of values) {
    const normalized = str(value);
    if (normalized) return normalized;
  }
  return fallback;
};

const toExternalToken = (asset: Asset): ExternalTokenRecord | null => {
  const address = first([asset.contractAddress, asset.address, get(asset, ["meta", "contractAddress"]), get(asset, ["meta", "address"])]);
  const symbol = first([asset.symbol, get(asset, ["meta", "symbol"])], "UNKNOWN");
  if (!address || !symbol || symbol === "UNKNOWN") return null;

  const popularity = num(asset.popularityIndex, 0);
  const liquidity = safeMarketMetric([
    asset.liquidityGram,
    asset.liquidityTon,
    asset.liquidityUsd,
    asset.tvl,
    asset.tvlTon,
    asset.tvlUsd,
    get(asset, ["stats", "liquidityGram"]),
    get(asset, ["stats", "liquidityTon"]),
    get(asset, ["stats", "liquidityUsd"]),
    get(asset, ["market", "liquidityGram"]),
    get(asset, ["market", "liquidityUsd"])
  ], popularity);

  const record: ExternalTokenRecord = {
    source: "EXTERNAL",
    address,
    name: first([asset.displayName, asset.name, get(asset, ["meta", "displayName"]), get(asset, ["meta", "name"])], symbol),
    symbol,
    image: first([asset.imageUrl, asset.image, get(asset, ["meta", "imageUrl"]), get(asset, ["meta", "image"])]),
    decimals: num(asset.decimals ?? get(asset, ["meta", "decimals"]), 9),
    priceGram: safeMarketMetric([asset.dexPrice, asset.priceGram, asset.priceTon, get(asset, ["market", "priceGram"]), get(asset, ["market", "priceTon"])]) || undefined,
    priceUsd: safeMarketMetric([asset.dexPriceUsd, asset.priceUsd, get(asset, ["market", "priceUsd"])]) || undefined,
    change24h: num(asset.priceChange24h ?? asset.change24h ?? get(asset, ["market", "change24h"]), 0),
    volume24hGram: safeMarketMetric([asset.volume24hGram, asset.volume24hTon, asset.volume24h, asset.volume24hUsd, get(asset, ["stats", "volume24h"]), get(asset, ["market", "volume24h"])], popularity),
    liquidityGram: liquidity || undefined,
    holders: num(asset.holders ?? get(asset, ["stats", "holders"]), 0) || undefined,
    dexes: ["STONFI"],
    primaryDex: "STONFI",
    verified: Boolean(asset.verified ?? asset.tags),
    riskLevel: "UNKNOWN",
    warnings: [],
    updatedAt: new Date().toISOString()
  };

  const risk = evaluateTokenRisk(record);
  return { ...record, riskLevel: risk.riskLevel, warnings: risk.warnings };
};

export async function listLiveStonfiExternalTokens(limit = 40): Promise<ExternalTokenRecord[]> {
  const api = (await import("@ston-fi/api")) as ApiModule;
  const StonApiClient = api.StonApiClient as (new (args?: Record<string, unknown>) => { queryAssets?: (args?: Record<string, unknown>) => Promise<unknown[]> }) | undefined;
  const AssetTag = api.AssetTag as Record<string, string> | undefined;

  if (!StonApiClient || !AssetTag) throw new Error("STON.fi asset API is unavailable");

  const client = new StonApiClient({ baseURL: process.env.STON_API_URL ?? "https://api.ston.fi" });
  if (typeof client.queryAssets !== "function") throw new Error("STON.fi queryAssets is unavailable");

  const condition = [AssetTag.LiquidityVeryHigh, AssetTag.LiquidityHigh, AssetTag.LiquidityMedium, AssetTag.LiquidityLow].filter(Boolean).join(" | ");
  let assets = await client.queryAssets({ condition });
  if (!Array.isArray(assets) || assets.length === 0) assets = await client.queryAssets({});

  return assets
    .map((asset) => toExternalToken(asset as Asset))
    .filter((token): token is ExternalTokenRecord => Boolean(token))
    .sort((a, b) => (b.volume24hGram ?? b.liquidityGram ?? 0) - (a.volume24hGram ?? a.liquidityGram ?? 0))
    .slice(0, limit);
}
