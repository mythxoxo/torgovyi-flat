import type { ExternalTokenRecord } from "./types";

export type ExternalTokenFilter = "all" | "verified" | "risky";

export function listExternalTokens(_filter: ExternalTokenFilter = "all"): ExternalTokenRecord[] {
  return [];
}

export function searchExternalTokens(_query: string, _filter: ExternalTokenFilter = "all"): ExternalTokenRecord[] {
  return [];
}

export function resolveExternalToken(_idOrAddress: string): ExternalTokenRecord | null {
  return null;
}
