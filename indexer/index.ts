import { getFactoryPoolAddress, getFactoryPoolCount, getPoolState, getRecentTransactions } from "../src/lib/server/chain";
import { getIndexedToken, upsertTokenRow, upsertTradeRow } from "../src/lib/server/indexer-store";
import { accrueReferralRewardsFromTrades } from "../src/lib/server/referral-accrual";
import type { TokenRow, TradeRow } from "../src/lib/shared";

const FACTORY = process.env.NEXT_PUBLIC_FACTORY_ADDRESS || "";
const isoNow = () => new Date().toISOString();
type TradeKind = "buy" | "sell" | "migration" | "claim" | "unknown";
type IndexedTrade = TradeRow & { kind: TradeKind; reason: string };

const asText = (value: unknown): string => {
  if (!value) return "";
  if (typeof value === "string") return value;
  const fn = (value as { toString?: () => string }).toString;
  return typeof fn === "function" ? fn.call(value) : "";
};

const classifyTx = (tx: any, poolAddress: string): { kind: TradeKind; reason: string } => {
  const src = asText(tx?.inMessage?.info?.src);
  const dest = asText(tx?.inMessage?.info?.dest) || poolAddress;
  const outMessages = Array.isArray(tx?.outMessages) ? tx.outMessages : [];
  if (src && dest === poolAddress && outMessages.length > 0) {
    return { kind: "buy", reason: "inbound TON to launch pool with outgoing messages" };
  }
  if (src && outMessages.some((msg: any) => asText(msg?.info?.dest) === poolAddress)) {
    return { kind: "sell", reason: "message set references launch pool" };
  }
  return { kind: "unknown", reason: "insufficient tx shape for reliable classification" };
};

const estimateTokenAmount = (state: Awaited<ReturnType<typeof getPoolState>>, tonNano: number) => {
  const collected = Number(state.collectedTon);
  const sold = Number(state.soldTokens);
  if (!(collected > 0) || !(sold > 0) || !(tonNano > 0)) return 0;
  return Math.max(1, Math.floor((tonNano / collected) * sold));
};

const toTradeRow = (poolAddress: string, state: Awaited<ReturnType<typeof getPoolState>>, tx: any): IndexedTrade | null => {
  const src = asText(tx?.inMessage?.info?.src) || tx?.inMessage?.info?.src?.address || null;
  const value = tx?.inMessage?.info?.value?.coins ?? tx?.inMessage?.info?.value ?? null;
  const hash = tx?.hash ? Buffer.from(tx.hash).toString("hex") : null;
  const lt = tx?.lt ? String(tx.lt) : null;
  const now = tx?.now ? new Date(Number(tx.now) * 1000).toISOString() : isoNow();
  if (!src || !value || !hash) return null;
  const tonAmount = String(value);
  const numericTon = Number(tonAmount);
  if (!Number.isFinite(numericTon) || numericTon <= 0) return null;
  const classified = classifyTx(tx, poolAddress);
  return {
    pool_address: poolAddress,
    buyer: String(src),
    ton_amount: tonAmount,
    token_amount: classified.kind === "buy" ? estimateTokenAmount(state, numericTon) : 0,
    tx_hash: hash,
    lt,
    created_at: now,
    ...classified
  };
};

const toTokenRow = (state: Awaited<ReturnType<typeof getPoolState>>, current?: TokenRow | null): TokenRow => ({
  pool_address: state.poolAddress,
  jetton_address: state.jettonMaster,
  creator: state.creator,
  name: current?.name || `Token ${state.poolAddress.slice(0, 6)}`,
  symbol: current?.symbol || "TONK",
  description: current?.description || "Indexed launch without custom description",
  image_url: current?.image_url || null,
  collected_ton: state.collectedTon,
  target_ton: state.targetTon,
  sold_tokens: state.soldTokens,
  status: state.isListed ? "LISTED" : state.isGraduated ? "GRADUATED_READY" : "BONDING",
  is_listed: state.isListed,
  lp_lock_address: state.lpLock,
  dedust_pool_address: current?.dedust_pool_address || null,
  created_at: current?.created_at || isoNow(),
  updated_at: isoNow()
});

export const runIndexer = async () => {
  if (!FACTORY) throw new Error("NEXT_PUBLIC_FACTORY_ADDRESS is required for indexer");
  const logs: string[] = [];
  const skipped: string[] = [];
  const poolCount = await getFactoryPoolCount(FACTORY);
  let processed = 0;
  let indexedTx = 0;
  let classifiedBuys = 0;
  let classifiedSells = 0;
  let classifiedClaims = 0;
  let classifiedMigrations = 0;
  let classifiedUnknown = 0;
  let referralAccrued = 0;

  for (let index = 0; index < poolCount; index += 1) {
    const poolAddress = await getFactoryPoolAddress(FACTORY, index);
    if (poolAddress === FACTORY) {
      skipped.push(`skip self factory address at index ${index}`);
      continue;
    }
    const current = await getIndexedToken(poolAddress);
    const state = await getPoolState(poolAddress);
    await upsertTokenRow(toTokenRow(state, current));
    processed += 1;
    logs.push(`indexed launch ${poolAddress}`);
    const buyTrades: IndexedTrade[] = [];
    try {
      const txs = await getRecentTransactions(poolAddress, 20);
      for (const tx of txs) {
        const trade = toTradeRow(poolAddress, state, tx);
        if (!trade) {
          skipped.push(`skip tx ${tx?.lt || "unknown"}: cannot derive source/value/hash`);
          continue;
        }
        if (trade.kind === "buy") { classifiedBuys += 1; buyTrades.push(trade); }
        else if (trade.kind === "sell") classifiedSells += 1;
        else if (trade.kind === "claim") classifiedClaims += 1;
        else if (trade.kind === "migration") classifiedMigrations += 1;
        else { classifiedUnknown += 1; skipped.push(`tx ${trade.tx_hash}: ${trade.reason}`); }
        await upsertTradeRow(trade);
        indexedTx += 1;
      }
      const rewards = await accrueReferralRewardsFromTrades(buyTrades);
      referralAccrued += rewards.filter((row) => row.accrued).length;
    } catch (error) {
      skipped.push(`pool ${poolAddress}: tx fetch/index failed: ${error instanceof Error ? error.message : "unknown"}`);
    }
  }

  return { ok: true, processed, poolCount, indexedTx, classifiedBuys, classifiedSells, classifiedClaims, classifiedMigrations, classifiedUnknown, referralAccrued, skipped, logs, lastSuccessfulSync: isoNow(), note: "partial live indexer: unknown data stays unknown" };
};

if (require.main === module) {
  runIndexer().then((result) => { console.log(JSON.stringify(result, null, 2)); process.exit(0); }).catch((error) => { console.error(error); process.exit(1); });
}
