import { Address, beginCell, toNano } from "@ton/core";
import { mnemonicToPrivateKey } from "@ton/crypto";
import { TonClient, WalletContractV4 } from "@ton/ton";
import { LaunchpadPool } from "../build/launchpad-pool/LaunchpadPool_LaunchpadPool";

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

  const mnemonic = process.env.DEPLOYER_MNEMONIC;
  if (!mnemonic) throw new Error("DEPLOYER_MNEMONIC is required for --execute");

  const keyPair = await mnemonicToPrivateKey(mnemonic.split(" "));
  const wallet = WalletContractV4.create({ workchain: 0, publicKey: keyPair.publicKey });
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
