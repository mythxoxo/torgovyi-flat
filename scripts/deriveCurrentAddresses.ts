import { existsSync, readFileSync } from 'node:fs';
import { beginCell, contractAddress, toNano } from '@ton/core';
import { mnemonicToPrivateKey } from '@ton/crypto';
import { WalletContractV5R1 } from '@ton/ton';
import { LPLock } from '../build/lp-lock/LPLock_LPLock';
import { JettonMinter } from '../build/jetton-minter/JettonMinter_JettonMinter';
import { LaunchpadPool } from '../build/launchpad-pool/LaunchpadPool_LaunchpadPool';

function loadLocalEnv(path: string) {
  if (!existsSync(path)) return;
  const content = readFileSync(path, 'utf8');
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq);
    const value = trimmed.slice(eq + 1);
    if (!process.env[key]) process.env[key] = value;
  }
}

loadLocalEnv('.env.local');
loadLocalEnv('.env.production');

async function main() {
  const mnemonic = process.env.DEPLOYER_MNEMONIC || process.env.TONS_OF_GRAM_DEPLOYER_MNEMONIC;
  if (!mnemonic) throw new Error('DEPLOYER_MNEMONIC is required');

  const keyPair = await mnemonicToPrivateKey(mnemonic.split(' '));
  const wallet = WalletContractV5R1.create({ publicKey: keyPair.publicKey });
  const creator = wallet.address;

  const lpLock = await LPLock.fromInit(creator, 0n, true);
  const jetton = await JettonMinter.fromInit(0n, creator, beginCell().endCell(), creator, false);
  const pool = await LaunchpadPool.fromInit(creator, jetton.address, lpLock.address, toNano('5'));

  console.log(JSON.stringify({
    wallet: wallet.address.toString({ bounceable: true, testOnly: false }),
    jetton: jetton.address.toString({ bounceable: true, testOnly: false }),
    jettonDerived: contractAddress(0, jetton.init!).toString({ bounceable: true, testOnly: false }),
    lpLock: lpLock.address.toString({ bounceable: true, testOnly: false }),
    lpLockDerived: contractAddress(0, lpLock.init!).toString({ bounceable: true, testOnly: false }),
    pool: pool.address.toString({ bounceable: true, testOnly: false }),
    poolDerived: contractAddress(0, pool.init!).toString({ bounceable: true, testOnly: false })
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
