import { closeDb } from "@/domains/platform/infra/db/baseClient";
import { loadFirstEnv } from "@/scripts/env";
import { resetAndSeedCashApplicationData } from "@/scripts/reset-and-seed";
import { rebuildCashApplicationSchema } from "@/scripts/reset-schema";

const loadedEnv = loadFirstEnv([".env.local"]);
const databaseUrl = process.env.DATABASE_URL ?? "";

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL is required. Put the remote connection string in .env.local or pass it in the shell.",
  );
}

if (/localhost|127\.0\.0\.1|0\.0\.0\.0/.test(databaseUrl)) {
  throw new Error(
    "db:reset:remote refused to run against a local database URL.",
  );
}

if (process.env.REMOTE_RESET_CONFIRM !== "monk-onsite-repo") {
  throw new Error(
    "Set REMOTE_RESET_CONFIRM=monk-onsite-repo before resetting remote interview data.",
  );
}

try {
  await rebuildCashApplicationSchema(databaseUrl);
  const result = await resetAndSeedCashApplicationData();

  console.log(
    `Reset remote schema and data${loadedEnv ? ` using ${loadedEnv}` : ""}: ${result.customerCount} customers, ${result.invoiceCount} invoices, ${result.transactionCount} transactions.`,
  );
} finally {
  await closeDb();
}
