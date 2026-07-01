import { NextResponse, type NextRequest } from "next/server";
import { listExternalTokensLive, searchExternalTokensLive } from "../../../lib/external-tokens/live";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim() || "";
  try {
    const tokens = query ? await searchExternalTokensLive(query, "all") : await listExternalTokensLive("all");
    return NextResponse.json({
      ok: true,
      source: "live-external",
      tokens,
      note: tokens.length > 0 ? undefined : "No curated live external tokens available."
    });
  } catch (error) {
    console.warn("Live external token sources failed", error);
    return NextResponse.json({
      ok: false,
      source: "unavailable",
      tokens: [],
      note: "Live external token source is unavailable."
    }, { status: 503 });
  }
}
