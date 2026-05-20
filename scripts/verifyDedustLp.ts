export {};
const args = process.argv.slice(2);
const i = args.indexOf('--pool');
const pool = i >= 0 ? args[i+1] : undefined;
if (!pool) throw new Error('--pool is required');
console.log(JSON.stringify({ ok: false, status: 'NOT VERIFIED', dex: 'dedust', pool, reason: 'no live LP proof supplied' }, null, 2));
