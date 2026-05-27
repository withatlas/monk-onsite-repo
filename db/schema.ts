import { sql, type InferInsertModel, type InferSelectModel } from "drizzle-orm";
import {
  date,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const invoiceStatus = pgEnum("invoice_status", ["open", "paid", "void"]);

export const matchRunStatus = pgEnum("match_run_status", [
  "running",
  "completed",
  "failed",
]);

export const matchResultStatus = pgEnum("match_result_status", [
  "matched",
  "unmatched",
  "ambiguous",
]);

export const customers = pgTable(
  "customers",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    name: text("name").notNull(),
    externalRef: text("external_ref").notNull(),
    aliases: jsonb("aliases").$type<string[]>().default([]).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    externalRefIdx: index("customers_external_ref_idx").on(table.externalRef),
  }),
);

export const invoices = pgTable(
  "invoices",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    customerId: uuid("customer_id")
      .references(() => customers.id, { onDelete: "cascade" })
      .notNull(),
    invoiceNumber: text("invoice_number").notNull(),
    issueDate: date("issue_date").notNull(),
    dueDate: date("due_date").notNull(),
    status: invoiceStatus("status").default("open").notNull(),
    amountCents: integer("amount_cents").notNull(),
    currency: text("currency").default("USD").notNull(),
    memo: text("memo"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    customerIdx: index("invoices_customer_id_idx").on(table.customerId),
    invoiceNumberIdx: index("invoices_invoice_number_idx").on(
      table.invoiceNumber,
    ),
    statusIdx: index("invoices_status_idx").on(table.status),
  }),
);

export const bankTransactions = pgTable(
  "bank_transactions",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    externalId: text("external_id").notNull(),
    postedAt: date("posted_at").notNull(),
    description: text("description").notNull(),
    counterparty: text("counterparty").notNull(),
    amountCents: integer("amount_cents").notNull(),
    currency: text("currency").default("USD").notNull(),
    rawPayload: jsonb("raw_payload")
      .$type<Record<string, unknown>>()
      .default(sql`'{}'::jsonb`)
      .notNull(),
    importedAt: timestamp("imported_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    externalIdIdx: index("bank_transactions_external_id_idx").on(
      table.externalId,
    ),
    postedAtIdx: index("bank_transactions_posted_at_idx").on(table.postedAt),
  }),
);

export type MatchRunSummary = {
  transactionCount: number;
  matchedCount: number;
  unmatchedCount: number;
  ambiguousCount: number;
};

export const matchRuns = pgTable("match_runs", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  status: matchRunStatus("status").default("running").notNull(),
  startedAt: timestamp("started_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  summary: jsonb("summary").$type<MatchRunSummary>(),
});

export const matchResults = pgTable(
  "match_results",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    matchRunId: uuid("match_run_id")
      .references(() => matchRuns.id, { onDelete: "cascade" })
      .notNull(),
    transactionId: uuid("transaction_id")
      .references(() => bankTransactions.id, { onDelete: "cascade" })
      .notNull(),
    invoiceId: uuid("invoice_id").references(() => invoices.id, {
      onDelete: "set null",
    }),
    status: matchResultStatus("status").notNull(),
    reason: text("reason").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    matchRunIdx: index("match_results_match_run_id_idx").on(table.matchRunId),
    transactionIdx: index("match_results_transaction_id_idx").on(
      table.transactionId,
    ),
    invoiceIdx: index("match_results_invoice_id_idx").on(table.invoiceId),
  }),
);

export type Customer = InferSelectModel<typeof customers>;
export type CustomerInsert = InferInsertModel<typeof customers>;
export type Invoice = InferSelectModel<typeof invoices>;
export type InvoiceInsert = InferInsertModel<typeof invoices>;
export type BankTransaction = InferSelectModel<typeof bankTransactions>;
export type BankTransactionInsert = InferInsertModel<typeof bankTransactions>;
export type MatchRun = InferSelectModel<typeof matchRuns>;
export type MatchRunInsert = InferInsertModel<typeof matchRuns>;
export type MatchResult = InferSelectModel<typeof matchResults>;
export type MatchResultInsert = InferInsertModel<typeof matchResults>;

export const customerSelectSchema = createSelectSchema(customers);
export const invoiceSelectSchema = createSelectSchema(invoices);
export const bankTransactionSelectSchema = createSelectSchema(bankTransactions);
export const matchRunSelectSchema = createSelectSchema(matchRuns);
export const matchResultSelectSchema = createSelectSchema(matchResults);

export const createInvoiceInputSchema = createInsertSchema(invoices)
  .pick({
    customerId: true,
    invoiceNumber: true,
    issueDate: true,
    dueDate: true,
    amountCents: true,
    currency: true,
    memo: true,
  })
  .extend({
    invoiceNumber: z.string().min(3).max(64),
    currency: z.string().length(3).default("USD"),
    amountCents: z.number().int().positive(),
  });
