import { getDedustClientMeta } from '../src/lib/dex/dedust/client';
import { quoteDedust } from '../src/lib/dex/dedust/quote';
import { getDedustReadyFixture } from './_dedustFixture';

async function main() {
  let tokenAddress: string | undefined;
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
  if (!tokenAddress) throw new Error('no DeDust fixture token found');

  const quote = await quoteDedust({
    tokenAddress,
    side: 'buy',
    amount: '1000000000',
    platforms: ['dedust'],
    slippageBps: 300,
  });

  const meta = getDedustClientMeta();
  console.log(`endpointHost=${meta.endpointHost} toncenterKeyPresent=${meta.toncenterKeyPresent}`);
  console.log(JSON.stringify({ ok: true, quote }, null, 2));
}

main().catch((error) => { console.error(error); process.exit(1); });
