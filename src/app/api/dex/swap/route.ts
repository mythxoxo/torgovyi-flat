import { Address } from "@ton/core";
import { NextResponse, type NextRequest } from "next/server";
import { buildExternalSwapPayload } from "../../../../lib/dex/external/swap";
import type { DexSwapRequest, ExternalDex, SwapSide } from "../../../../lib/dex/external/types";

const reply = (body: unknown, status = 200) => NextResponse.json(body, { status });

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

const hasRealPayloadMessage = (result: Awaited<ReturnType<typeof buildExternalSwapPayload>>) =>
  result.status === "payload_ready" &&
  Array.isArray(result.messages) &&
  result.messages.some((message) => Boolean(message.address && message.amount && message.payload));

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({} as Record<string, unknown>));
    const tokenAddress = parseAddress(body.tokenAddress, "tokenAddress");
    const userWallet = parseAddress(body.userWallet, "userWallet");
    const platform = body.platform === "stonfi" ? "stonfi" : body.platform === "dedust" ? "dedust" : undefined;
    const side = body.side === "sell" ? "sell" : body.side === "buy" ? "buy" : undefined;
    const amount = parseUnits(body.amount);

    if (!platform) return reply({ error: "platform must be dedust or stonfi" }, 400);
    if (!side) return reply({ error: "side must be buy or sell" }, 400);

    const result = await buildExternalSwapPayload({
      tokenAddress,
      userWallet,
      platform: platform as ExternalDex,
      side: side as SwapSide,
      amount,
      platforms: [platform as ExternalDex],
      slippageBps: parseSlippage(body.slippageBps)
    } as DexSwapRequest);

    return reply({ ok: hasRealPayloadMessage(result), result });
  } catch (error) {
    return reply({ error: error instanceof Error ? error.message : "DEX transaction failed" }, 400);
  }
}
