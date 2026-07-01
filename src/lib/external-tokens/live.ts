import { Address } from "@ton/core";
import type { ExternalTokenRecord } from "./types";
import { listLiveDedustExternalTokens } from "./dedust-live";
import type { ExternalTokenFilter } from "./search";
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

const bannedSymbols = new Set(["TON", "GRAM", "USDT", "USD₮", "JUSDT", "JUSDC", "TSTON", "STON", "HGRAM", "NOT", "WSTON", "TELEBTC"]);
const bannedNames = ["tonstakers", "tether usd", "wrapped ton", "staked ton", "stable", "notcoin", "wallet token", "hipo staked", "liquid staking", "telebtc"];

function isRelevantExternalToken(token: ExternalTokenRecord) {
  const symbol = token.symbol.trim().toUpperCase();
  const name = token.name.trim().toLowerCase();
  if (bannedSymbols.has(symbol)) return false;
  if (bannedNames.some((bad) => name.includes(bad))) return false;
  if (!token.poolAddress && !token.primaryDex) return false;
  if (!token.priceGram && !token.priceUsd) return false;
  if (!token.liquidityGram || token.liquidityGram <= 0) return false;
  return true;
}

const mergeExternalTokens = (groups: ExternalTokenRecord[][]): ExternalTokenRecord[] => {
  const map = new Map<string, ExternalTokenRecord>();
  for (const token of groups.flat()) {
    if (!isRelevantExternalToken(token)) continue;
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
      image: existing.image || token.image,
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
  return [...map.values()].sort((a, b) => (b.volume24hGram ?? b.liquidityGram ?? 0) - (a.volume24hGram ?? a.liquidityGram ?? 0));
};

export async function listExternalTokensLive(filter: ExternalTokenFilter = "all"): Promise<ExternalTokenRecord[]> {
  const [stonfi, dedust] = await Promise.allSettled([
    listLiveStonfiExternalTokens(160),
    listLiveDedustExternalTokens(240)
  ]);
  const live = mergeExternalTokens([
    stonfi.status === "fulfilled" ? stonfi.value : [],
    dedust.status === "fulfilled" ? dedust.value : []
  ]);
  if (filter === "verified") return live.filter((token) => token.verified);
  if (filter === "risky") return live.filter((token) => token.riskLevel === "HIGH");
  return live;
}

export async function searchExternalTokensLive(query: string, filter: ExternalTokenFilter = "all"): Promise<ExternalTokenRecord[]> {
  const tokens = await listExternalTokensLive(filter);
  const q = query.trim().toLowerCase();
  if (!q) return tokens;

  return tokens.filter((token) => {
    const hay = [token.name, token.symbol, token.address, token.poolAddress ?? "", token.dexes.join(" ")].join(" ").toLowerCase();
    return hay.includes(q);
  });
}

export async function resolveExternalTokenLive(idOrAddress: string): Promise<ExternalTokenRecord | null> {
  const tokens = await listExternalTokensLive("all");
  const id = decodeURIComponent(idOrAddress).trim().toLowerCase();
  const normalizedId = normalizeAddress(id);
  return tokens.find((token) => normalizeAddress(token.address) === normalizedId || token.symbol.toLowerCase() === id) ?? null;
}
