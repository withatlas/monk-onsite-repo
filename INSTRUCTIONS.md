# Candidate Instructions

Welcome. This repo is a small existing cash application system. Cash application means applying incoming bank payments to the correct customer invoices.

Your goal is to understand the current system, identify the most important gaps, explain your plan, and then make a focused improvement.

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

Spend the first analysis period understanding the app and forming a plan. Do not use AI during this first analysis window.

After you present your analysis, your interviewer will help scope the build portion. You may use AI during the build portion after your analysis has been presented.

## What To Inspect

Start with the product in the browser:

- customers, invoices, transactions, match results, and match runs
- creating an invoice
- uploading transactions from CSV
- running a match pass

Then inspect the code:

- `app/page.tsx`
- `app/_components/operations-panel.tsx`
- `db/schema.ts`
- `domains/cash-application/services/match-run.service.ts`
- `domains/cash-application/services/matcher.service.ts`
- `domains/cash-application/dao`

## Useful Commands

```bash
pnpm test
pnpm typecheck
pnpm lint
```

Do not run reset, deploy, or migration commands unless your interviewer explicitly asks you to.

## CSV Upload Format

Transaction uploads expect a header row:

```csv
external_id,posted_at,description,counterparty,amount,currency
```

Example:

```csv
bank-001,2026-05-01,ACH CREDIT INV-2026-1001,Brightlayer Labs,1200.00,USD
```

Amounts are dollar values. Positive amounts are incoming money; negative amounts are outgoing money.

Your interviewer may provide additional customer data or CSVs during the session.

## Role Prompt

If you are interviewing for FDE, use `docs/candidate-fde.md`.

If you are interviewing for SWE, use `docs/candidate-swe.md`.

## Expected Output

By the end of the analysis period, be ready to explain:

- what the system currently does
- where the workflow or implementation breaks down
- what you would build first and why
- what tradeoffs you are making
- which tests or checks matter for your change

During the build period, optimize for a small improvement that is easy to review and grounded in the system you inspected.
