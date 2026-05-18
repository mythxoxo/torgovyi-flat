import { NextResponse } from "next/server";
import { listIndexedTokens } from "@/lib/server/indexer-store";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const tokens = await listIndexedTokens("trending");
    const live = tokens.filter((token) => Number(token.collected_ton) > 0).length;
    return NextResponse.json({ live });
  } catch {
    return NextResponse.json({ live: 0 });
  }
}
