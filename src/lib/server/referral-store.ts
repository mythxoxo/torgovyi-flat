import { promises as fs } from "node:fs";
import { join } from "node:path";

export type ReferralBinding = {
  wallet: string;
  code: string;
  referredByWallet: string;
  createdAt: string;
};

export type ClaimState = "not_eligible" | "pending" | "claimable" | "payload_ready" | "verification_pending" | "claimed" | "failed";

export type ReferralAccounting = {
  wallet: string;
  earnedTon: number;
  claimableTon: number;
  claimedTon: number;
  status: ClaimState;
  updatedAt: string;
  rewardedTradeIds?: string[];
};

export type ClaimRequestRow = {
  wallet: string;
  type: "creator" | "referral" | "refund";
  tokenId?: string;
  status: ClaimState;
  createdAt: string;
  updatedAt: string;
  amountTon?: number;
  txHash?: string;
  reason?: string;
};

const root = process.cwd();
const dataDir = join(root, "data");
const bindingsPath = join(dataDir, "referral-bindings.json");
const accountingPath = join(dataDir, "referral-accounting.json");
const claimsPath = join(dataDir, "claim-requests.json");

async function ensureDir() { await fs.mkdir(dataDir, { recursive: true }); }
async function readJson<T>(path: string, fallback: T): Promise<T> {
  try { return JSON.parse(await fs.readFile(path, "utf8")) as T; } catch { return fallback; }
}
async function writeJson(path: string, value: unknown) {
  await ensureDir();
  await fs.writeFile(path, JSON.stringify(value, null, 2));
}

export const listReferralBindings = () => readJson<ReferralBinding[]>(bindingsPath, []);
export const listReferralAccounting = () => readJson<ReferralAccounting[]>(accountingPath, []);
export const listClaimRequests = () => readJson<ClaimRequestRow[]>(claimsPath, []);

export async function findReferralBindingByWallet(wallet: string) {
  return (await listReferralBindings()).find((row) => row.wallet === wallet) || null;
}

export async function findReferralBindingByCode(code: string) {
  return (await listReferralBindings()).find((row) => row.code === code) || null;
}

export async function upsertReferralBinding(row: ReferralBinding) {
  const rows = (await listReferralBindings()).filter((item) => item.wallet !== row.wallet && item.code !== row.code);
  rows.push(row);
  await writeJson(bindingsPath, rows);
}

export async function getReferralAccounting(wallet: string) {
  return (await listReferralAccounting()).find((row) => row.wallet === wallet) || null;
}

export async function upsertReferralAccounting(row: ReferralAccounting) {
  const rows = (await listReferralAccounting()).filter((item) => item.wallet !== row.wallet);
  rows.push(row);
  await writeJson(accountingPath, rows);
}

export async function upsertClaimRequest(row: ClaimRequestRow) {
  const rows = (await listClaimRequests()).filter((item) => !(item.wallet === row.wallet && item.type === row.type && item.tokenId === row.tokenId));
  rows.push(row);
  await writeJson(claimsPath, rows);
}
