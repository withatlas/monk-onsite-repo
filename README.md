# Monk Cash Application Onsite

Cash application is the process of applying incoming bank payments to the right customer invoices. This sandbox contains a small existing system for importing transactions, viewing invoices, running a match pass, and inspecting persisted match results.

## Candidate Setup

Candidates should start with `INSTRUCTIONS.md`.

Supporting docs:

- `docs/candidate-quickstart.md`
- `docs/candidate-fde.md` or `docs/candidate-swe.md`

The intended candidate setup is:

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Your interviewer will provide the `DATABASE_URL` for `.env.local`. Candidates should not need to create a Supabase project, run migrations, or seed data.

## Useful Commands

```bash
pnpm dev
pnpm test
pnpm typecheck
pnpm lint
```

## CSV Format

Transaction uploads expect a header row:

```csv
external_id,posted_at,description,counterparty,amount,currency
```

Example:

```csv
bank-001,2026-05-01,ACH CREDIT INV-2026-1001,Brightlayer Labs,1200.00,USD
```

Amounts are dollar values. Positive amounts are incoming money; negative amounts are outgoing money.

## Project Shape

The app keeps business logic under `domains/cash-application`:

- `dao`: database reads and writes
- `services`: orchestration and business logic
- `routes`: request validation and route-facing handlers
- `types`: shared domain types

Database schema lives in `db/schema.ts`, with Supabase migration SQL under `supabase/migrations`.
