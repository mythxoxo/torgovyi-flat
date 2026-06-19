import type { ExternalTokenRecord } from "./types";
import { listExternalTokens, resolveExternalToken, searchExternalTokens, type ExternalTokenFilter } from "./search";

async function fetchExternalTokens(): Promise<ExternalTokenRecord[]> {
  const res = await fetch("/api/external-tokens", { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`External token source failed with ${res.status}`);
  }

  const data = (await res.json()) as { ok?: boolean; tokens?: ExternalTokenRecord[] };
  if (!data.ok || !Array.isArray(data.tokens)) {
    throw new Error("External token payload is invalid");
  }

  return data.tokens;
}

export async function listExternalTokensLive(filter: ExternalTokenFilter = "all"): Promise<ExternalTokenRecord[]> {
  try {
    const tokens = await fetchExternalTokens();
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
      const hay = [token.name, token.symbol, token.address, token.poolAddress ?? ""].join(" ").toLowerCase();
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
