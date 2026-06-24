import { promises as fs } from "node:fs";
import { join } from "node:path";

export type ListingIntent = {
  poolAddress: string;
  jettonAddress: string;
  ownerWallet: string;
  liquidityWallet?: string;
  targetDex: "dedust";
  expectedPair: { base: "TON"; quote: string };
  tonAmount: string;
  jettonAmount: string;
  status: "not_ready" | "payload_ready" | "submitted_by_user" | "verification_pending" | "verified" | "failed";
  createdAt: string;
  updatedAt: string;
  txHash?: string;
  dedustPoolAddress?: string;
  reason?: string;
};

const root = process.cwd();
const dataDir = join(root, "data");
const filePath = join(dataDir, "listing-intents.json");

async function ensureDir() {
  await fs.mkdir(dataDir, { recursive: true });
}

async function readAll(): Promise<ListingIntent[]> {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    const parsed = JSON.parse(raw) as ListingIntent[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeAll(rows: ListingIntent[]) {
  await ensureDir();
  await fs.writeFile(filePath, JSON.stringify(rows, null, 2));
}

export async function upsertListingIntent(intent: ListingIntent) {
  const rows = await readAll();
  const next = rows.filter((row) => row.poolAddress !== intent.poolAddress);
  next.push(intent);
  await writeAll(next);
}

export async function getListingIntent(poolAddress: string) {
  const rows = await readAll();
  return rows.find((row) => row.poolAddress === poolAddress) || null;
}

export async function ensureListingIntent(intent: ListingIntent) {
  const existing = await getListingIntent(intent.poolAddress);
  if (existing) return existing;
  await upsertListingIntent(intent);
  return intent;
}
