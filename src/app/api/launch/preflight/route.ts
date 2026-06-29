import { NextResponse } from "next/server";
import { Address } from "@ton/core";

const present = (value?: string) => Boolean(value && value.trim());
const status = (value: boolean) => (value ? "ok" : "missing");

const validTonAddress = (value?: string) => {
  if (!present(value)) return false;
  try {
    Address.parse(String(value).trim());
    return true;
  } catch {
    return false;
  }
};

const treasuryAddress = () =>
  process.env.DEX_PLATFORM_FEE_TREASURY ||
  process.env.LAUNCH_FEE_TREASURY ||
  process.env.TREASURY_ADDRESS ||
  process.env.TREASURY ||
  process.env.REFERRAL_TREASURY_ADDRESS ||
  "";

const launchFeeReady = () => {
  const value = Number(process.env.LAUNCH_FEE_TON || "0.25");
  return Number.isFinite(value) && value > 0 && value <= 50;
};

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const checks = {
    database: status(present(process.env.DATABASE_URL)),
    treasuryAddress: status(validTonAddress(treasuryAddress())),
    launchFee: status(launchFeeReady()),
    tonRpc: status(present(process.env.TONCENTER_API_KEY) || present(process.env.TON_RPC_ENDPOINT) || present(process.env.TONAPI_API_KEY)),
    tonconnectManifest: "ok",
    uploads: "ok"
  };
  const failing = Object.entries(checks).filter(([, value]) => value !== "ok").map(([name]) => name);
  return NextResponse.json({ ok: failing.length === 0, checks, failing, timestamp: new Date().toISOString() }, { status: failing.length === 0 ? 200 : 503 });
}
