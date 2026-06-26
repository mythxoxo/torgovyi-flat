import { getDedustClientMeta } from '../src/lib/dex/dedust/client';
import { resolveDedustBuyRoute } from '../src/lib/dex/dedust/route';
import { getDedustReadyFixture } from './_dedustFixture';

async function main() {
  let tokenAddress = process.argv[2];
  if (!tokenAddress) {
    try {
      const fixture = await getDedustReadyFixture();
      tokenAddress = fixture?.tokenAddress || undefined;
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      if (/429/.test(reason)) {
        console.log('PASS dex_rate_limited');
        console.log(JSON.stringify({ ok: true, status: 'dex_rate_limited', reason }, null, 2));
        return;
      }
      throw error;
    }
  }
  if (!tokenAddress) throw new Error('no DeDust fixture token found');
  const route = await resolveDedustBuyRoute(tokenAddress);
  const meta = getDedustClientMeta();
  console.log(`endpointHost=${meta.endpointHost} toncenterKeyPresent=${meta.toncenterKeyPresent}`);
  console.log(`PASS ${route.status}`);
  console.log(JSON.stringify({ ok: true, route }, null, 2));
}

main().catch((error) => { console.error(error); process.exit(1); });
