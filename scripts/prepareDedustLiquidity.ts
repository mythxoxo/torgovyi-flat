export {};
import { prepareDedustLiquidityDraft, tonToNanoString } from '../src/lib/dex';

const args = process.argv.slice(2);
const get = (flag: string) => { const i = args.indexOf(flag); return i >= 0 ? args[i+1] : undefined; };
const jetton = get('--jetton');
const pool = get('--pool') || 'EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c';
const amountTon = get('--amount-ton') || '0.05';
const amountJetton = get('--amount-jetton') || '1000';
const slippageBps = Number(get('--slippage-bps') || '500');

if (!jetton) throw new Error('--jetton is required');
const tx = prepareDedustLiquidityDraft({ jettonMaster: jetton, pool, tonAmountNano: tonToNanoString(amountTon), tokenAmount: amountJetton, slippageBps });
console.log(JSON.stringify(tx, null, 2));
