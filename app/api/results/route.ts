import { NextResponse } from "next/server";
import { sql } from "@vercel/postgres";
import { ensureSchema } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await ensureSchema();

    const tallies = await sql`
      SELECT level_low, level_high, winner_level, COUNT(*)::int AS votes
      FROM votes
      GROUP BY level_low, level_high, winner_level
      ORDER BY level_low ASC;
    `;

    const totals = await sql`
      SELECT
        COUNT(*)::int AS total_votes,
        COUNT(DISTINCT session_id)::int AS unique_sessions
      FROM votes;
    `;

    const recent = await sql`
      SELECT voter_name, level_low, level_high, winner_level, created_at
      FROM votes
      ORDER BY created_at DESC
      LIMIT 50;
    `;

    return NextResponse.json({
      tallies: tallies.rows,
      totals: totals.rows[0] ?? { total_votes: 0, unique_sessions: 0 },
      recent: recent.rows,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("results error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
