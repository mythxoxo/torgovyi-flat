import { Address } from "@ton/core";
import { NextResponse, type NextRequest } from "next/server";
import { getIndexedToken, upsertTokenRow, upsertTradeRow } from "../../../../../lib/server/indexer-store";
import type { TokenRow } from "../../../../../lib/shared";

const TOKENS_PER_TON = 1_000_000;
const BUY_GAS_TON = 0.02;
const TX_PROOF_RE = /^[A-Za-z0-9_+=:/.-]{8,5000}$/;

type RouteContext = { params: Promise<{ id: string }> };

const json = (body: unknown, status = 200) => NextResponse.json(body, { status });
const nowIso = () => new Date().toISOString();
const toNumber = (value: string | number | null | undefined) => Number(value ?? 0);

const parseAddress = (value: unknown, field: string) => {
  if (typeof value !== "string" || !value.trim()) throw new Error(`${field} is required`);
  return Address.parse(value.trim()).toString({ bounceable: true, testOnly: false });
};

const parsePositiveNumber = (value: unknown, field: string, max: number) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0 || numeric > max) throw new Error(`${field} must be a positive number`);
  return numeric;
};

const optionalProof = (value: unknown) => {
  if (value == null || value === "") return undefined;
  if (typeof value !== "string") throw new Error("tx proof must be a string");
  const text = value.trim();
  if (!TX_PROOF_RE.test(text)) throw new Error("tx proof format is invalid");
  return text.slice(0, 5000);
};

const estimateTokensOut = (grossTon: number) => Math.max(0, Math.floor(Math.max(0, grossTon - BUY_GAS_TON) * TOKENS_PER_TON));

const mapStatus = (collectedTon: number, targetTon: number) => targetTon > 0 && collectedTon >= targetTon ? "GRADUATED_READY" : "BONDING";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json().catch(() => ({} as Record<string, unknown>));
    const wallet = parseAddress(body.wallet, "wallet");
    const tonAmount = parsePositiveNumber(body.tonAmount, "tonAmount", 100000);
    const txProof = optionalProof(body.txHash) || `pending:${wallet}:${Date.now()}`;
    const tokenId = decodeURIComponent(id);
    const row = await getIndexedToken(tokenId);
    if (!row) return json({ ok: false, error: "token not found" }, 404);
    if (!row.pool_address || row.pool_address.startsWith("pending:")) return json({ ok: false, error: "pool not ready" }, 409);
    if (row.status !== "BONDING") return json({ ok: false, error: "token is not bonding" }, 409);

    const tokensOut = estimateTokensOut(tonAmount);
    if (tokensOut <= 0) return json({ ok: false, error: "buy amount too small" }, 400);

    const collectedTon = toNumber(row.collected_ton) + Math.max(0, tonAmount - BUY_GAS_TON);
    const soldTokens = toNumber(row.sold_tokens) + tokensOut;
    const targetTon = toNumber(row.target_ton);
    const updatedAt = nowIso();
    const updatedRow: TokenRow = {
      ...row,
      collected_ton: collectedTon,
      sold_tokens: soldTokens,
      status: mapStatus(collectedTon, targetTon),
      updated_at: updatedAt
    };

    await upsertTokenRow(updatedRow);
    await upsertTradeRow({
      pool_address: row.pool_address,
      buyer: wallet,
      ton_amount: tonAmount,
      token_amount: tokensOut,
      tx_hash: txProof,
      lt: null,
      created_at: updatedAt
    });

    return json({
      ok: true,
      pending: true,
      tokenId,
      wallet,
      tokensOut,
      collectedTon,
      soldTokens,
      status: updatedRow.status,
      message: "Wallet buy accepted. UI state updated and later indexer reconciliation can confirm on-chain."
    });
  } catch (error) {
    return json({ ok: false, error: error instanceof Error ? error.message : "buy failed" }, 400);
  }
}
