import { evaluateTokenRisk } from "../risk/evaluate-token-risk";
import type { ExternalTokenRecord } from "./types";

type SnapshotSeed = Omit<ExternalTokenRecord, "source" | "riskLevel" | "warnings" | "updatedAt">;

const now = () => new Date().toISOString();

const withRisk = (token: SnapshotSeed): ExternalTokenRecord => {
  const base: ExternalTokenRecord = {
    ...token,
    source: "EXTERNAL",
    riskLevel: "UNKNOWN",
    warnings: ["Cached real DEX token identity. Live metrics may be unavailable in this runtime."],
    updatedAt: now()
  };
  const risk = evaluateTokenRisk(base);
  return {
    ...base,
    riskLevel: risk.riskLevel,
    warnings: Array.from(new Set([...base.warnings, ...risk.warnings]))
  };
};

const snapshotSeeds: SnapshotSeed[] = [
  {
    address: "EQAWpz2_G0NKxlG2VvgFbgZGPt8Y1qe0cGj-4Yw5BfmYR5iF",
    name: "Not Meme",
    symbol: "MEM",
    image: "https://assets.dedust.io/images/mem.webp",
    decimals: 9,
    dexes: ["DEDUST"],
    primaryDex: "DEDUST",
    verified: false
  },
  {
    address: "EQB0apV-NyCYJDVwSBoDL86Xjp0OiwcyD8jJ0J5BVWnnDJu7",
    name: "Open League",
    symbol: "OPEN",
    image: "https://assets.dedust.io/images/open-1.webp",
    decimals: 9,
    dexes: ["DEDUST"],
    primaryDex: "DEDUST",
    verified: false
  }
];

export const snapshotExternalTokens: ExternalTokenRecord[] = snapshotSeeds.map(withRisk);

export function listSnapshotExternalTokens(query = ""): ExternalTokenRecord[] {
  const q = query.trim().toLowerCase();
  if (!q) return snapshotExternalTokens;
  return snapshotExternalTokens.filter((token) => {
    const hay = [token.name, token.symbol, token.address, token.poolAddress ?? "", token.dexes.join(" ")].join(" ").toLowerCase();
    return hay.includes(q);
  });
}
