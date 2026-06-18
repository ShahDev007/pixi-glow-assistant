// Single Postgres access point. Swap Neon <-> Supabase here only by changing
// DATABASE_URL. Everything degrades gracefully: when DATABASE_URL is absent the
// helpers return null/empty so the chat still works before the DB is wired.

import { Pool, type QueryResultRow } from "pg";

let pool: Pool | null = null;

export function hasDb(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

export function getPool(): Pool | null {
  if (!hasDb()) return null;
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      // Most managed Postgres (Neon, Supabase) require SSL. The pooled
      // connection strings handle serverless connection limits.
      ssl: { rejectUnauthorized: false },
      max: 5,
    });
  }
  return pool;
}

// Safe query helper. Returns [] (and logs) instead of throwing when the DB is
// not configured or a query fails, so a logging hiccup never breaks a chat.
export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: unknown[] = []
): Promise<T[]> {
  const p = getPool();
  if (!p) return [];
  try {
    const res = await p.query<T>(text, params);
    return res.rows;
  } catch (err) {
    console.error("[db] query failed:", err);
    return [];
  }
}

// Strict variant for scripts (seed/schema) where we want failures to surface.
export async function queryStrict<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: unknown[] = []
): Promise<T[]> {
  const p = getPool();
  if (!p) throw new Error("DATABASE_URL is not set");
  const res = await p.query<T>(text, params);
  return res.rows;
}
