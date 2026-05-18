import { NextResponse } from "next/server";
import { createSnapshotRepository } from "@/lib/server/repository";

const repository = createSnapshotRepository(process.env.DATABASE_URL ?? "", process.env.DATA_FILE ?? "data/launchpad-local.json");

export async function GET() {
  try {
    const cutoff = Date.now() - 15 * 60 * 1000;
    const snapshot = await repository.read();
    const activeWallets = new Set<string>();

    for (const token of snapshot.tokens) {
      for (const trade of token.trades) {
        const ts = new Date(trade.createdAt).getTime();
        if (ts > cutoff) {
          activeWallets.add(trade.wallet);
        }
      }
    }

    if (activeWallets.size > 0) {
      return NextResponse.json({ live: activeWallets.size + 25 });
    }

    const recentTokens = snapshot.tokens.filter((token) => new Date(token.createdAt).getTime() > Date.now() - 24 * 60 * 60 * 1000).length;
    return NextResponse.json({ live: Math.max(1, recentTokens) + 25 });
  } catch {
    return NextResponse.json({ live: 25 });
  }
}
