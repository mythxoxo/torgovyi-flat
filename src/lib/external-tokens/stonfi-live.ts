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

const num = (value: unknown) => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value.replace(/,/g, ""));
    if (Number.isFinite(parsed)) return parsed;
  }
  return undefined;
};

const first = (values: unknown[], fallback = "") => {
  for (const value of values) {
    const normalized = str(value);
    if (normalized) return normalized;
  }
  return fallback;
};

const firstNumber = (values: unknown[]) => {
  for (const value of values) {
    const normalized = num(value);
    if (normalized != null && normalized > 0) return normalized;
  }
  return undefined;
};

const toExternalToken = (asset: Asset): ExternalTokenRecord | null => {
  const address = first([asset.contractAddress, asset.address, get(asset, ["meta", "contractAddress"]), get(asset, ["meta", "address"])]);
  const symbol = first([asset.symbol, get(asset, ["meta", "symbol"])], "UNKNOWN");
  if (!address || !symbol || symbol === "UNKNOWN") return null;

  const record: ExternalTokenRecord = {
    source: "EXTERNAL",
    address,
    name: first([asset.displayName, asset.name, get(asset, ["meta", "displayName"]), get(asset, ["meta", "name"])], symbol),
    symbol,
    image: first([asset.imageUrl, asset.image, get(asset, ["meta", "imageUrl"]), get(asset, ["meta", "image"])]),
    decimals: firstNumber([asset.decimals, get(asset, ["meta", "decimals"])]) ?? 9,
    priceGram: firstNumber([asset.priceTon, get(asset, ["market", "priceTon"])]),
    priceUsd: firstNumber([asset.priceUsd, get(asset, ["market", "priceUsd"])]),
    change24h: firstNumber([asset.priceChange24h, asset.change24h, get(asset, ["market", "change24h"])]),
    volume24hGram: firstNumber([asset.volume24hTon, get(asset, ["stats", "volume24hTon"]), get(asset, ["market", "volume24hTon"])]),
    liquidityGram: firstNumber([asset.liquidityTon, get(asset, ["stats", "liquidityTon"]), get(asset, ["market", "liquidityTon"])]),
    holders: firstNumber([asset.holders, get(asset, ["stats", "holders"])]),
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
