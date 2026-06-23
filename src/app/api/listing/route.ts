import { NextRequest, NextResponse } from "next/server";
import { getIndexedToken } from "@/lib/server/indexer-store";
import { upsertListingIntent } from "@/lib/server/listing-store";
import { prepareDedustLiquidityDraft } from "@/lib/dex/dedust";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const body = (await request.json()) as { poolAddress?: string; tonAmount?: string; jettonAmount?: string; ownerWallet?: string; txHash?: string };
  const poolAddress = body.poolAddress?.trim() || "";
  const tonAmount = body.tonAmount?.trim() || "";
  const jettonAmount = body.jettonAmount?.trim() || "";
  const ownerWallet = body.ownerWallet?.trim() || "";
  const txHash = body.txHash?.trim() || "";

  if (!poolAddress) return NextResponse.json({ ok: false, status: "failed", error: "poolAddress is required" }, { status: 400 });
  if (!ownerWallet) return NextResponse.json({ ok: false, status: "failed", error: "ownerWallet is required" }, { status: 400 });

  const row = await getIndexedToken(poolAddress);
  if (!row) return NextResponse.json({ ok: false, status: "failed", error: "launch not found" }, { status: 404 });
  if (!row.jetton_address) return NextResponse.json({ ok: false, status: "failed", error: "jetton master not found" }, { status: 409 });
  if (Number(row.collected_ton) <= 0 || Number(row.sold_tokens) <= 0) {
    return NextResponse.json({ ok: false, status: "not_ready", error: "launch has not reached a verifiable migration-ready state" }, { status: 409 });
  }

  const now = new Date().toISOString();

  if (txHash) {
    await upsertListingIntent({
      poolAddress,
      jettonAddress: row.jetton_address,
      ownerWallet,
      targetDex: "dedust",
      expectedPair: { base: "TON", quote: row.jetton_address },
      tonAmount,
      jettonAmount,
      status: "verification_pending",
      txHash,
      createdAt: now,
      updatedAt: now,
    });

    return NextResponse.json({
      ok: true,
      status: "verification_pending",
      poolAddress,
      jettonAddress: row.jetton_address,
      txHash,
      message: "Listing transaction submitted by user. Post-exec pool and liquidity verification is required."
    });
  }

  if (!tonAmount || !jettonAmount) {
    return NextResponse.json({ ok: false, status: "failed", error: "tonAmount and jettonAmount are required" }, { status: 400 });
  }

  const draft = prepareDedustLiquidityDraft({
    jettonMaster: row.jetton_address,
    pool: poolAddress,
    creator: ownerWallet,
    tonAmountNano: tonAmount,
    tokenAmount: jettonAmount,
    slippageBps: 300,
  });

  await upsertListingIntent({
    poolAddress,
    jettonAddress: row.jetton_address,
    ownerWallet,
    targetDex: "dedust",
    expectedPair: { base: "TON", quote: row.jetton_address },
    tonAmount,
    jettonAmount,
    status: "payload_ready",
    createdAt: now,
    updatedAt: now,
  });

  return NextResponse.json({
    ok: true,
    status: "payload_ready",
    poolAddress,
    jettonAddress: row.jetton_address,
    verificationRequired: true,
    manualSigningRequired: true,
    draft,
    message: "Manual listing payload prepared. User wallet signature and post-execution verification are required."
  });
}
