import { existsSync, readFileSync } from "node:fs";
import { beginCell, contractAddress, toNano } from "@ton/core";
import { mnemonicToPrivateKey } from "@ton/crypto";
import { TonClient, WalletContractV5R1 } from "@ton/ton";
import { LPLock } from "../build/lp-lock/LPLock_LPLock";
import { JettonMinter } from "../build/jetton-minter/JettonMinter_JettonMinter";
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
  : 'https://toncenter.com/api/v2/jsonRPC';

async function main() {
  const kind = process.argv[2];
  if (!kind || !['jetton', 'lplock', 'pool'].includes(kind)) throw new Error('Pass kind: jetton | lplock | pool');
  const mnemonic = process.env.DEPLOYER_MNEMONIC || process.env.TONK_MEM_DEPLOYER_MNEMONIC;
  if (!mnemonic) throw new Error('DEPLOYER_MNEMONIC is required');

  const keyPair = await mnemonicToPrivateKey(mnemonic.split(' '));
  const client = new TonClient({ endpoint });
  const wallet = WalletContractV5R1.create({ publicKey: keyPair.publicKey });
  const opened = client.open(wallet);
  const sender = opened.sender(keyPair.secretKey);
  const creatorAddr = opened.address;

  const lpLock = await LPLock.fromInit(creatorAddr, 0n, true);
  const jetton = await JettonMinter.fromInit(0n, creatorAddr, beginCell().endCell(), creatorAddr, false);
  const pool = await LaunchpadPool.fromInit(creatorAddr, jetton.address, lpLock.address, toNano('5'));

  const target = kind === 'jetton'
    ? { init: jetton.init!, address: jetton.address, value: '0.15' }
    : kind === 'lplock'
      ? { init: lpLock.init!, address: lpLock.address, value: '0.10' }
      : { init: pool.init!, address: pool.address, value: '0.15' };

  await sender.send({
    to: contractAddress(0, target.init),
    value: toNano(target.value),
    init: target.init,
    body: beginCell().endCell(),
    bounce: false
  });

  console.log(JSON.stringify({
    ok: true,
    kind,
    wallet: opened.address.toString({ bounceable: true, testOnly: false }),
    address: target.address.toString({ bounceable: true, testOnly: false }),
    value: target.value
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
