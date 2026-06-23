import { promises as fs } from "node:fs";
import { join } from "node:path";
import type { TradeRow } from "../shared";

const root = process.cwd();
const dataDir = join(root, "data");
const filePath = join(dataDir, "runtime-trades.json");

async function ensureDir() { await fs.mkdir(dataDir, { recursive: true }); }
async function readAll(): Promise<TradeRow[]> {
  try { return JSON.parse(await fs.readFile(filePath, "utf8")) as TradeRow[]; } catch { return []; }
}
async function writeAll(rows: TradeRow[]) {
  await ensureDir();
  await fs.writeFile(filePath, JSON.stringify(rows, null, 2));
}

export async function listRuntimeTrades() { return readAll(); }

export async function listRuntimeTradesByPool(poolAddress: string) {
  return (await readAll()).filter((row) => row.pool_address === poolAddress).sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));
}

export async function upsertRuntimeTrade(row: TradeRow) {
  const rows = (await readAll()).filter((item) => item.tx_hash !== row.tx_hash);
  rows.push(row);
  await writeAll(rows);
}
