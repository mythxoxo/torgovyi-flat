import { NextResponse, type NextRequest } from "next/server";
import { listExternalTokens } from "../../../lib/external-tokens/search";
import { listExternalTokensLive, searchExternalTokensLive } from "../../../lib/external-tokens/live";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim() || "";
  try {
    const tokens = query ? await searchExternalTokensLive(query, "all") : await listExternalTokensLive("all");
    if (tokens.length > 0) {
      return NextResponse.json({ ok: true, source: "live-external", tokens });
    }
  } catch (error) {
    console.warn("Live external token sources failed", error);
  }

  const fallback = query
    ? listExternalTokens("all").filter((token) => [token.name, token.symbol, token.address, token.poolAddress ?? "", token.dexes.join(" ")].join(" ").toLowerCase().includes(query.toLowerCase()))
    : listExternalTokens("all");

  return NextResponse.json({
    ok: true,
    source: "fallback",
    tokens: fallback,
    note: fallback.length > 0 ? "Live external token source is unavailable; fallback tokens returned." : "No external tokens available."
  });
}
