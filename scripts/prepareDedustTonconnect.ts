import { existsSync, readFileSync } from 'node:fs';
import { prepareDedustLiquidityDraft, tonToNanoString } from '../src/lib/dex';
import { getProjectWallets } from '../src/lib/project-wallets';

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

const args = process.argv.slice(2);
const get = (flag: string) => { const i = args.indexOf(flag); return i >= 0 ? args[i+1] : undefined; };
const jetton = get('--jetton');
const pool = get('--pool');
const amountTon = get('--amount-ton') || '0.05';
const amountJetton = get('--amount-jetton') || '1000';
const slippageBps = Number(get('--slippage-bps') || '500');
const liquidityWallet = get('--liquidity-wallet') || getProjectWallets().liquidity;

if (!jetton) throw new Error('--jetton is required');
if (!pool) throw new Error('--pool is required');
if (!liquidityWallet) throw new Error('--liquidity-wallet is required or TONS_OF_GRAM_LIQUIDITY_ADDRESS must be set');

const draft = prepareDedustLiquidityDraft({
  jettonMaster: jetton,
  pool,
  creator: liquidityWallet,
  tonAmountNano: tonToNanoString(amountTon),
  tokenAmount: amountJetton,
  slippageBps
});

console.log(JSON.stringify({
  ok: true,
  kind: 'dedust-liquidity-tonconnect-prep',
  liquidityWallet,
  amountTon,
  amountJetton,
  draft: {
    validUntil: draft.validUntil,
    messages: draft.messages
  }
}, null, 2));
