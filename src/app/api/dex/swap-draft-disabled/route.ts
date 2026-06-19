import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      ok: false,
      error: "DEX transaction draft endpoint is disabled until final route audit passes."
    },
    { status: 403 }
  );
}
