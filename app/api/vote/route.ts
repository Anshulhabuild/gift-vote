import { NextResponse } from "next/server";
import { sql, ensureSchema } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    await ensureSchema();
    const body = await req.json();
    const { sessionId, voterName, lowLevel, highLevel, winnerLevel } = body ?? {};

    if (
      typeof sessionId !== "string" ||
      typeof lowLevel !== "number" ||
      typeof highLevel !== "number" ||
      typeof winnerLevel !== "number"
    ) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }
    if (highLevel !== lowLevel + 1) {
      return NextResponse.json({ error: "Pair must be adjacent levels" }, { status: 400 });
    }
    if (winnerLevel !== lowLevel && winnerLevel !== highLevel) {
      return NextResponse.json({ error: "Winner must be one of the pair" }, { status: 400 });
    }

    const name = typeof voterName === "string" && voterName.trim() ? voterName.trim().slice(0, 80) : null;

    await sql`
      INSERT INTO votes (session_id, voter_name, level_low, level_high, winner_level)
      VALUES (${sessionId}, ${name}, ${lowLevel}, ${highLevel}, ${winnerLevel});
    `;
    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("vote error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
