create extension if not exists "pgcrypto";

create type public.invoice_status as enum ('open', 'paid', 'void');
create type public.match_run_status as enum ('running', 'completed', 'failed');
create type public.match_result_status as enum ('matched', 'unmatched', 'ambiguous');

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  external_ref text not null,
  aliases jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index customers_external_ref_idx on public.customers (external_ref);

create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  invoice_number text not null,
  issue_date date not null,
  due_date date not null,
  status public.invoice_status not null default 'open',
  amount_cents integer not null,
  currency text not null default 'USD',
  memo text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index invoices_customer_id_idx on public.invoices (customer_id);
create index invoices_invoice_number_idx on public.invoices (invoice_number);
create index invoices_status_idx on public.invoices (status);

create table public.bank_transactions (
  id uuid primary key default gen_random_uuid(),
  external_id text not null,
  posted_at date not null,
  description text not null,
  counterparty text not null,
  amount_cents integer not null,
  currency text not null default 'USD',
  raw_payload jsonb not null default '{}'::jsonb,
  imported_at timestamptz not null default now()
);

create index bank_transactions_external_id_idx on public.bank_transactions (external_id);
create index bank_transactions_posted_at_idx on public.bank_transactions (posted_at);

create table public.match_runs (
  id uuid primary key default gen_random_uuid(),
  status public.match_run_status not null default 'running',
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  summary jsonb
);

create table public.match_results (
  id uuid primary key default gen_random_uuid(),
  match_run_id uuid not null references public.match_runs(id) on delete cascade,
  transaction_id uuid not null references public.bank_transactions(id) on delete cascade,
  invoice_id uuid references public.invoices(id) on delete set null,
  status public.match_result_status not null,
  reason text not null,
  created_at timestamptz not null default now()
);

create index match_results_match_run_id_idx on public.match_results (match_run_id);
create index match_results_transaction_id_idx on public.match_results (transaction_id);
create index match_results_invoice_id_idx on public.match_results (invoice_id);

alter table public.customers enable row level security;
alter table public.invoices enable row level security;
alter table public.bank_transactions enable row level security;
alter table public.match_runs enable row level security;
alter table public.match_results enable row level security;
