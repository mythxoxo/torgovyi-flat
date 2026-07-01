import { existsSync, readFileSync } from "node:fs";
import { beginCell, contractAddress, SendMode, toNano } from "@ton/core";
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
  const mnemonic = process.env.DEPLOYER_MNEMONIC || process.env.TONS_OF_GRAM_DEPLOYER_MNEMONIC;
  if (!mnemonic) throw new Error('DEPLOYER_MNEMONIC is required');

  const creator = process.env.TONS_OF_GRAM_DEPLOYER_ADDRESS || process.env.FACTORY_OWNER_ADDRESS;
  if (!creator) throw new Error('creator address env missing');

  const creatorAddr = WalletContractV5R1.create({ workchain: 0, publicKey: (await mnemonicToPrivateKey(mnemonic.split(' '))).publicKey }).address;
  const lpLock = await LPLock.fromInit(creatorAddr, 0n, true);
  const jetton = await JettonMinter.fromInit(0n, creatorAddr, beginCell().endCell(), creatorAddr, false);
  const pool = await LaunchpadPool.fromInit(creatorAddr, jetton.address, lpLock.address, toNano('5'));

  const keyPair = await mnemonicToPrivateKey(mnemonic.split(' '));
  const client = new TonClient({ endpoint });
  const wallet = WalletContractV5R1.create({ publicKey: keyPair.publicKey });
  const opened = client.open(wallet);
  const seqno = await opened.getSeqno();

  const mkDeploy = (init: { code: any; data: any }, value: string) => ({
    info: {
      type: 'internal' as const,
      dest: contractAddress(0, init),
      value: { coins: toNano(value) },
      bounce: false,
      ihrDisabled: true,
      bounced: false,
      ihrFee: 0n,
      forwardFee: 0n,
      createdAt: 0,
      createdLt: 0n
    },
    init,
    body: beginCell().endCell()
  });

  await opened.sendTransfer({
    secretKey: keyPair.secretKey,
    seqno,
    messages: [
      mkDeploy(jetton.init!, '0.2'),
      mkDeploy(lpLock.init!, '0.12'),
      mkDeploy(pool.init!, '0.18')
    ],
    sendMode: SendMode.PAY_GAS_SEPARATELY + SendMode.IGNORE_ERRORS
  });

  console.log(JSON.stringify({
    ok: true,
    seqno,
    wallet: opened.address.toString({ bounceable: true, testOnly: false }),
    jetton: jetton.address.toString({ bounceable: true, testOnly: false }),
    lpLock: lpLock.address.toString({ bounceable: true, testOnly: false }),
    pool: pool.address.toString({ bounceable: true, testOnly: false })
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
