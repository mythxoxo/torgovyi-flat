import type { ExternalTokenRecord } from "./types";

type AnyRecord = Record<string, unknown>;

type MarketMetrics = Pick<ExternalTokenRecord, "priceGram" | "priceUsd" | "change24h" | "volume24hUsd" | "liquidityUsd">;

const DEXSCREENER_BASE_URL = process.env.DEXSCREENER_API_URL || "https://api.dexscreener.com";

const num = (value: unknown) => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value.replace(/,/g, ""));
    if (Number.isFinite(parsed)) return parsed;
  }
  return undefined;
};

const obj = (value: unknown): AnyRecord => value && typeof value === "object" ? value as AnyRecord : {};
const lower = (value: unknown) => typeof value === "string" ? value.toLowerCase() : "";

function pairScore(pair: AnyRecord) {
  const chainScore = lower(pair.chainId).includes("ton") ? 1_000_000_000 : 0;
  const liquidityUsd = num(obj(pair.liquidity).usd) ?? 0;
  const volume24hUsd = num(obj(pair.volume).h24) ?? 0;
  return chainScore + liquidityUsd + volume24hUsd;
}

function metricsFromPairs(pairs: AnyRecord[]): MarketMetrics | null {
  const best = pairs
    .filter((pair) => lower(pair.chainId).includes("ton") || lower(obj(pair.baseToken).address).startsWith("eq") || lower(obj(pair.quoteToken).address).startsWith("eq"))
    .sort((a, b) => pairScore(b) - pairScore(a))[0];

  if (!best) return null;

  const quoteSymbol = lower(obj(best.quoteToken).symbol);
  const priceNative = num(best.priceNative);
  const priceGram = priceNative && (quoteSymbol === "ton" || quoteSymbol === "gram" || quoteSymbol === "wton") ? priceNative : undefined;

  return {
    priceGram,
    priceUsd: num(best.priceUsd),
    change24h: num(obj(best.priceChange).h24),
    volume24hUsd: num(obj(best.volume).h24),
    liquidityUsd: num(obj(best.liquidity).usd)
  };
}

async function fetchDexScreenerMetrics(address: string): Promise<MarketMetrics | null> {
  const endpoints = [
    `${DEXSCREENER_BASE_URL.replace(/\/$/, "")}/latest/dex/tokens/${encodeURIComponent(address)}`,
    `${DEXSCREENER_BASE_URL.replace(/\/$/, "")}/token-pairs/v1/ton/${encodeURIComponent(address)}`
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, { cache: "no-store" });
      if (!response.ok) continue;
      const data: unknown = await response.json();
      const pairs = Array.isArray(data) ? data : Array.isArray(obj(data).pairs) ? obj(data).pairs as AnyRecord[] : [];
      const metrics = metricsFromPairs(pairs.filter((item): item is AnyRecord => Boolean(item && typeof item === "object")));
      if (metrics) return metrics;
    } catch {
      // Try the next public market endpoint before giving up.
    }
  }

  return null;
}

function preserveIdentity(token: ExternalTokenRecord, metrics: MarketMetrics): ExternalTokenRecord {
  return {
    ...token,
    priceGram: token.priceGram ?? metrics.priceGram,
    priceUsd: token.priceUsd ?? metrics.priceUsd,
    change24h: token.change24h ?? metrics.change24h,
    volume24hUsd: token.volume24hUsd ?? metrics.volume24hUsd,
    liquidityUsd: token.liquidityUsd ?? metrics.liquidityUsd,
    updatedAt: new Date().toISOString()
  };
}

export async function enrichExternalTokenMetrics(tokens: ExternalTokenRecord[], limit = 24): Promise<ExternalTokenRecord[]> {
  const enriched = [...tokens];
  const indexes = enriched
    .map((token, index) => ({ token, index }))
    .filter(({ token }) => !token.priceGram || !token.change24h || (!token.volume24hGram && !token.volume24hUsd) || (!token.liquidityGram && !token.liquidityUsd))
    .slice(0, limit);

  await Promise.all(indexes.map(async ({ token, index }) => {
    const metrics = await fetchDexScreenerMetrics(token.address);
    if (!metrics) return;
    enriched[index] = preserveIdentity(token, metrics);
  }));

  return enriched;
}
