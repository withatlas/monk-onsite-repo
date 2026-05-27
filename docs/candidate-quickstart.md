# Candidate Quickstart

Welcome. This repo is a small existing cash application system. Your goal is to understand the product and codebase, explain what you think matters, and make a focused improvement.

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

The database starts with customer and invoice data. Your interviewer may provide transaction data during the session.

## Useful Commands

```bash
pnpm dev
pnpm test
pnpm typecheck
pnpm lint
```

Do not run reset, deploy, or migration commands unless your interviewer explicitly asks you to.

## Interview Flow

You may use AI tools throughout the session, including during analysis. Be ready to explain your reasoning, tradeoffs, and code.

After you present your analysis, your interviewer will help scope the build portion.

Use the prompt for your role:

- FDE: `docs/candidate-fde.md`
- SWE: `docs/candidate-swe.md`
