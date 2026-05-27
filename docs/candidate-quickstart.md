# Candidate Quickstart

Welcome. This repo is a small existing cash application system. Your goal is to understand what it does, identify the most important gaps, and make a focused improvement.

## First 5 Minutes

Clone the repo and install dependencies:

```bash
git clone https://github.com/withatlas/monk-onsite-repo.git
cd monk-onsite-repo
pnpm install
```

Your interviewer will provide a `.env.local` value. Add it before starting the app:

```bash
cp .env.example .env.local
```

Paste the provided `DATABASE_URL` into `.env.local`, then run:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

You should not need to create a Supabase project, run migrations, or seed data. If the page says the database is unavailable, ask your interviewer for the env value again.

## Useful Commands

```bash
pnpm dev
pnpm test
pnpm typecheck
pnpm lint
```

Do not run reset, deploy, or migration commands unless your interviewer explicitly asks you to.

## Product Context

Cash application means applying incoming bank payments to the correct customer invoices. This app contains:

- customers and invoices
- imported bank transactions
- a match run workflow
- persisted match results

The system is intentionally small. Treat it like a real customer-facing MVP you inherited.

## Where To Start Reading

Start with these files:

- `app/page.tsx`
- `db/schema.ts`
- `domains/cash-application/services/match-run.service.ts`
- `domains/cash-application/services/matcher.service.ts`
- `domains/cash-application/dao`

Then run the app, click through the dashboard, and inspect what happens when a match run is created.

## Interview Flow

For the first analysis period, do not use AI. Focus on understanding the current system and deciding what matters.

After you present your analysis, your interviewer will help scope the build portion.

Use the prompt for your role:

- FDE: `docs/candidate-fde.md`
- SWE: `docs/candidate-swe.md`
