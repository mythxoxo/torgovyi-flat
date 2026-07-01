import { mockExternalTokens } from "./mock";
import type { ExternalTokenRecord } from "./types";

export type ExternalTokenFilter = "all" | "verified" | "risky";

const enabled = () => process.env.NEXT_PUBLIC_EXTERNAL_MARKETS_ENABLED !== "false";

export function listExternalTokens(filter: ExternalTokenFilter = "all"): ExternalTokenRecord[] {
  if (!enabled()) return [];
  if (filter === "verified") return mockExternalTokens.filter((token) => token.verified);
  if (filter === "risky") return mockExternalTokens.filter((token) => token.riskLevel === "HIGH");
  return mockExternalTokens;
}

export function searchExternalTokens(query: string, filter: ExternalTokenFilter = "all"): ExternalTokenRecord[] {
  const q = query.trim().toLowerCase();
  const tokens = listExternalTokens(filter);
  if (!q) return tokens;

  return tokens.filter((token) => {
    const hay = [token.name, token.symbol, token.address, token.poolAddress ?? ""].join(" ").toLowerCase();
    return hay.includes(q);
  });
}

export function resolveExternalToken(idOrAddress: string): ExternalTokenRecord | null {
  const id = decodeURIComponent(idOrAddress).trim().toLowerCase();
  return mockExternalTokens.find((token) => token.address.toLowerCase() === id || token.symbol.toLowerCase() === id) ?? null;
}
