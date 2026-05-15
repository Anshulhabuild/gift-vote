"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { PRODUCTS, getProduct } from "@/lib/products";

type Stage = "intro" | "playing" | "done";

function makeSessionId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return "s_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

const TOTAL_ROUNDS = PRODUCTS.length - 1; // 10

export default function HomePage() {
  const [stage, setStage] = useState<Stage>("intro");
  const [name, setName] = useState("");
  const [round, setRound] = useState(0);
  const [sessionId, setSessionId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [picks, setPicks] = useState<number[]>([]);
  const [champion, setChampion] = useState<number | null>(null);

  useEffect(() => { setSessionId(makeSessionId()); }, []);

  // Round 0: products[0] vs products[1]
  // Round i (i>0): current champion vs products[i+1]
  const leftProduct = round === 0 ? PRODUCTS[0] : getProduct(champion!);
  const rightProduct = PRODUCTS[round + 1];

  async function recordVote(winnerLevel: number) {
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    const lowLevel = Math.min(leftProduct.level, rightProduct.level);
    const highLevel = Math.max(leftProduct.level, rightProduct.level);
    try {
      const res = await fetch("/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          voterName: name || null,
          lowLevel,
          highLevel,
          winnerLevel,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Could not save vote");
      }
      setPicks((prev) => [...prev, winnerLevel]);
      setChampion(winnerLevel);
      const next = round + 1;
      if (next >= TOTAL_ROUNDS) setStage("done");
      else setRound(next);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-dvh flex flex-col">
      <header className="px-6 pt-8 pb-4 md:px-10">
        <div className="flex items-center gap-2 text-ink-500 tracking-[0.18em] text-[11px] uppercase">
          <span className="inline-block w-6 h-px bg-ink-500/40" />
          Habuild · Community Gift Picker
        </div>
      </header>

      <div className="flex-1 flex flex-col px-5 md:px-10 pb-10">
        {stage === "intro" && (
          <Intro name={name} setName={setName} onStart={() => setStage("playing")} />
        )}

        {stage === "playing" && (
          <Round
            round={round}
            total={TOTAL_ROUNDS}
            left={leftProduct}
            right={rightProduct}
            submitting={submitting}
            onPick={recordVote}
            error={error}
          />
        )}

        {stage === "done" && <Done name={name} picks={picks} />}
      </div>
    </main>
  );
}

/* ------------------------ Intro ------------------------ */

function Intro({
  name, setName, onStart,
}: { name: string; setName: (v: string) => void; onStart: () => void }) {
  return (
    <section className="flex-1 flex flex-col justify-center max-w-2xl mx-auto w-full fade-up">
      <p className="font-display italic text-terra-500 text-base md:text-lg mb-3">A small favour —</p>
      <h1 className="font-display text-ink-900 leading-[0.95] text-[44px] md:text-[68px] tracking-tight">
        This,<br />
        <span className="italic text-sage-700">or that?</span>
      </h1>
      <p className="mt-6 text-ink-700 text-base md:text-lg leading-relaxed max-w-xl">
        We're picking gifts for our community and we'd love your eye on it. You'll see <strong>10 quick pairs</strong> — just tap the one you'd rather receive. Takes under a minute.
      </p>

      <div className="mt-10 space-y-3 max-w-md">
        <label className="block text-[11px] uppercase tracking-[0.18em] text-ink-500">
          Your name (optional)
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Priya"
          className="w-full rounded-xl bg-white/70 border border-ink-900/10 px-4 py-3 text-ink-900 placeholder:text-ink-500/60 outline-none focus:border-sage-600 focus:bg-white transition"
        />
      </div>

      <button
        onClick={onStart}
        className="mt-8 self-start group inline-flex items-center gap-3 bg-ink-900 text-cream-50 rounded-full pl-6 pr-5 py-4 text-[15px] font-medium tracking-wide hover:bg-sage-700 transition-colors"
      >
        Start picking
        <span className="inline-flex w-7 h-7 rounded-full bg-cream-50 text-ink-900 items-center justify-center group-hover:translate-x-0.5 transition-transform">
          →
        </span>
      </button>

      <p className="mt-12 text-xs text-ink-500/80 italic max-w-md">
        No right answers. Go with your gut.
      </p>
    </section>
  );
}

/* ------------------------ Round ------------------------ */

function Round({
  round, total, left, right, submitting, onPick, error,
}: {
  round: number; total: number;
  left: { level: number; name: string; image: string };
  right: { level: number; name: string; image: string };
  submitting: boolean;
  onPick: (winnerLevel: number) => void;
  error: string | null;
}) {
  return (
    <section className="flex-1 flex flex-col max-w-6xl mx-auto w-full">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="text-[11px] uppercase tracking-[0.18em] text-ink-500">
          Round <span className="text-ink-900 font-medium">{round + 1}</span> / {total}
        </div>
        <div className="flex-1 flex gap-1.5">
          {Array.from({ length: total }).map((_, i) => (
            <span
              key={i}
              className={`h-[3px] flex-1 rounded-full transition-colors ${
                i < round ? "bg-sage-600" : i === round ? "bg-terra-500" : "bg-ink-900/10"
              }`}
            />
          ))}
        </div>
      </div>

      <h2 className="font-display text-ink-900 text-3xl md:text-5xl tracking-tight mb-2 fade-up">
        Which would you <em className="text-terra-500 not-italic">rather</em> receive?
      </h2>
      <p className="text-ink-500 text-sm md:text-base mb-8 fade-up">Tap a card to choose.</p>

      <div key={round} className="grid grid-cols-2 gap-3 md:gap-8 fade-up">
        <ChoiceCard product={left} disabled={submitting} onPick={() => onPick(left.level)} />
        <ChoiceCard product={right} disabled={submitting} onPick={() => onPick(right.level)} />
      </div>

      <div className="mt-6 flex items-center justify-center gap-2 text-ink-500 text-xs">
        <span className="font-display italic text-base text-terra-500">or</span>
      </div>

      {error && (
        <p className="mt-4 text-center text-sm text-terra-600">{error}</p>
      )}

      <p className="mt-auto pt-10 text-center text-[11px] uppercase tracking-[0.2em] text-ink-500/70">
        {submitting ? "Saving…" : "Trust your gut"}
      </p>
    </section>
  );
}

function ChoiceCard({
  product, disabled, onPick,
}: {
  product: { level: number; name: string; image: string };
  disabled: boolean;
  onPick: () => void;
}) {
  return (
    <button
      onClick={onPick}
      disabled={disabled}
      className="choice-card group relative text-left bg-white rounded-2xl md:rounded-[28px] overflow-hidden border border-ink-900/[0.06] shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_40px_-12px_rgba(28,26,22,0.18)] hover:border-sage-600/40 hover:shadow-[0_2px_4px_rgba(0,0,0,0.05),0_24px_60px_-12px_rgba(28,26,22,0.25)] disabled:opacity-60 disabled:cursor-wait"
      aria-label={`Pick ${product.name}`}
    >
      <div className="relative aspect-square bg-cream-100">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 50vw, 40vw"
          className="object-contain p-3 md:p-6 transition-transform duration-500 group-hover:scale-[1.03]"
          priority
        />
      </div>
      <div className="px-4 md:px-6 py-4 md:py-5 flex items-end justify-between gap-3">
        <h3 className="font-display text-ink-900 text-lg md:text-2xl leading-tight">
          {product.name}
        </h3>
        <span className="inline-flex shrink-0 w-9 h-9 md:w-11 md:h-11 rounded-full bg-cream-100 group-hover:bg-sage-600 group-hover:text-cream-50 text-ink-900 items-center justify-center text-sm transition-colors">
          →
        </span>
      </div>
    </button>
  );
}

/* ------------------------ Done ------------------------ */

function getTopPicks(picks: number[]): number[] {
  if (picks.length === 0) return [];
  const losers: number[] = [];
  for (let i = 0; i < picks.length; i++) {
    const left = i === 0 ? PRODUCTS[0].level : picks[i - 1];
    const right = PRODUCTS[i + 1].level;
    const loser = picks[i] === left ? right : left;
    losers.push(loser);
  }
  const champion = picks[picks.length - 1];
  // Champion first, then most recently eliminated (runner-up), then one before
  return [champion, ...losers.slice().reverse().slice(0, 2)];
}

function Done({ name, picks }: { name: string; picks: number[] }) {
  const topLevels = getTopPicks(picks);
  const topGifts = topLevels.map((lvl) => getProduct(lvl));
  const medals = ["🥇", "🥈", "🥉"];

  return (
    <section className="flex-1 flex flex-col justify-center max-w-2xl mx-auto w-full fade-up">
      <p className="font-display italic text-terra-500 text-base md:text-lg mb-3">
        That's it{name ? `, ${name}` : ""} —
      </p>
      <h1 className="font-display text-ink-900 leading-[0.95] text-[44px] md:text-[68px] tracking-tight">
        Thank<br />
        <span className="italic text-sage-700">you.</span>
      </h1>
      <p className="mt-6 text-ink-700 text-base md:text-lg leading-relaxed">
        Thank you for your valuable response, it helps us make your experience better.
      </p>

      {topGifts.length > 0 && (
        <div className="mt-8">
          <p className="text-[11px] uppercase tracking-[0.18em] text-ink-500 mb-4">Your top picks</p>
          <div className="flex flex-col gap-3">
            {topGifts.map((product, i) => (
              <div
                key={product.level}
                className="flex items-center gap-4 bg-white rounded-2xl border border-ink-900/[0.06] shadow-[0_1px_2px_rgba(0,0,0,0.04)] px-4 py-3"
              >
                <div className="relative w-14 h-14 shrink-0 rounded-xl overflow-hidden bg-cream-100">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes="56px"
                    className="object-contain p-1"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-display text-ink-900 text-base md:text-lg leading-tight truncate">
                    {product.name}
                  </p>
                  {i === 0 && (
                    <p className="text-ink-500 text-xs mt-0.5">Your champion — beat all challengers</p>
                  )}
                </div>
                <span className="text-xl shrink-0">{medals[i]}</span>
              </div>
            ))}
          </div>
        </div>
      )}

    </section>
  );
}
