# Monk Cash Application Onsite

Cash application is the process of applying incoming bank payments to the right customer invoices. This sandbox contains a small existing system for you to inspect and extend during the onsite.

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

Your interviewer will provide the `.env.local` values. Candidates should not need to create a Supabase project, run migrations, or seed data.

The interview database starts with customer and invoice data. Your interviewer may provide transaction data during the session.

## Useful Commands

```bash
pnpm dev
pnpm test
pnpm typecheck
pnpm lint
```
