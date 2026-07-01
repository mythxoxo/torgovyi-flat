import { Address } from "@ton/core";
import type { ExternalTokenRecord } from "./types";
import { listLiveDedustExternalTokens } from "./dedust-live";
import { listExternalTokens, resolveExternalToken, searchExternalTokens, type ExternalTokenFilter } from "./search";
import { listLiveStonfiExternalTokens } from "./stonfi-live";

const normalizeAddress = (value: string) => {
  try {
    return Address.parse(value).toRawString().toLowerCase();
  } catch {
    return value.trim().toLowerCase();
  }
};

const keyOf = (token: ExternalTokenRecord) => normalizeAddress(token.address);

const bestNumber = (a?: number, b?: number) => {
  const left = Number.isFinite(a ?? 0) ? a ?? 0 : 0;
  const right = Number.isFinite(b ?? 0) ? b ?? 0 : 0;
  return Math.max(left, right) || undefined;
};

const hasUsefulImage = (value?: string) => typeof value === "string" && (value.trim().startsWith("/") || /^https?:\/\//i.test(value.trim()) || value.trim().startsWith("ipfs://"));
const hasUsefulVolume = (value?: number) => Number.isFinite(value ?? 0) && (value ?? 0) > 0;
const hasUsefulLiquidity = (value?: number) => Number.isFinite(value ?? 0) && (value ?? 0) > 0;
const hasRoute = (token: ExternalTokenRecord) => Boolean(token.primaryDex || token.dexes.length > 0 || token.poolAddress);

const bannedSymbols = new Set(["TON", "USDT", "USDT₮", "TSUSDE", "TSTON"]);
const bannedNames = ["tonstakers", "tetherusd", "wrapped ton", "staked ton"];

function isRelevantExternalToken(token: ExternalTokenRecord) {
  const symbol = token.symbol.trim().toUpperCase();
  const name = token.name.trim().toLowerCase();
  if (bannedSymbols.has(symbol)) return false;
  if (bannedNames.some((bad) => name.includes(bad))) return false;
  if (!hasRoute(token)) return false;
  if (!hasUsefulLiquidity(token.liquidityGram) && !hasUsefulVolume(token.volume24hGram)) return false;
  return true;
}

const mergeExternalTokens = (groups: ExternalTokenRecord[][]): ExternalTokenRecord[] => {
  const map = new Map<string, ExternalTokenRecord>();
  for (const token of groups.flat()) {
    const key = keyOf(token);
    const existing = map.get(key);
    if (!existing) {
      map.set(key, { ...token, address: token.address.trim() });
      continue;
    }
    const dexes = Array.from(new Set([...existing.dexes, ...token.dexes]));
    map.set(key, {
      ...existing,
      name: existing.name || token.name,
      symbol: existing.symbol || token.symbol,
      image: hasUsefulImage(existing.image) ? existing.image : token.image,
      decimals: existing.decimals || token.decimals,
      dexes,
      primaryDex: dexes.includes("DEDUST") ? "DEDUST" : dexes[0],
      priceGram: token.priceGram ?? existing.priceGram,
      priceUsd: token.priceUsd ?? existing.priceUsd,
      liquidityGram: bestNumber(existing.liquidityGram, token.liquidityGram),
      volume24hGram: bestNumber(existing.volume24hGram, token.volume24hGram),
      holders: bestNumber(existing.holders, token.holders),
      verified: existing.verified || token.verified,
      poolAddress: existing.poolAddress || token.poolAddress,
      updatedAt: new Date().toISOString()
    });
  }
  return [...map.values()]
    .filter(isRelevantExternalToken)
    .sort((a, b) => (b.volume24hGram ?? b.liquidityGram ?? 0) - (a.volume24hGram ?? a.liquidityGram ?? 0));
};

const curatedFallback = (filter: ExternalTokenFilter) => {
  const tokens = listExternalTokens(filter).filter(isRelevantExternalToken);
  if (filter === "verified") return tokens.filter((token) => token.verified);
  if (filter === "risky") return tokens.filter((token) => token.riskLevel === "HIGH");
  return tokens;
};

export async function listExternalTokensLive(filter: ExternalTokenFilter = "all"): Promise<ExternalTokenRecord[]> {
  const [dedust, stonfi] = await Promise.allSettled([
    listLiveDedustExternalTokens(120),
    listLiveStonfiExternalTokens(60)
  ]);

  const dedustTokens = dedust.status === "fulfilled" ? dedust.value : [];
  const stonfiTokens = stonfi.status === "fulfilled" ? stonfi.value : [];
  const live = mergeExternalTokens([dedustTokens, stonfiTokens]);
  const tokens = live.length > 0 ? live : curatedFallback(filter);

  if (filter === "verified") return tokens.filter((token) => token.verified);
  if (filter === "risky") return tokens.filter((token) => token.riskLevel === "HIGH");
  return tokens;
}

export async function searchExternalTokensLive(query: string, filter: ExternalTokenFilter = "all"): Promise<ExternalTokenRecord[]> {
  try {
    const tokens = await listExternalTokensLive(filter);
    const q = query.trim().toLowerCase();
    if (!q) return tokens;

    return tokens.filter((token) => {
      const hay = [token.name, token.symbol, token.address, token.poolAddress ?? "", token.dexes.join(" ")].join(" ").toLowerCase();
      return hay.includes(q);
    });
  } catch {
    return searchExternalTokens(query, filter).filter(isRelevantExternalToken);
  }
}

export async function resolveExternalTokenLive(idOrAddress: string): Promise<ExternalTokenRecord | null> {
  try {
    const tokens = await listExternalTokensLive("all");
    const id = decodeURIComponent(idOrAddress).trim().toLowerCase();
    const normalizedId = normalizeAddress(id);
    return tokens.find((token) => normalizeAddress(token.address) === normalizedId || token.symbol.toLowerCase() === id) ?? null;
  } catch {
    return resolveExternalToken(idOrAddress);
  }
}
