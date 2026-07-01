import { NextResponse } from "next/server";
import { fetchBlumMemepadTokens } from "../../../../lib/external/blum";

export const dynamic = "force-dynamic";

function parseAddresses(value: string | null): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseLimit(value: string | null): number | undefined {
  if (!value) return undefined;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return undefined;
  return parsed;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const result = await fetchBlumMemepadTokens({
    addresses: parseAddresses(searchParams.get("addresses")),
    limit: parseLimit(searchParams.get("limit"))
  });

  return NextResponse.json(result, {
    headers: {
      "Cache-Control": "s-maxage=15, stale-while-revalidate=30"
    }
  });
}
