import { resolveDedustBuyRoute } from '../src/lib/dex/dedust/route';

async function main() {
  const tokenAddress = process.argv[2] || 'EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c';
  const route = await resolveDedustBuyRoute(tokenAddress);
  if (!route.status) throw new Error('missing route status');
  console.log(`PASS ${route.status}`);
  console.log(JSON.stringify({ ok: true, route }, null, 2));
}

main().catch((error) => { console.error(error); process.exit(1); });
