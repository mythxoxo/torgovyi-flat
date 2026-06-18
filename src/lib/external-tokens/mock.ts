import type { ExternalTokenRecord } from "./types";
import { evaluateTokenRisk } from "../risk/evaluate-token-risk";

const now = () => new Date().toISOString();

const withRisk = (token: Omit<ExternalTokenRecord, "source" | "riskLevel" | "warnings" | "updatedAt">): ExternalTokenRecord => {
  const base: ExternalTokenRecord = {
    ...token,
    source: "EXTERNAL",
    riskLevel: "UNKNOWN",
    warnings: [],
    updatedAt: now()
  };
  const risk = evaluateTokenRisk(base);
  return { ...base, ...risk };
};

export const mockExternalTokens: ExternalTokenRecord[] = [
  withRisk({
    address: "EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c",
    name: "Notcoin",
    symbol: "NOT",
    image: "/brand/img_01.jpg",
    decimals: 9,
    priceGram: 0.0017,
    priceUsd: 0.01,
    change24h: 6.2,
    volume24hGram: 820000,
    liquidityGram: 410000,
    holders: 1250000,
    dexes: ["STONFI"],
    primaryDex: "STONFI",
    poolAddress: "STONFI:NOT-GRAM",
    verified: true
  }),
  withRisk({
    address: "EQBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBxQ",
    name: "Dogs",
    symbol: "DOGS",
    image: "/brand/img_02.jpg",
    decimals: 9,
    priceGram: 0.00022,
    priceUsd: 0.0013,
    change24h: -3.8,
    volume24hGram: 540000,
    liquidityGram: 260000,
    holders: 980000,
    dexes: ["STONFI", "DEDUST"],
    primaryDex: "STONFI",
    poolAddress: "STONFI:DOGS-GRAM",
    verified: true
  }),
  withRisk({
    address: "EQCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCpo",
    name: "STON",
    symbol: "STON",
    image: "/brand/img_03.jpg",
    decimals: 9,
    priceGram: 0.56,
    priceUsd: 3.2,
    change24h: 2.4,
    volume24hGram: 110000,
    liquidityGram: 190000,
    holders: 42000,
    dexes: ["STONFI"],
    primaryDex: "STONFI",
    poolAddress: "STONFI:STON-GRAM",
    verified: true
  }),
  withRisk({
    address: "EQDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD5E",
    name: "Scale",
    symbol: "SCALE",
    image: "/brand/img_04.jpg",
    decimals: 9,
    priceGram: 0.015,
    priceUsd: 0.086,
    change24h: 14.8,
    volume24hGram: 18000,
    liquidityGram: 26000,
    holders: 7800,
    dexes: ["DEDUST"],
    primaryDex: "DEDUST",
    poolAddress: "DEDUST:SCALE-GRAM",
    verified: true
  }),
  withRisk({
    address: "EQEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEBk",
    name: "New Meme Jetton",
    symbol: "MEME",
    image: "/brand/img_05.jpg",
    decimals: 9,
    priceGram: 0.000004,
    priceUsd: 0.00002,
    change24h: 91,
    volume24hGram: 64,
    liquidityGram: 220,
    holders: 87,
    dexes: [],
    verified: false
  })
];
