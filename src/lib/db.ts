import { Pool, type QueryResultRow } from "pg";

const globalForDb = globalThis as unknown as {
  riafPool?: Pool;
  riafSchema?: Promise<void>;
};

export function isDatabaseConfigured() {
  return Boolean(process.env.DATABASE_URL);
}

function sslConfig(connectionString: string) {
  if (process.env.PGSSL_DISABLE === "true") return false;
  if (/localhost|127\.0\.0\.1/.test(connectionString)) return false;
  if (/sslmode=disable/.test(connectionString)) return false;
  return { rejectUnauthorized: false };
}

function getPool() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not configured.");
  }

  if (!globalForDb.riafPool) {
    globalForDb.riafPool = new Pool({
      connectionString,
      ssl: sslConfig(connectionString),
      max: 5,
    });
  }

  return globalForDb.riafPool;
}

export async function ensureSchema() {
  if (!globalForDb.riafSchema) {
    globalForDb.riafSchema = (async () => {
      const pool = getPool();
      await pool.query(`
        CREATE TABLE IF NOT EXISTS catalog_entries (
          id TEXT PRIMARY KEY,
          slug TEXT,
          data JSONB,
          removed BOOLEAN NOT NULL DEFAULT FALSE,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `);
      await pool.query(`
        CREATE UNIQUE INDEX IF NOT EXISTS catalog_entries_slug_idx
          ON catalog_entries (slug)
          WHERE slug IS NOT NULL;
      `);
      await pool.query(`
        CREATE TABLE IF NOT EXISTS store_accounts (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          email TEXT NOT NULL UNIQUE,
          password_hash TEXT,
          password_salt TEXT,
          password_iterations INTEGER,
          google_id TEXT UNIQUE,
          avatar_url TEXT,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `);
      await pool.query(`
        CREATE TABLE IF NOT EXISTS store_login_challenges (
          id TEXT PRIMARY KEY,
          email TEXT NOT NULL,
          code_hash TEXT NOT NULL,
          attempts INTEGER NOT NULL DEFAULT 0,
          purpose TEXT NOT NULL DEFAULT 'login',
          expires_at TIMESTAMPTZ NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `);
      await pool.query(`
        ALTER TABLE store_login_challenges
          ADD COLUMN IF NOT EXISTS purpose TEXT NOT NULL DEFAULT 'login';
      `);
      await pool.query(`
        CREATE INDEX IF NOT EXISTS store_login_challenges_email_idx
          ON store_login_challenges (email);
      `);
      await pool.query(`
        CREATE TABLE IF NOT EXISTS catalog_media (
          id TEXT PRIMARY KEY,
          mime_type TEXT NOT NULL,
          data BYTEA NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `);
    })().catch((error) => {
      globalForDb.riafSchema = undefined;
      throw error;
    });
  }

  await globalForDb.riafSchema;
}

export async function dbQuery<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: unknown[] = [],
) {
  await ensureSchema();
  const result = await getPool().query<T>(text, params);
  return result.rows;
}
