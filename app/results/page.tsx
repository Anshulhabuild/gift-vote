"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { PAIRS, getProduct } from "@/lib/products";

type Tally = { level_low: number; level_high: number; winner_level: number; votes: number };
type Recent = { voter_name: string | null; level_low: number; level_high: number; winner_level: number; created_at: string };
type Payload = {
  tallies: Tally[];
  totals: { total_votes: number; unique_sessions: number };
  recent: Recent[];
};

export default function ResultsPage() {
  const [data, setData] = useState<Payload | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/results", { cache: "no-store" });
      if (!res.ok) throw new Error((await res.json()).error || "Failed");
      setData(await res.json());
      setErr(null);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const id = setInterval(load, 15000);
    return () => clearInterval(id);
  }, []);

  return (
    <main className="min-h-dvh px-5 md:px-10 py-10 max-w-5xl mx-auto">
      <header className="flex items-end justify-between flex-wrap gap-4 mb-10">
        <div>
          <div className="text-[11px] uppercase tracking-[0.18em] text-ink-500 mb-2">
            Habuild · Internal
          </div>
          <h1 className="font-display text-ink-900 text-4xl md:text-5xl tracking-tight">
            Results
          </h1>
        </div>
        <div className="flex items-center gap-6">
          <Stat label="Total votes" value={data?.totals.total_votes ?? 0} />
          <Stat label="Voters" value={data?.totals.unique_sessions ?? 0} />
          <button
            onClick={load}
            className="px-4 py-2 rounded-full bg-ink-900 text-cream-50 text-sm hover:bg-sage-700 transition-colors"
          >
            Refresh
          </button>
        </div>
      </header>

      {err && (
        <p className="text-terra-600 text-sm mb-6">
          {err}. The database may not be connected yet — see README.
        </p>
      )}
      {loading && !data && <p className="text-ink-500">Loading…</p>}

      <div className="space-y-4">
        {PAIRS.map((p) => {
          const low = getProduct(p.low);
          const high = getProduct(p.high);
          const lowVotes = data?.tallies.find(t => t.level_low === p.low && t.winner_level === p.low)?.votes ?? 0;
          const highVotes = data?.tallies.find(t => t.level_low === p.low && t.winner_level === p.high)?.votes ?? 0;
          const total = lowVotes + highVotes;
          const lowPct = total ? Math.round((lowVotes / total) * 100) : 0;
          const highPct = total ? 100 - lowPct : 0;
          const leadLow = lowVotes > highVotes;
          const leadHigh = highVotes > lowVotes;

          return (
            <div key={p.low} className="bg-white rounded-2xl border border-ink-900/[0.06] p-4 md:p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-3 text-[11px] uppercase tracking-[0.18em] text-ink-500">
                <span>Pair {p.low} <span className="text-ink-500/50">vs</span> {p.high}</span>
                <span className="text-ink-500/40">·</span>
                <span>{total} votes</span>
              </div>

              <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 md:gap-5">
                <PairTile product={low} leading={leadLow} />
                <div className="flex flex-col gap-1.5">
                  <div className="h-2 rounded-full overflow-hidden bg-ink-900/[0.06] flex">
                    <div style={{ width: `${lowPct}%` }} className="bg-sage-600 transition-[width] duration-500" />
                    <div style={{ width: `${highPct}%` }} className="bg-terra-500 transition-[width] duration-500" />
                  </div>
                  <div className="flex justify-between text-xs text-ink-700">
                    <span className={leadLow ? "font-semibold text-sage-700" : ""}>{lowPct}% · {lowVotes}</span>
                    <span className={leadHigh ? "font-semibold text-terra-600" : ""}>{highVotes} · {highPct}%</span>
                  </div>
                </div>
                <PairTile product={high} leading={leadHigh} />
              </div>
            </div>
          );
        })}
      </div>

      {data && data.recent.length > 0 && (
        <section className="mt-12">
          <h2 className="font-display text-2xl text-ink-900 mb-4">Recent votes</h2>
          <div className="bg-white rounded-2xl border border-ink-900/[0.06] overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-cream-100 text-ink-500 text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="text-left px-4 py-2">When</th>
                  <th className="text-left px-4 py-2">Name</th>
                  <th className="text-left px-4 py-2">Pair</th>
                  <th className="text-left px-4 py-2">Picked</th>
                </tr>
              </thead>
              <tbody>
                {data.recent.map((r, i) => {
                  const winner = getProduct(r.winner_level);
                  return (
                    <tr key={i} className="border-t border-ink-900/[0.05]">
                      <td className="px-4 py-2 text-ink-500">{new Date(r.created_at).toLocaleString()}</td>
                      <td className="px-4 py-2 text-ink-900">{r.voter_name ?? <span className="text-ink-500/60 italic">anonymous</span>}</td>
                      <td className="px-4 py-2 text-ink-700">L{r.level_low} vs L{r.level_high}</td>
                      <td className="px-4 py-2 text-ink-900 font-medium">L{r.winner_level} — {winner.name}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-right">
      <div className="font-display text-2xl text-ink-900 leading-none">{value}</div>
      <div className="text-[10px] uppercase tracking-[0.18em] text-ink-500 mt-1">{label}</div>
    </div>
  );
}

function PairTile({ product, leading }: { product: { level: number; name: string; image: string }; leading: boolean }) {
  return (
    <div className={`flex items-center gap-2 md:gap-3 ${leading ? "" : "opacity-80"}`}>
      <div className={`relative w-14 h-14 md:w-20 md:h-20 rounded-xl overflow-hidden bg-cream-100 border ${leading ? "border-sage-600/60" : "border-ink-900/10"}`}>
        <Image src={product.image} alt={product.name} fill sizes="80px" className="object-contain p-1.5" />
      </div>
      <div className="hidden md:block min-w-0">
        <div className="text-[10px] uppercase tracking-[0.18em] text-ink-500">L{product.level}</div>
        <div className="text-sm text-ink-900 leading-tight truncate max-w-[160px]">{product.name}</div>
      </div>
    </div>
  );
}
