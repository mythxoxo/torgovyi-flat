import { Pool } from "pg";

let pool: Pool | undefined;

export const getDb = () => {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is required");
  }

  if (!pool) {
    pool = new Pool({ connectionString });
  }

  return pool;
};

export const ensureSchema = async () => {
  const db = getDb();
  await db.query(`
    CREATE TABLE IF NOT EXISTS tokens (
      id SERIAL PRIMARY KEY,
      pool_address TEXT NOT NULL UNIQUE,
      jetton_address TEXT NOT NULL,
      creator TEXT NOT NULL,
      name TEXT NOT NULL,
      symbol TEXT NOT NULL,
      description TEXT,
      image_url TEXT,
      collected_ton NUMERIC DEFAULT 0,
      target_ton NUMERIC DEFAULT 8888,
      sold_tokens NUMERIC DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'PENDING',
      is_listed BOOLEAN DEFAULT FALSE,
      lp_lock_address TEXT,
      stonfi_pool_address TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS trades (
      id SERIAL PRIMARY KEY,
      pool_address TEXT REFERENCES tokens(pool_address),
      buyer TEXT NOT NULL,
      ton_amount NUMERIC NOT NULL,
      token_amount NUMERIC NOT NULL,
      tx_hash TEXT UNIQUE,
      lt TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS listings (
      id SERIAL PRIMARY KEY,
      pool_address TEXT REFERENCES tokens(pool_address),
      jetton_address TEXT NOT NULL,
      ton_amount NUMERIC NOT NULL,
      jetton_amount NUMERIC NOT NULL,
      lp_lock_address TEXT NOT NULL,
      stonfi_tx_hash TEXT UNIQUE,
      status TEXT NOT NULL DEFAULT 'PENDING',
      error TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS indexer_checkpoints (
      id SERIAL PRIMARY KEY,
      source TEXT NOT NULL UNIQUE,
      last_lt TEXT,
      last_hash TEXT,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);
};
