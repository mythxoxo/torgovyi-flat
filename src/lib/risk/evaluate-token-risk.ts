import type { ExternalTokenRecord } from "../external-tokens/types";

export function evaluateTokenRisk(token: ExternalTokenRecord): Pick<ExternalTokenRecord, "riskLevel" | "warnings"> {
  const warnings: string[] = [];

  if (!token.verified) warnings.push("Unverified token");
  if (!token.dexes.length) warnings.push("No DEX route");
  if (!token.liquidityGram || token.liquidityGram < 500) warnings.push("Low liquidity");
  if (!token.volume24hGram || token.volume24hGram < 100) warnings.push("Low volume");
  if (token.change24h && Math.abs(token.change24h) > 80) warnings.push("Extreme volatility");

  const riskLevel = warnings.length >= 3 ? "HIGH" : warnings.length >= 1 ? "MEDIUM" : "LOW";

  return { riskLevel, warnings };
}
