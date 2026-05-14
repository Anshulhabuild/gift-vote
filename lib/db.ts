import { sql } from "@vercel/postgres";

let initialized = false;

export async function ensureSchema() {
  if (initialized) return;
  await sql`
    CREATE TABLE IF NOT EXISTS votes (
      id           SERIAL PRIMARY KEY,
      session_id   TEXT NOT NULL,
      voter_name   TEXT,
      level_low    INT  NOT NULL,
      level_high   INT  NOT NULL,
      winner_level INT  NOT NULL,
      created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;
  await sql`CREATE INDEX IF NOT EXISTS votes_pair_idx ON votes(level_low, level_high);`;
  await sql`CREATE INDEX IF NOT EXISTS votes_session_idx ON votes(session_id);`;
  initialized = true;
}
