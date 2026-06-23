import { upsertListingIntent } from "../src/lib/server/listing-store";

const args = process.argv.slice(2);
const pick = (flag: string) => {
  const i = args.indexOf(flag);
  return i >= 0 ? args[i + 1] : undefined;
};

const pool = pick("--pool");
const jetton = pick("--jetton");
const creator = pick("--creator");
const dex = pick("--dex") || "dedust";

if (!pool) throw new Error("--pool is required");
if (!jetton) throw new Error("--jetton is required");
if (!creator) throw new Error("--creator is required");
if (dex !== "dedust") throw new Error("only --dex dedust is supported");

const now = new Date().toISOString();

upsertListingIntent({
  poolAddress: pool,
  jettonAddress: jetton,
  ownerWallet: creator,
  targetDex: "dedust",
  expectedPair: { base: "TON", quote: jetton },
  tonAmount: "0",
  jettonAmount: "0",
  status: "not_ready",
  createdAt: now,
  updatedAt: now,
  reason: "manual listing intent created"
}).then(() => {
  console.log(JSON.stringify({ ok: true, pool, jetton, creator, dex }, null, 2));
  process.exit(0);
}).catch((error) => {
  console.error(error);
  process.exit(1);
});
