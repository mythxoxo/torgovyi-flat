import { NextResponse } from "next/server";
import { listExternalTokens } from "../../../lib/external-tokens/search";
import { listLiveStonfiExternalTokens } from "../../../lib/external-tokens/stonfi-live";

export async function GET() {
  try {
    const tokens = await listLiveStonfiExternalTokens(40);
    if (tokens.length > 0) {
      return NextResponse.json({ ok: true, source: "live-external", tokens });
    }
  } catch (error) {
    console.warn("STON.fi live external source failed", error);
  }

  return NextResponse.json({ ok: true, source: "fallback", tokens: listExternalTokens() });
}
