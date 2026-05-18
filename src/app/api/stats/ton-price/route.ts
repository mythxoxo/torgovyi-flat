import { NextResponse } from "next/server";

const SOURCES = [
  "https://tonapi.io/v2/rates?tokens=ton&currencies=usd",
  "https://api.coinpaprika.com/v1/tickers/ton-the-open-network"
];

export async function GET() {
  for (const url of SOURCES) {
    try {
      const res = await fetch(url, {
        cache: "no-store",
        headers: { accept: "application/json" }
      });
      if (!res.ok) continue;

      const data = (await res.json()) as any;

      if (url.includes("tonapi.io")) {
        const usd = Number(data?.rates?.TON?.prices?.USD ?? data?.rates?.ton?.prices?.USD);
        if (Number.isFinite(usd) && usd > 0) {
          return NextResponse.json({ usd, source: "tonapi" });
        }
      }

      if (url.includes("coinpaprika")) {
        const usd = Number(data?.quotes?.USD?.price);
        if (Number.isFinite(usd) && usd > 0) {
          return NextResponse.json({ usd, source: "coinpaprika" });
        }
      }
    } catch {}
  }

  return NextResponse.json({ usd: null }, { status: 503 });
}
