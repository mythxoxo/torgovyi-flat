import type { ListingRow, TokenRow, TradeRow } from "../shared";
import { ensureSchema, getDb } from "./db";

const isDbConfigured = () => Boolean(process.env.DATABASE_URL);

export const listIndexedTokens = async (filter = "trending"): Promise<TokenRow[]> => {
  if (!isDbConfigured()) return [];
  await ensureSchema();
  const db = getDb();

  const orderBy =
    filter === "new"
      ? "created_at DESC"
      : filter === "almost-graduated"
        ? "(collected_ton / NULLIF(target_ton, 0)) DESC, updated_at DESC"
        : filter === "graduated"
          ? "updated_at DESC"
          : filter === "top-volume"
            ? "sold_tokens DESC, updated_at DESC"
            : "updated_at DESC";

  const where =
    filter === "graduated"
      ? "WHERE status IN ('GRADUATED_READY', 'LISTED')"
      : filter === "almost-graduated"
        ? "WHERE status = 'BONDING'"
        : "";

  const { rows } = await db.query<TokenRow>(`
    SELECT * FROM tokens
    ${where}
    ORDER BY ${orderBy}
    LIMIT 100
  `);

  return rows;
};

export const getIndexedToken = async (poolAddress: string): Promise<TokenRow | null> => {
  if (!isDbConfigured()) return null;
  await ensureSchema();
  const db = getDb();
  const { rows } = await db.query<TokenRow>(`SELECT * FROM tokens WHERE pool_address = $1 LIMIT 1`, [poolAddress]);
  return rows[0] || null;
};

export const getTradesByPool = async (poolAddress: string): Promise<TradeRow[]> => {
  if (!isDbConfigured()) return [];
  await ensureSchema();
  const db = getDb();
  const { rows } = await db.query<TradeRow>(`SELECT * FROM trades WHERE pool_address = $1 ORDER BY created_at DESC LIMIT 100`, [poolAddress]);
  return rows;
};

export const upsertTokenRow = async (row: TokenRow) => {
  if (!isDbConfigured()) throw new Error("db write mode requires DATABASE_URL");
  await ensureSchema();
  const db = getDb();
  await db.query(
    `
      INSERT INTO tokens (
        pool_address, jetton_address, creator, name, symbol, description, image_url,
        collected_ton, target_ton, sold_tokens, status, is_listed, lp_lock_address,
        dedust_pool_address, created_at, updated_at
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16
      )
      ON CONFLICT (pool_address) DO UPDATE SET
        jetton_address = EXCLUDED.jetton_address,
        creator = EXCLUDED.creator,
        name = EXCLUDED.name,
        symbol = EXCLUDED.symbol,
        description = EXCLUDED.description,
        image_url = EXCLUDED.image_url,
        collected_ton = EXCLUDED.collected_ton,
        target_ton = EXCLUDED.target_ton,
        sold_tokens = EXCLUDED.sold_tokens,
        status = EXCLUDED.status,
        is_listed = EXCLUDED.is_listed,
        lp_lock_address = EXCLUDED.lp_lock_address,
        dedust_pool_address = EXCLUDED.dedust_pool_address,
        updated_at = EXCLUDED.updated_at
    `,
    [
      row.pool_address,
      row.jetton_address,
      row.creator,
      row.name,
      row.symbol,
      row.description,
      row.image_url,
      row.collected_ton,
      row.target_ton,
      row.sold_tokens,
      row.status,
      row.is_listed,
      row.lp_lock_address,
      row.dedust_pool_address,
      row.created_at,
      row.updated_at
    ]
  );
};

export const upsertTradeRow = async (row: TradeRow) => {
  if (!isDbConfigured()) throw new Error("db write mode requires DATABASE_URL");
  await ensureSchema();
  const db = getDb();
  await db.query(
    `
      INSERT INTO trades (pool_address, buyer, ton_amount, token_amount, tx_hash, lt, created_at)
      VALUES ($1,$2,$3,$4,$5,$6,$7)
      ON CONFLICT (tx_hash) DO NOTHING
    `,
    [row.pool_address, row.buyer, row.ton_amount, row.token_amount, row.tx_hash, row.lt, row.created_at]
  );
};

export const upsertListingRow = async (row: ListingRow) => {
  if (!isDbConfigured()) throw new Error("db write mode requires DATABASE_URL");
  await ensureSchema();
  const db = getDb();
  await db.query(
    `
      INSERT INTO listings (
        pool_address, jetton_address, ton_amount, jetton_amount, lp_lock_address,
        dedust_tx_hash, status, error, created_at, updated_at
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      ON CONFLICT (dedust_tx_hash) DO UPDATE SET
        status = EXCLUDED.status,
        error = EXCLUDED.error,
        updated_at = EXCLUDED.updated_at
    `,
    [
      row.pool_address,
      row.jetton_address,
      row.ton_amount,
      row.jetton_amount,
      row.lp_lock_address,
      row.dedust_tx_hash,
      row.status,
      row.error,
      row.created_at,
      row.updated_at
    ]
  );
};
