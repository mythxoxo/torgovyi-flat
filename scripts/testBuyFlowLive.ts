import { existsSync, readFileSync } from "node:fs";
import { Address, beginCell, toNano } from "@ton/core";
import { mnemonicToPrivateKey } from "@ton/crypto";
import { TonClient, WalletContractV5R1 } from "@ton/ton";
import { LaunchpadPool } from "../build/launchpad-pool/LaunchpadPool_LaunchpadPool";


function loadLocalEnv(path: string) {
  if (!existsSync(path)) return;
  const content = readFileSync(path, "utf8");
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq);
    const value = trimmed.slice(eq + 1);
    if (!process.env[key]) process.env[key] = value;
  }
}
loadLocalEnv('.env.local');
loadLocalEnv('.env.production');

const endpoint = process.env.TONCENTER_API_KEY
  ? `https://toncenter.com/api/v2/jsonRPC?api_key=${process.env.TONCENTER_API_KEY}`
  : "https://toncenter.com/api/v2/jsonRPC";

function arg(name: string) {
  const idx = process.argv.indexOf(name);
  return idx >= 0 ? process.argv[idx + 1] : undefined;
}

async function main() {
  const poolArg = arg("--pool");
  const amountArg = arg("--amount");
  const execute = process.argv.includes("--execute");
  const dryRun = process.argv.includes("--dry-run");

  if (!poolArg || !amountArg) {
    throw new Error("Usage: npm run test:buy-flow:live -- --pool <pool> --amount <small_amount> --dry-run|--execute");
  }

  const client = new TonClient({ endpoint });
  const pool = client.open(LaunchpadPool.fromAddress(Address.parse(poolArg)));
  const [collectedBefore, soldBefore, jettonMaster] = await Promise.all([
    pool.getGetCollectedTon(),
    pool.getGetSoldTokens(),
    pool.getGetJettonMaster()
  ]);

  const summary = {
    mode: dryRun ? "dry-run" : execute ? "execute" : "invalid",
    pool: poolArg,
    amountTon: amountArg,
    collectedBefore: collectedBefore.toString(),
    soldBefore: soldBefore.toString(),
    jettonMaster: jettonMaster.toString({ bounceable: true, testOnly: false })
  };

  console.log(JSON.stringify(summary, null, 2));

  if (dryRun) return;
  if (!execute) throw new Error("Pass --dry-run or --execute");

  const mnemonic = process.env.DEPLOYER_MNEMONIC || process.env.TONS_OF_GRAM_DEPLOYER_MNEMONIC;
  if (!mnemonic) throw new Error("DEPLOYER_MNEMONIC is required for --execute");

  const keyPair = await mnemonicToPrivateKey(mnemonic.split(" "));
  const wallet = WalletContractV5R1.create({ publicKey: keyPair.publicKey });
  const sender = client.open(wallet).sender(keyPair.secretKey);

  await pool.send(sender, { value: toNano(amountArg) }, {
    $$type: "Buy",
    referral: null,
    minTokensOut: 1n
  });

  const [collectedAfter, soldAfter] = await Promise.all([
    pool.getGetCollectedTon(),
    pool.getGetSoldTokens()
  ]);

  console.log(JSON.stringify({
    ok: true,
    pool: poolArg,
    collectedAfter: collectedAfter.toString(),
    soldAfter: soldAfter.toString(),
    note: "Save wallet tx hash from your wallet UI / explorer for live proof."
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
