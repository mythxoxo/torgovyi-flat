import { promises as fs } from "node:fs";
import { join } from "node:path";
import type { TokenRow } from "../shared";

const root = process.cwd();
const dataDir = join(root, "data");
const tokensPath = join(dataDir, "runtime-tokens.json");

type RuntimeTokenFile = {
  tokens: TokenRow[];
};

async function ensureDir() {
  await fs.mkdir(dataDir, { recursive: true });
}

async function readFileSafe(): Promise<RuntimeTokenFile> {
  try {
    const raw = await fs.readFile(tokensPath, "utf8");
    const parsed = JSON.parse(raw) as RuntimeTokenFile;
    return { tokens: Array.isArray(parsed.tokens) ? parsed.tokens : [] };
  } catch {
    return { tokens: [] };
  }
}

async function writeFileSafe(payload: RuntimeTokenFile) {
  await ensureDir();
  await fs.writeFile(tokensPath, JSON.stringify(payload, null, 2));
}

export async function listRuntimeTokens(): Promise<TokenRow[]> {
  const file = await readFileSafe();
  return file.tokens.sort((a, b) => String(b.updated_at).localeCompare(String(a.updated_at)));
}

export async function getRuntimeToken(poolAddress: string): Promise<TokenRow | null> {
  const file = await readFileSafe();
  return file.tokens.find((token) => token.pool_address === poolAddress) || null;
}

export async function upsertRuntimeToken(row: TokenRow) {
  const file = await readFileSafe();
  const next = file.tokens.filter((token) => token.pool_address !== row.pool_address);
  next.push(row);
  await writeFileSafe({ tokens: next });
}
