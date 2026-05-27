import { closeDb } from "@/domains/platform/infra/db/baseClient";
import { loadFirstEnv } from "@/scripts/env";
import { resetAndSeedCashApplicationData } from "@/scripts/reset-and-seed";

loadFirstEnv([".env.local", ".env"]);

async function seed() {
  const databaseUrl = process.env.DATABASE_URL ?? "";
  const isRemoteDatabase = !/localhost|127\.0\.0\.1|0\.0\.0\.0/.test(
    databaseUrl,
  );

  if (
    databaseUrl &&
    isRemoteDatabase &&
    process.env.REMOTE_RESET_CONFIRM !== "monk-onsite-repo"
  ) {
    throw new Error(
      "Set REMOTE_RESET_CONFIRM=monk-onsite-repo before seeding remote interview data.",
    );
  }

  try {
    const result = await resetAndSeedCashApplicationData();

    console.log(
      `Seeded ${result.customerCount} customers, ${result.invoiceCount} invoices, ${result.transactionCount} transactions.`,
    );
  } finally {
    await closeDb();
  }
}

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
