export type DexId = "STONFI" | "DEDUST";

export interface ExternalTokenRecord {
  source: "EXTERNAL";
  address: string;
  name: string;
  symbol: string;
  image?: string;
  decimals: number;
  priceGram?: number;
  priceUsd?: number;
  change24h?: number;
  volume24hGram?: number;
  liquidityGram?: number;
  holders?: number;
  dexes: DexId[];
  primaryDex?: DexId;
  poolAddress?: string;
  verified: boolean;
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "UNKNOWN";
  warnings: string[];
  updatedAt: string;
}
