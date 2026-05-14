# Habuild Gift Picker — This or That

A "this or that" voting game for picking community gifts. Voters compare 10 adjacent pairs of items (Level 1 vs 2, 2 vs 3, … 10 vs 11) and tap the one they'd rather receive. Votes are stored in Postgres.

- **Game**: `/`
- **Results dashboard**: `/results` (auto-refreshes every 15s)

## Tech

- Next.js 14 (App Router) + TypeScript + Tailwind CSS
- `@vercel/postgres` driver (works with Vercel Postgres / Neon)
- Deploys to Vercel out of the box

---

## 1. Run locally (optional)

```bash
npm install
```

To run locally you need a Postgres URL. Easiest path: create a free Neon project at https://neon.tech, copy the connection string, and create a `.env.local`:

```
POSTGRES_URL="postgres://USER:PASS@HOST/DB?sslmode=require"
```

Then:

```bash
npm run dev
```

The `votes` table is created automatically on the first API call.

You can also skip local setup entirely and just deploy — Vercel will inject the env vars for you.

---

## 2. Deploy to Vercel (recommended)

### Step 1: Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit: gift picker"
gh repo create habuild-gift-picker --private --source=. --push
```

(Or do it through the GitHub website — create a repo, push your local files.)

### Step 2: Import to Vercel

1. Go to https://vercel.com/new
2. Import the repo. Defaults are fine — framework is auto-detected as Next.js. Click **Deploy**.
3. Wait for the first build to finish. It will succeed but the `/results` page will show a database error — that's expected until you connect Postgres.

### Step 3: Add Postgres

1. In your Vercel project, go to **Storage** → **Create Database**.
2. Choose **Neon** (Postgres). Pick the free tier. Region: closest to your audience (e.g. AWS Mumbai for India).
3. When prompted, **connect it to your project**. This auto-injects `POSTGRES_URL` and related env vars into all environments.
4. Trigger a redeploy: go to **Deployments** → on the latest one, click the ⋯ menu → **Redeploy**.

### Step 4: Share

Open your deployment URL (e.g. `https://habuild-gift-picker.vercel.app`) and share it. Watch results live at `/results`.

---

## Customising

- **Add / replace items**: edit `lib/products.ts` and drop new images into `public/images/`. The pair list rebuilds automatically.
- **Change branding copy**: search for "Habuild" in `app/page.tsx`.
- **Protect `/results`**: in production you'll probably want this gated. Easiest option is Vercel's built-in Password Protection (Project Settings → Deployment Protection → enable for production) or move the page behind a query-string token.
- **Export the data**: in the Neon dashboard, run `SELECT * FROM votes;` and download as CSV.

## Schema

```sql
CREATE TABLE votes (
  id           SERIAL PRIMARY KEY,
  session_id   TEXT NOT NULL,
  voter_name   TEXT,
  level_low    INT  NOT NULL,
  level_high   INT  NOT NULL,
  winner_level INT  NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

One row per vote. `session_id` is a random UUID generated in the browser — it groups one voter's 10 picks together.
