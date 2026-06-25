import type { ExternalTokenRecord } from "./types";
import { listLiveDedustExternalTokens } from "./dedust-live";
import { listExternalTokens, resolveExternalToken, searchExternalTokens, type ExternalTokenFilter } from "./search";
import { listLiveStonfiExternalTokens } from "./stonfi-live";

const keyOf = (token: ExternalTokenRecord) => token.address.toLowerCase();

const mergeExternalTokens = (groups: ExternalTokenRecord[][]): ExternalTokenRecord[] => {
  const map = new Map<string, ExternalTokenRecord>();
  for (const token of groups.flat()) {
    const key = keyOf(token);
    const existing = map.get(key);
    if (!existing) {
      map.set(key, token);
      continue;
    }
    const dexes = Array.from(new Set([...existing.dexes, ...token.dexes]));
    map.set(key, {
      ...existing,
      ...token,
      dexes,
      primaryDex: dexes.includes("DEDUST") ? "DEDUST" : dexes[0],
      priceGram: token.priceGram ?? existing.priceGram,
      priceUsd: token.priceUsd ?? existing.priceUsd,
      liquidityGram: Math.max(existing.liquidityGram ?? 0, token.liquidityGram ?? 0) || existing.liquidityGram || token.liquidityGram,
      volume24hGram: Math.max(existing.volume24hGram ?? 0, token.volume24hGram ?? 0) || existing.volume24hGram || token.volume24hGram,
      updatedAt: new Date().toISOString()
    });
  }
  return [...map.values()].sort((a, b) => (b.volume24hGram ?? b.liquidityGram ?? 0) - (a.volume24hGram ?? a.liquidityGram ?? 0));
};

export async function listExternalTokensLive(filter: ExternalTokenFilter = "all"): Promise<ExternalTokenRecord[]> {
  try {
    const [stonfi, dedust] = await Promise.allSettled([
      listLiveStonfiExternalTokens(80),
      listLiveDedustExternalTokens(120)
    ]);
    const live = mergeExternalTokens([
      stonfi.status === "fulfilled" ? stonfi.value : [],
      dedust.status === "fulfilled" ? dedust.value : []
    ]);
    const tokens = live.length > 0 ? live : listExternalTokens(filter);
    if (filter === "verified") return tokens.filter((token) => token.verified);
    if (filter === "risky") return tokens.filter((token) => token.riskLevel === "HIGH");
    return tokens;
  } catch {
    return listExternalTokens(filter);
  }
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
    return searchExternalTokens(query, filter);
  }
}

export async function resolveExternalTokenLive(idOrAddress: string): Promise<ExternalTokenRecord | null> {
  try {
    const tokens = await listExternalTokensLive("all");
    const id = decodeURIComponent(idOrAddress).trim().toLowerCase();
    return tokens.find((token) => token.address.toLowerCase() === id || token.symbol.toLowerCase() === id) ?? null;
  } catch {
    return resolveExternalToken(idOrAddress);
  }
}
