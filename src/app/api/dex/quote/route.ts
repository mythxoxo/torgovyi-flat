import { NextResponse, type NextRequest } from "next/server";
import { quoteExternalDex } from "../../../../lib/dex/external/quote";
import type { DexQuoteRequest, ExternalDex, SwapSide } from "../../../../lib/dex/external/types";

const json = (body: unknown, status = 200) => NextResponse.json(body, { status });

const parsePlatforms = (value: unknown): ExternalDex[] | undefined => {
  if (!Array.isArray(value)) return undefined;
  return value.filter((item): item is ExternalDex => item === "dedust" || item === "stonfi");
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({} as Record<string, unknown>));
    const tokenAddress = typeof body.tokenAddress === "string" ? body.tokenAddress.trim() : "";
    const side = body.side === "sell" ? "sell" : body.side === "buy" ? "buy" : undefined;
    const amount = typeof body.amount === "string" ? body.amount.trim() : String(body.amount || "");
    const slippageBps = Number(body.slippageBps ?? 300);

    if (!tokenAddress) return json({ error: "tokenAddress is required" }, 400);
    if (!side) return json({ error: "side must be buy or sell" }, 400);
    if (!amount || BigInt(amount) <= 0n) return json({ error: "amount must be positive units" }, 400);

    const input: DexQuoteRequest = {
      tokenAddress,
      side: side as SwapSide,
      amount,
      platforms: parsePlatforms(body.platforms),
      slippageBps: Number.isFinite(slippageBps) ? slippageBps : 300
    };

    const quotes = await quoteExternalDex(input);
    return json({ ok: true, quotes });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "DEX quote failed" }, 500);
  }
}
