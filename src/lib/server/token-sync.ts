import type { TokenRow } from "../shared";
import { getIndexedToken, upsertTokenRow } from "./indexer-store";
import { getPoolState } from "./chain";

const isoNow = () => new Date().toISOString();

export const syncTokenRowFromChain = async (tokenId: string): Promise<TokenRow | null> => {
  const row = await getIndexedToken(tokenId);
  if (!row) return null;
  if (!row.pool_address || row.pool_address.startsWith("pending:")) return row;

  const state = await getPoolState(row.pool_address);
  const synced: TokenRow = {
    ...row,
    pool_address: state.poolAddress,
    jetton_address: state.jettonMaster || row.jetton_address,
    creator: state.creator || row.creator,
    collected_ton: state.collectedTon,
    target_ton: state.targetTon,
    sold_tokens: state.soldTokens,
    status: state.isListed ? "LISTED" : state.isGraduated ? "GRADUATED_READY" : "BONDING",
    is_listed: state.isListed,
    lp_lock_address: state.lpLock || row.lp_lock_address,
    updated_at: isoNow()
  };

  await upsertTokenRow(synced);
  return synced;
};
