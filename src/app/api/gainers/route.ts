import { NextResponse } from "next/server";
import { listLiveLaunchpadGainers } from "../../../lib/gainers/live";

export async function GET() {
  const records = await listLiveLaunchpadGainers();

  if (records.length > 0) {
    return NextResponse.json({
      ok: true,
      source: "live",
      records,
      note: "Derived from current indexed launchpad token activity."
    });
  }

  return NextResponse.json({
    ok: false,
    source: "live",
    records: [],
    note: "No live indexed launchpad activity is available yet."
  });
}
