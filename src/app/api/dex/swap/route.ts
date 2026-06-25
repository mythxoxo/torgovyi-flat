import { NextResponse, type NextRequest } from "next/server";
import { buildExternalSwapPayload } from "../../../../lib/dex/external/swap";
import type { DexSwapRequest, ExternalDex, SwapSide } from "../../../../lib/dex/external/types";

const reply = (body: unknown, status = 200) => NextResponse.json(body, { status });

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({} as Record<string, unknown>));
    const tokenAddress = typeof body.tokenAddress === "string" ? body.tokenAddress.trim() : "";
    const userWallet = typeof body.userWallet === "string" ? body.userWallet.trim() : "";
    const platform = body.platform === "stonfi" ? "stonfi" : body.platform === "dedust" ? "dedust" : undefined;
    const side = body.side === "sell" ? "sell" : body.side === "buy" ? "buy" : undefined;
    const amount = typeof body.amount === "string" ? body.amount.trim() : String(body.amount || "");

    if (!tokenAddress) return reply({ error: "tokenAddress is required" }, 400);
    if (!userWallet) return reply({ error: "userWallet is required" }, 400);
    if (!platform) return reply({ error: "platform must be dedust or stonfi" }, 400);
    if (!side) return reply({ error: "side must be buy or sell" }, 400);
    if (!amount || BigInt(amount) <= 0n) return reply({ error: "amount must be positive units" }, 400);

    const result = await buildExternalSwapPayload({
      tokenAddress,
      userWallet,
      platform: platform as ExternalDex,
      side: side as SwapSide,
      amount,
      platforms: [platform as ExternalDex],
      slippageBps: Number(body.slippageBps ?? 300)
    } as DexSwapRequest);

    return reply({ ok: result.status === "payload_ready", result });
  } catch (error) {
    return reply({ error: error instanceof Error ? error.message : "DEX transaction failed" }, 500);
  }
}
