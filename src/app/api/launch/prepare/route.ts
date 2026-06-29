import { Address } from "@ton/core";
import { NextResponse, type NextRequest } from "next/server";
import { prepareFullLaunchDraft } from "../../../../lib/server/launch-draft";

const json = (body: unknown, status = 200) => NextResponse.json(body, { status });

const parseAddress = (value: unknown, field: string): string => {
  if (typeof value !== "string" || !value.trim()) throw new Error(`${field} is required`);
  try {
    return Address.parse(value.trim()).toString({ bounceable: true, testOnly: false });
  } catch {
    throw new Error(`${field} must be a valid TON address`);
  }
};

const parseOptionalAddress = (value: unknown): string | undefined => {
  if (typeof value !== "string" || !value.trim()) return undefined;
  return parseAddress(value, "factoryAddress");
};

const parseText = (value: unknown, field: string, min: number, max: number): string => {
  if (typeof value !== "string") throw new Error(`${field} is required`);
  const text = value.trim().replace(/\s+/g, " ");
  if (text.length < min || text.length > max) throw new Error(`${field} must be ${min}..${max} characters`);
  return text;
};

const parseTicker = (value: unknown): string => {
  const ticker = parseText(value, "ticker", 2, 10).replace(/^\$/g, "").toUpperCase();
  if (!/^[A-Z0-9]{2,10}$/.test(ticker)) throw new Error("ticker must be 2..10 uppercase letters/numbers");
  return ticker;
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({} as Record<string, unknown>));
    const creatorAddress = parseAddress(body.creatorAddress, "creatorAddress");
    const name = parseText(body.name, "name", 2, 64);
    const ticker = parseTicker(body.ticker);
    const description = typeof body.description === "string" ? body.description.trim().slice(0, 500) : "";
    const imageUrl = typeof body.imageUrl === "string" ? body.imageUrl.trim().slice(0, 512) : "";
    const targetTonRaw = Number(body.targetTon ?? 5);
    const targetTon = targetTonRaw === 8888 ? 8888 : 5;
    const factoryAddress = parseOptionalAddress(process.env.NEXT_PUBLIC_FACTORY_ADDRESS || body.factoryAddress);

    const result = await prepareFullLaunchDraft({
      factoryAddress,
      creatorAddress,
      name,
      ticker,
      description,
      imageUrl,
      targetTon,
      minBuyTon: 0.05,
      feeBps: 75
    });

    return json({ ok: true, ...result });
  } catch (error) {
    return json({ ok: false, error: error instanceof Error ? error.message : "launch draft failed" }, 400);
  }
}
