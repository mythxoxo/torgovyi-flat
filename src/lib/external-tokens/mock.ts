import type { ExternalTokenRecord } from "./types";
import { evaluateTokenRisk } from "../risk/evaluate-token-risk";

const now = () => new Date().toISOString();

type Seed = Omit<ExternalTokenRecord, "source" | "riskLevel" | "warnings" | "updatedAt">;

const withRisk = (token: Seed): ExternalTokenRecord => {
  const base: ExternalTokenRecord = { ...token, source: "EXTERNAL", riskLevel: "UNKNOWN", warnings: [], updatedAt: now() };
  const risk = evaluateTokenRisk(base);
  return { ...base, ...risk };
};

const token = (symbol: string, name: string, i: number, priceGram: number, change24h: number, volume24hGram: number, liquidityGram: number, dexes: Seed["dexes"] = ["STONFI"], verified = true): Seed => ({
  address: `EQ${i.toString().padStart(2, "0")}${symbol}${"0".repeat(Math.max(0, 42 - symbol.length))}`,
  name,
  symbol,
  image: undefined,
  decimals: 9,
  priceGram,
  priceUsd: Number((priceGram * 5.8).toFixed(6)),
  change24h,
  volume24hGram,
  liquidityGram,
  holders: Math.max(100, Math.floor(volume24hGram / 4)),
  dexes,
  primaryDex: dexes[0],
  poolAddress: dexes[0] ? `${dexes[0]}:${symbol}-GRAM` : undefined,
  verified
});

export const mockExternalTokens: ExternalTokenRecord[] = [
  withRisk(token("TON", "Toncoin", 1, 1, 1.8, 6900000, 4100000, ["STONFI", "DEDUST"])),
  withRisk(token("USDT", "USD Token", 2, 0.172, 0.1, 9300000, 5200000, ["STONFI"])),
  withRisk(token("tsTON", "Staked TON", 3, 1.08, 2.2, 3500000, 2200000, ["STONFI"])),
  withRisk(token("NOT", "Notcoin", 4, 0.0017, 6.2, 820000, 410000, ["STONFI"])),
  withRisk(token("DOGS", "Dogs", 5, 0.00022, -3.8, 540000, 260000, ["STONFI", "DEDUST"])),
  withRisk(token("STON", "STON", 6, 0.56, 2.4, 410000, 240000, ["STONFI"])),
  withRisk(token("jUSDT", "jUSDT", 7, 0.171, 0.2, 260000, 180000, ["STONFI"])),
  withRisk(token("REDO", "Resistance Dog", 8, 0.019, 18.4, 170000, 90000, ["STONFI"])),
  withRisk(token("FISH", "Fish", 9, 0.00044, 9.8, 125000, 62000, ["STONFI"])),
  withRisk(token("DFC", "DeFinder", 10, 0.42, -4.5, 95000, 78000, ["STONFI"])),
  withRisk(token("SCALE", "Scale", 11, 0.015, 14.8, 78000, 26000, ["DEDUST", "STONFI"])),
  withRisk(token("HYDRA", "Hydra", 12, 0.033, 11.1, 67000, 31000, ["STONFI"])),
  withRisk(token("PUNK", "TON Punks", 13, 0.0048, 4.5, 52000, 27000, ["STONFI"])),
  withRisk(token("JETTON", "JetTon", 14, 0.022, -7.2, 47000, 35000, ["STONFI"])),
  withRisk(token("WALL", "Wallet Token", 15, 0.0061, 3.7, 42000, 21000, ["STONFI"])),
  withRisk(token("BOLT", "Bolt", 16, 0.0029, 21.6, 38000, 16000, ["DEDUST"])),
  withRisk(token("RAFF", "Raffles", 17, 0.0098, 8.3, 33000, 14000, ["STONFI"])),
  withRisk(token("GRAM", "Gram", 18, 0.11, 12.4, 29000, 18000, ["STONFI"])),
  withRisk(token("DUCK", "Duck", 19, 0.00031, 33.8, 21000, 9500, ["STONFI"])),
  withRisk(token("MEME", "New Meme", 20, 0.000004, 91, 64, 220, [], false))
];

const curatedSymbols = new Set(["DOGS", "REDO", "FISH", "DFC", "SCALE", "HYDRA", "PUNK", "JETTON", "WALL", "BOLT", "RAFF", "DUCK"]);

export const curatedExternalTokens: ExternalTokenRecord[] = mockExternalTokens.filter((token) => curatedSymbols.has(token.symbol));
