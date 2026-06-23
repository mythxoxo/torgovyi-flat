import { existsSync, readFileSync } from 'node:fs';
import { mnemonicToPrivateKey } from '@ton/crypto';
import { TonClient, WalletContractV5R1 } from '@ton/ton';

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

async function main() {
  const mnemonic = process.env.TONK_MEM_DEPLOYER_MNEMONIC!;
  const keyPair = await mnemonicToPrivateKey(mnemonic.split(' '));
  const wallet = WalletContractV5R1.create({ publicKey: keyPair.publicKey });
  const endpoint = `https://toncenter.com/api/v2/jsonRPC?api_key=${process.env.TONCENTER_API_KEY}`;
  const client = new TonClient({ endpoint });
  const state = await client.getContractState(wallet.address);
  console.log(JSON.stringify({
    address: wallet.address.toString({ bounceable: true, testOnly: false }),
    balance: state.balance.toString(),
    state: state.state
  }, null, 2));
}

main().catch((e) => { console.error(e); process.exit(1); });
