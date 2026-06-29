import { Address } from "@ton/core";
import { NextResponse, type NextRequest } from "next/server";
import { quoteExternalDex } from "../../../../lib/dex/external/quote";
import type { DexQuoteRequest, ExternalDex, SwapSide } from "../../../../lib/dex/external/types";

const json = (body: unknown, status = 200) => NextResponse.json(body, { status });

const parsePlatforms = (value: unknown): ExternalDex[] | undefined => {
  if (!Array.isArray(value)) return undefined;
  const platforms = value.filter((item): item is ExternalDex => item === "dedust" || item === "stonfi");
  return platforms.length > 0 ? Array.from(new Set(platforms)) : undefined;
};

const parseAddress = (value: unknown, field: string): string => {
  if (typeof value !== "string" || !value.trim()) throw new Error(`${field} is required`);
  try {
    return Address.parse(value.trim()).toString({ bounceable: true, testOnly: false });
  } catch {
    throw new Error(`${field} must be a valid TON address`);
  }
};

const parseUnits = (value: unknown): string => {
  const raw = typeof value === "string" ? value.trim() : String(value ?? "");
  if (!/^[1-9][0-9]{0,38}$/.test(raw)) throw new Error("amount must be positive integer units");
  return raw;
};

const parseSlippage = (value: unknown): number => {
  const parsed = Number(value ?? 300);
  if (!Number.isFinite(parsed)) return 300;
  return Math.max(10, Math.min(2000, Math.floor(parsed)));
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({} as Record<string, unknown>));
    const tokenAddress = parseAddress(body.tokenAddress, "tokenAddress");
    const side = body.side === "sell" ? "sell" : body.side === "buy" ? "buy" : undefined;
    const amount = parseUnits(body.amount);
    if (!side) return json({ error: "side must be buy or sell" }, 400);

    const input: DexQuoteRequest = {
      tokenAddress,
      side: side as SwapSide,
      amount,
      platforms: parsePlatforms(body.platforms),
      slippageBps: parseSlippage(body.slippageBps)
    };

    const quotes = await quoteExternalDex(input);
    return json({ ok: true, quotes });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "DEX quote failed" }, 400);
  }
}
