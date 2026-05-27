# Candidate Instructions

Welcome. This repo is a small existing cash application system. Cash application means applying incoming bank payments to the correct customer invoices.

Your goal is to understand the product and codebase, explain what you think matters, and then make a focused improvement.

## Setup

Clone the repo and install dependencies:

```bash
git clone https://github.com/withatlas/monk-onsite-repo.git
cd monk-onsite-repo
pnpm install
```

Your interviewer will provide a `DATABASE_URL`. Add it to `.env.local`:

```bash
cp .env.example .env.local
```

Then start the app:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

You should not need to create a Supabase project, run migrations, reset the database, or seed data. If the app cannot connect to the database, ask your interviewer for the env value again.

## Interview Flow

You may use AI tools throughout the session, including during analysis. Be ready to explain your reasoning, tradeoffs, and code.

Start by exploring the product and repository. Your interviewer will ask you to summarize what you found, where you would focus, and what you plan to build.

After that discussion, choose a scoped improvement and implement it.

## Useful Commands

```bash
pnpm dev
pnpm test
pnpm typecheck
pnpm lint
```

Do not run reset, deploy, or migration commands unless your interviewer explicitly asks you to.

## Role Prompt

If you are interviewing for FDE, use `docs/candidate-fde.md`.

If you are interviewing for SWE, use `docs/candidate-swe.md`.

## Expected Output

By the end of the analysis period, be ready to explain:

- what you would build first and why
- what tradeoffs you are making
- how you would evaluate whether your change worked

During the build period, optimize for a small improvement that is easy to review and grounded in the system you inspected.
