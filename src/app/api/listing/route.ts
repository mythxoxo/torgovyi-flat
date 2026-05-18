import { NextRequest, NextResponse } from "next/server";
import { assertListingPreconditions, buildListingParams, previewStonfiListing } from "../../../lib/stonfi";
import { getIndexedToken } from "../../../lib/server/indexer-store";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { poolAddress: string; tonAmount: string; jettonAmount: string };
    const token = await getIndexedToken(body.poolAddress);
    if (!token) {
      return NextResponse.json({ error: "Pool not found" }, { status: 404 });
    }

    assertListingPreconditions({
      isGraduated: token.status === "GRADUATED_READY" || token.status === "LISTED",
      isListed: token.is_listed,
      collectedTon: Number(token.collected_ton),
      targetTon: Number(token.target_ton),
      jettonMaster: token.jetton_address,
      lpLockAddress: token.lp_lock_address || undefined
    });

    const params = buildListingParams(
      {
        poolAddress: token.pool_address,
        jettonMaster: token.jetton_address,
        lpLockAddress: token.lp_lock_address || undefined,
        stonfiPoolAddress: token.stonfi_pool_address || undefined
      },
      {
        tonAmount: body.tonAmount,
        jettonAmount: body.jettonAmount
      },
      {
        routerAddress: process.env.STONFI_ROUTER_ADDRESS || "",
        pTonAddress: process.env.STONFI_PTON_ADDRESS || ""
      }
    );

    const preview = await previewStonfiListing(params);
    return NextResponse.json(preview);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Listing preview failed" },
      { status: 400 }
    );
  }
}
