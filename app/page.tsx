import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  Database,
  Search,
  X,
} from "lucide-react";
import Link from "next/link";

import { OperationsPanel } from "@/app/_components/operations-panel";
import { CashApplicationDashboardService } from "@/domains/cash-application/services/dashboard.service";
import { centsToDollars } from "@/lib/money";

export const dynamic = "force-dynamic";

type Dashboard = Awaited<
  ReturnType<typeof CashApplicationDashboardService.getDashboard>
>;
type DashboardView = "matches" | "transactions" | "invoices" | "runs";

const dashboardViews: { id: DashboardView; label: string }[] = [
  { id: "matches", label: "Matches" },
  { id: "transactions", label: "Transactions" },
  { id: "invoices", label: "Invoices" },
  { id: "runs", label: "Runs" },
];

function viewFromParam(value: string | string[] | undefined): DashboardView {
  const rawValue = Array.isArray(value) ? value[0] : value;

  if (
    rawValue === "matches" ||
    rawValue === "transactions" ||
    rawValue === "invoices" ||
    rawValue === "runs"
  ) {
    return rawValue;
  }

  return "matches";
}

function queryFromParam(value: string | string[] | undefined): string {
  const rawValue = Array.isArray(value) ? value[0] : value;
  return rawValue?.trim() ?? "";
}

function optionalStringFromParam(
  value: string | string[] | undefined,
): string | undefined {
  const rawValue = Array.isArray(value) ? value[0] : value;
  const trimmedValue = rawValue?.trim();
  return trimmedValue || undefined;
}

async function loadDashboard(
  selectedRunId?: string,
): Promise<
  { dashboard: Dashboard; error: null } | { dashboard: null; error: string }
> {
  if (!process.env.DATABASE_URL) {
    return {
      dashboard: null,
      error: "DATABASE_URL is not configured.",
    };
  }

  try {
    const dashboard =
      await CashApplicationDashboardService.getDashboard(selectedRunId);
    return { dashboard, error: null };
  } catch (error) {
    return {
      dashboard: null,
      error: error instanceof Error ? error.message : "Database unavailable.",
    };
  }
}

function statusClass(status: string) {
  if (status === "matched") return "status-pill status-matched";
  if (status === "ambiguous") return "status-pill status-ambiguous";
  if (status === "unmatched") return "status-pill status-unmatched";
  return "status-pill";
}

function dateText(value: string | Date | null | undefined) {
  if (!value) return "-";
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return value.slice(0, 10);
}

function dateTimeText(value: string | Date | null | undefined) {
  if (!value) return "-";
  const isoValue = value instanceof Date ? value.toISOString() : value;
  return isoValue.replace("T", " ").slice(0, 16);
}

function dashboardHref({
  view,
  query,
  runId,
}: {
  view: DashboardView;
  query?: string;
  runId?: string | null;
}) {
  const params = new URLSearchParams({ view });
  if (query) params.set("q", query);
  if (view === "matches" && runId) params.set("runId", runId);
  return `/?${params.toString()}`;
}

function includesQuery(
  query: string,
  values: Array<string | number | null | undefined>,
) {
  const normalizedQuery = query.toLowerCase();
  return values.some((value) =>
    String(value ?? "").toLowerCase().includes(normalizedQuery),
  );
}

function filterDashboard(dashboard: Dashboard, query: string): Dashboard {
  if (!query) return dashboard;

  return {
    ...dashboard,
    matchResults: dashboard.matchResults.filter((row) =>
      includesQuery(query, [
        row.result.status,
        row.result.reason,
        row.transaction.externalId,
        row.transaction.description,
        row.transaction.counterparty,
        row.transaction.postedAt,
        centsToDollars(row.transaction.amountCents),
        row.invoice?.invoiceNumber,
        row.customer?.name,
      ]),
    ),
    transactions: dashboard.transactions.filter((transaction) =>
      includesQuery(query, [
        transaction.externalId,
        transaction.description,
        transaction.counterparty,
        transaction.postedAt,
        centsToDollars(transaction.amountCents),
      ]),
    ),
    invoices: dashboard.invoices.filter((row) =>
      includesQuery(query, [
        row.invoice.invoiceNumber,
        row.invoice.issueDate,
        row.invoice.dueDate,
        row.invoice.status,
        row.invoice.memo,
        centsToDollars(row.invoice.amountCents),
        row.customer.name,
        row.customer.externalRef,
        ...(row.customer.aliases ?? []),
      ]),
    ),
    matchRuns: dashboard.matchRuns.filter((run) =>
      includesQuery(query, [
        run.id,
        run.status,
        dateText(run.startedAt),
        dateText(run.completedAt),
        run.summary?.transactionCount,
        run.summary?.matchedCount,
        run.summary?.unmatchedCount,
        run.summary?.ambiguousCount,
      ]),
    ),
  };
}

function DashboardStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string | number;
  tone: "blue" | "green" | "red" | "amber";
}) {
  const toneClass = {
    blue: "text-[#1d4ed8]",
    green: "text-[#166534]",
    red: "text-[#b42318]",
    amber: "text-[#a16207]",
  }[tone];

  return (
    <div className="rounded-lg border border-[#d9ded7] bg-white p-4">
      <div className={`text-2xl font-semibold ${toneClass}`}>{value}</div>
      <div className="mt-1 text-sm text-[#697386]">{label}</div>
    </div>
  );
}

function DashboardNav({
  activeView,
  dashboard,
  query,
  selectedRunId,
}: {
  activeView: DashboardView;
  dashboard: Dashboard;
  query: string;
  selectedRunId: string | null;
}) {
  const counts: Record<DashboardView, number> = {
    matches: dashboard.matchResults.length,
    transactions: dashboard.transactions.length,
    invoices: dashboard.invoices.length,
    runs: dashboard.matchRuns.length,
  };

  function viewHref(view: DashboardView) {
    return dashboardHref({ view, query, runId: selectedRunId });
  }

  return (
    <nav className="border-b border-[#d9ded7] bg-white" aria-label="Dashboard">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex gap-2 overflow-x-auto">
          {dashboardViews.map((view) => {
            const isActive = activeView === view.id;

            return (
              <Link
                key={view.id}
                href={viewHref(view.id)}
                aria-current={isActive ? "page" : undefined}
                className={`inline-flex h-10 items-center gap-2 rounded-md border px-3 text-sm font-medium ${
                  isActive
                    ? "border-[#1f2933] bg-[#1f2933] text-white"
                    : "border-[#d9ded7] bg-white text-[#1f2933] hover:bg-[#f2f4f0]"
                }`}
              >
                <span>{view.label}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${
                    isActive
                      ? "bg-white/15 text-white"
                      : "bg-[#f2f4f0] text-[#697386]"
                  }`}
                >
                  {counts[view.id]}
                </span>
              </Link>
            );
          })}
        </div>

        <form action="/" className="flex min-w-0 gap-2 lg:w-[420px]">
          <input type="hidden" name="view" value={activeView} />
          {activeView === "matches" && selectedRunId ? (
            <input type="hidden" name="runId" value={selectedRunId} />
          ) : null}
          <div className="relative min-w-0 flex-1">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#697386]"
              aria-hidden="true"
            />
            <input
              name="q"
              defaultValue={query}
              placeholder="Search all records"
              className="h-10 w-full rounded-md border border-[#cbd5c8] bg-white pl-9 pr-3 text-sm"
            />
          </div>
          <button
            className="inline-flex h-10 items-center rounded-md bg-[#1f2933] px-3 text-sm font-medium text-white"
            type="submit"
          >
            Search
          </button>
          {query ? (
            <Link
              href={dashboardHref({
                view: activeView,
                runId: selectedRunId,
              })}
              className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-[#cbd5c8] bg-white text-[#697386] hover:bg-[#f2f4f0]"
              aria-label="Clear search"
            >
              <X size={16} aria-hidden="true" />
            </Link>
          ) : null}
        </form>
      </div>
    </nav>
  );
}

function MatchRunPicker({
  matchRuns,
  latestRunId,
  selectedRunId,
  query,
}: {
  matchRuns: Dashboard["matchRuns"];
  latestRunId: string | null;
  selectedRunId: string | null;
  query: string;
}) {
  if (matchRuns.length === 0) return null;

  return (
    <form action="/" className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="view" value="matches" />
      {query ? <input type="hidden" name="q" value={query} /> : null}
      <label className="text-sm font-medium text-[#697386]" htmlFor="runId">
        Run
      </label>
      <select
        id="runId"
        name="runId"
        defaultValue={selectedRunId ?? ""}
        className="h-10 max-w-full rounded-md border border-[#cbd5c8] bg-white px-3 text-sm"
      >
        {matchRuns.map((run) => (
          <option key={run.id} value={run.id}>
            {run.id === latestRunId ? "Latest" : "Run"} ·{" "}
            {dateTimeText(run.completedAt ?? run.startedAt)} · {run.status} ·{" "}
            {run.id.slice(0, 8)}
          </option>
        ))}
      </select>
      <button
        className="inline-flex h-10 items-center rounded-md bg-[#1f2933] px-3 text-sm font-medium text-white"
        type="submit"
      >
        View
      </button>
    </form>
  );
}

export default async function Home({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const activeView = viewFromParam(resolvedSearchParams.view);
  const query = queryFromParam(resolvedSearchParams.q);
  const selectedRunIdParam = optionalStringFromParam(resolvedSearchParams.runId);
  const { dashboard, error } = await loadDashboard(selectedRunIdParam);

  if (!dashboard) {
    return (
      <main className="min-h-screen px-6 py-10">
        <div className="mx-auto max-w-3xl rounded-lg border border-[#d9ded7] bg-white p-6">
          <div className="mb-4 flex items-center gap-3">
            <Database className="text-[#1d4ed8]" size={24} aria-hidden="true" />
            <h1 className="text-2xl font-semibold">Monk Cash Application</h1>
          </div>
          <p className="text-sm text-[#697386]">{error}</p>
          <pre className="mt-4 overflow-x-auto rounded-md bg-[#f2f4f0] p-4 text-sm">
            cp .env.example .env.local{"\n"}
            pnpm dev
          </pre>
        </div>
      </main>
    );
  }

  const latestSummary = dashboard.stats.latestSummary;
  const visibleDashboard = filterDashboard(dashboard, query);
  const selectedRunId = dashboard.selectedRun?.id ?? null;

  return (
    <main className="min-h-screen">
      <header className="border-b border-[#d9ded7] bg-[#f7f7f4]">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-6 py-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold tracking-normal">
                Monk Cash Application
              </h1>
              <p className="mt-1 text-sm text-[#697386]">
                {dashboard.latestRun
                  ? `Last run ${dateText(dashboard.latestRun.completedAt ?? dashboard.latestRun.startedAt)}`
                  : "No match run yet"}
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-[#d9ded7] bg-white px-3 py-2 text-sm text-[#697386]">
              <Clock3 size={16} aria-hidden="true" />
              {dashboard.transactions.length} imported transactions
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <DashboardStat
              label="Customers"
              value={dashboard.stats.customerCount}
              tone="blue"
            />
            <DashboardStat
              label="Invoices"
              value={dashboard.stats.invoiceCount}
              tone="green"
            />
            <DashboardStat
              label="Matched in last run"
              value={latestSummary.matchedCount}
              tone="amber"
            />
            <DashboardStat
              label="Unmatched in last run"
              value={latestSummary.unmatchedCount}
              tone="red"
            />
          </div>
        </div>
      </header>

      <OperationsPanel
        transactionCount={dashboard.transactions.length}
        hasMatchRun={dashboard.matchRuns.length > 0}
      />
      <DashboardNav
        activeView={activeView}
        dashboard={visibleDashboard}
        query={query}
        selectedRunId={selectedRunId}
      />

      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-8">
        {activeView === "matches" ? (
          <section className="grid gap-3">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-xl font-semibold">Match results</h2>
                <p className="mt-1 text-sm text-[#697386]">
                  {dashboard.selectedRun
                    ? `Showing ${dateTimeText(dashboard.selectedRun.completedAt ?? dashboard.selectedRun.startedAt)}`
                    : "No match run selected"}
                </p>
              </div>
              <MatchRunPicker
                matchRuns={dashboard.matchRuns}
                latestRunId={dashboard.latestRun?.id ?? null}
                selectedRunId={selectedRunId}
                query={query}
              />
              <span className="text-sm text-[#697386]">
                {visibleDashboard.matchResults.length} rows
              </span>
            </div>
            <div className="table-scroll rounded-lg border border-[#d9ded7] bg-white">
              <table className="min-w-full border-collapse text-left text-sm">
                <thead className="border-b border-[#d9ded7] bg-[#f2f4f0] text-xs uppercase text-[#697386]">
                  <tr>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Transaction</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Invoice</th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleDashboard.matchResults.map((row) => (
                    <tr
                      key={row.result.id}
                      className="border-b border-[#edf0eb]"
                    >
                      <td className="px-4 py-3">
                        <span className={statusClass(row.result.status)}>
                          {row.result.status}
                        </span>
                      </td>
                      <td className="max-w-[280px] px-4 py-3">
                        <div className="font-medium">
                          {row.transaction.description}
                        </div>
                        <div className="text-xs text-[#697386]">
                          {row.transaction.counterparty}
                        </div>
                      </td>
                      <td className="px-4 py-3 tabular-nums">
                        {centsToDollars(row.transaction.amountCents)}
                      </td>
                      <td className="px-4 py-3">
                        {row.invoice?.invoiceNumber ?? "-"}
                      </td>
                      <td className="px-4 py-3">{row.customer?.name ?? "-"}</td>
                      <td className="px-4 py-3">{row.result.reason}</td>
                    </tr>
                  ))}
                  {visibleDashboard.matchResults.length === 0 ? (
                    <tr>
                      <td className="px-4 py-6 text-[#697386]" colSpan={6}>
                        No results
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </section>
        ) : null}

        {activeView === "transactions" ? (
          <section className="grid gap-3">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-semibold">Transactions</h2>
              <span className="text-sm text-[#697386]">
                {visibleDashboard.transactions.length} rows
              </span>
            </div>
            <div className="table-scroll rounded-lg border border-[#d9ded7] bg-white">
              <table className="min-w-full border-collapse text-left text-sm">
                <thead className="border-b border-[#d9ded7] bg-[#f2f4f0] text-xs uppercase text-[#697386]">
                  <tr>
                    <th className="px-4 py-3">Posted</th>
                    <th className="px-4 py-3">Description</th>
                    <th className="px-4 py-3">Counterparty</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">External ID</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleDashboard.transactions.map((transaction) => (
                    <tr
                      key={transaction.id}
                      className="border-b border-[#edf0eb]"
                    >
                      <td className="px-4 py-3">{transaction.postedAt}</td>
                      <td className="max-w-[320px] px-4 py-3">
                        {transaction.description}
                      </td>
                      <td className="px-4 py-3">{transaction.counterparty}</td>
                      <td className="px-4 py-3 tabular-nums">
                        {centsToDollars(transaction.amountCents)}
                      </td>
                      <td className="px-4 py-3 text-[#697386]">
                        {transaction.externalId}
                      </td>
                    </tr>
                  ))}
                  {visibleDashboard.transactions.length === 0 ? (
                    <tr>
                      <td className="px-4 py-6 text-[#697386]" colSpan={5}>
                        No transactions
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </section>
        ) : null}

        {activeView === "invoices" ? (
          <section className="grid gap-3">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-semibold">Invoices</h2>
              <span className="text-sm text-[#697386]">
                {visibleDashboard.invoices.length} rows
              </span>
            </div>
            <div className="table-scroll rounded-lg border border-[#d9ded7] bg-white">
              <table className="min-w-full border-collapse text-left text-sm">
                <thead className="border-b border-[#d9ded7] bg-[#f2f4f0] text-xs uppercase text-[#697386]">
                  <tr>
                    <th className="px-4 py-3">Invoice</th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Issue date</th>
                    <th className="px-4 py-3">Due date</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleDashboard.invoices.map((row) => (
                    <tr
                      key={row.invoice.id}
                      className="border-b border-[#edf0eb]"
                    >
                      <td className="px-4 py-3 font-medium">
                        {row.invoice.invoiceNumber}
                      </td>
                      <td className="px-4 py-3">{row.customer.name}</td>
                      <td className="px-4 py-3">{row.invoice.issueDate}</td>
                      <td className="px-4 py-3">{row.invoice.dueDate}</td>
                      <td className="px-4 py-3 tabular-nums">
                        {centsToDollars(row.invoice.amountCents)}
                      </td>
                      <td className="px-4 py-3">
                        <span className="status-pill">
                          {row.invoice.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {visibleDashboard.invoices.length === 0 ? (
                    <tr>
                      <td className="px-4 py-6 text-[#697386]" colSpan={6}>
                        No invoices
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </section>
        ) : null}

        {activeView === "runs" ? (
          <section className="grid gap-3">
            <h2 className="text-xl font-semibold">Match runs</h2>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {visibleDashboard.matchRuns.map((run) => (
                <Link
                  key={run.id}
                  href={dashboardHref({
                    view: "matches",
                    query,
                    runId: run.id,
                  })}
                  className="rounded-lg border border-[#d9ded7] bg-white p-4"
                >
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <span className="status-pill">{run.status}</span>
                    {run.status === "completed" ? (
                      <CheckCircle2
                        size={18}
                        className="text-[#166534]"
                        aria-hidden="true"
                      />
                    ) : (
                      <AlertCircle
                        size={18}
                        className="text-[#a16207]"
                        aria-hidden="true"
                      />
                    )}
                  </div>
                  <div className="truncate text-sm text-[#697386]">
                    {run.id}
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <div className="font-semibold">
                        {run.summary?.matchedCount ?? 0}
                      </div>
                      <div className="text-xs text-[#697386]">matched</div>
                    </div>
                    <div>
                      <div className="font-semibold">
                        {run.summary?.unmatchedCount ?? 0}
                      </div>
                      <div className="text-xs text-[#697386]">unmatched</div>
                    </div>
                    <div>
                      <div className="font-semibold">
                        {run.summary?.ambiguousCount ?? 0}
                      </div>
                      <div className="text-xs text-[#697386]">ambiguous</div>
                    </div>
                  </div>
                </Link>
              ))}
              {visibleDashboard.matchRuns.length === 0 ? (
                <div className="rounded-lg border border-[#d9ded7] bg-white p-4 text-sm text-[#697386]">
                  No runs
                </div>
              ) : null}
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}
