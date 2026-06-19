export type GainerSource = "live" | "fallback";

export interface GainerRecord {
  wallet: string;
  token: string;
  multiple: number;
  entryGram: number;
  valueGram: number;
  source: GainerSource;
  updatedAt: string;
}
