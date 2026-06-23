import { existsSync, readFileSync } from 'node:fs';
import { Address, fromNano } from '@ton/ton';
import { TonClient } from '@ton/ton';

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
  const addr = process.argv[2];
  if (!addr) throw new Error('Usage: tsx scripts/inspectRecentTx.ts <address>');
  const endpoint = process.env.TONCENTER_API_KEY ? `https://toncenter.com/api/v2/jsonRPC?api_key=${process.env.TONCENTER_API_KEY}` : 'https://toncenter.com/api/v2/jsonRPC';
  const client = new TonClient({ endpoint });
  const txs = await client.getTransactions(Address.parse(addr), { limit: 5 });
  console.log(JSON.stringify(txs.map((tx:any)=>({
    lt: tx.lt?.toString?.() || tx.lt,
    now: tx.now,
    oldStatus: tx.oldStatus,
    endStatus: tx.endStatus,
    inMsg: tx.inMessage ? {
      src: tx.inMessage.info.src ? tx.inMessage.info.src.toString() : null,
      dest: tx.inMessage.info.dest ? tx.inMessage.info.dest.toString() : null,
      value: 'value' in tx.inMessage.info ? String(tx.inMessage.info.value?.coins || 0n) : null,
      bounced: 'bounced' in tx.inMessage.info ? tx.inMessage.info.bounced : null,
      type: tx.inMessage.info.type
    } : null,
    outMsgs: tx.outMessages.values().map((m:any)=>({
      dest: m.info.dest ? m.info.dest.toString() : null,
      value: 'value' in m.info ? String(m.info.value?.coins || 0n) : null,
      bounced: 'bounced' in m.info ? m.info.bounced : null,
      type: m.info.type
    }))
  })), null, 2));
}
main().catch(e=>{console.error(e);process.exit(1);});
