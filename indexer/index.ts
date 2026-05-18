import { getFactoryPoolAddress, getFactoryPoolCount, getPoolState } from "../src/lib/server/chain";
import { getIndexedToken, upsertTokenRow } from "../src/lib/server/indexer-store";
import type { TokenRow } from "../src/lib/shared";

const FACTORY = process.env.NEXT_PUBLIC_FACTORY_ADDRESS || "";
const isoNow = () => new Date().toISOString();

const toTokenRow = (state: Awaited<ReturnType<typeof getPoolState>>, current?: TokenRow | null): TokenRow => ({
  pool_address: state.poolAddress,
  jetton_address: state.jettonMaster,
  creator: state.creator,
  name: current?.name || `Token ${state.poolAddress.slice(0, 6)}`,
  symbol: current?.symbol || "TONK",
  description: current?.description || "trades table indexing pending",
  image_url: current?.image_url || null,
  collected_ton: state.collectedTon,
  target_ton: state.targetTon,
  sold_tokens: state.soldTokens,
  status: state.isListed ? "LISTED" : state.isGraduated ? "GRADUATED_READY" : "BONDING",
  is_listed: state.isListed,
  lp_lock_address: state.lpLock,
  stonfi_pool_address: current?.stonfi_pool_address || null,
  created_at: current?.created_at || isoNow(),
  updated_at: isoNow()
});

export const runIndexer = async () => {
  if (!FACTORY) {
    throw new Error("NEXT_PUBLIC_FACTORY_ADDRESS is required for indexer");
  }

  const poolCount = await getFactoryPoolCount(FACTORY);
  let processed = 0;

  for (let index = 0; index < poolCount; index += 1) {
    const poolAddress = await getFactoryPoolAddress(FACTORY, index);
    if (poolAddress === FACTORY) {
      continue;
    }
    const current = await getIndexedToken(poolAddress);
    const state = await getPoolState(poolAddress);
    await upsertTokenRow(toTokenRow(state, current));
    processed += 1;
  }

  return { ok: true, processed, poolCount, note: "trades table indexing pending" };
};

if (require.main === module) {
  runIndexer()
    .then((result) => {
      console.log(JSON.stringify(result, null, 2));
      process.exit(0);
    })
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
