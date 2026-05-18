import { NextRequest, NextResponse } from "next/server";
import { runIndexer } from "../../../../indexer/index";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const secret = process.env.INDEXER_SHARED_SECRET;
  const auth = request.headers.get("authorization") || "";

  if (secret && auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await runIndexer();
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Indexer failed" },
      { status: 500 }
    );
  }
}
