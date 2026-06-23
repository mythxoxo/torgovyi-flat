import { NextResponse } from "next/server";
import { listLiveStonfiExternalTokens } from "../../../lib/external-tokens/stonfi-live";

export async function GET() {
  try {
    const tokens = await listLiveStonfiExternalTokens(40);
    if (tokens.length > 0) {
      return NextResponse.json({ ok: true, source: "live-external", tokens });
    }
    return NextResponse.json({ ok: false, source: "live-external", tokens: [], note: "No live external tokens were returned." });
  } catch (error) {
    console.warn("STON.fi live external source failed", error);
    return NextResponse.json({ ok: false, source: "live-external", tokens: [], note: "Live external token source is unavailable." }, { status: 503 });
  }
}
