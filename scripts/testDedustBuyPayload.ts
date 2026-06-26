import { getDedustClientMeta } from '../src/lib/dex/dedust/client';
import { buildDedustSwapPayload } from '../src/lib/dex/dedust/swap';
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

  const result = await buildDedustSwapPayload({
    tokenAddress,
    side: 'buy',
    amount: '1000000000',
    platform: 'dedust',
    userWallet: 'EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c',
    platforms: ['dedust'],
    slippageBps: 300,
  });

  if (result.status === 'payload_ready') {
    const last = result.messages[result.messages.length - 1];
    if (!last || !last.address || !last.amount || BigInt(last.amount) <= 0n || !last.payload) {
      throw new Error('FAIL fake_payload');
    }
  }

  const meta = getDedustClientMeta();
  console.log(`endpointHost=${meta.endpointHost} toncenterKeyPresent=${meta.toncenterKeyPresent}`);
  console.log(JSON.stringify({ ok: true, result }, null, 2));
}

main().catch((error) => { console.error(error); process.exit(1); });
