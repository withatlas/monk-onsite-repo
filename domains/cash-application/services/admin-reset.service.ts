import { closeDb } from "@/domains/platform/infra/db/baseClient";
import { resetAndSeedCashApplicationData } from "@/scripts/reset-and-seed";
import { rebuildCashApplicationSchema } from "@/scripts/reset-schema";

export const ADMIN_RESET_CONFIRMATION = "monk-onsite-repo";

export type AdminResetResult = {
  mode: "data" | "schema";
  customerCount: number;
  invoiceCount: number;
  transactionCount: number;
};

function databaseUrl() {
  const value = process.env.DATABASE_URL;

  if (!value) {
    throw new Error("DATABASE_URL is required for admin reset.");
  }

  return value;
}

function requireAdminResetEnabled() {
  if (process.env.REMOTE_RESET_CONFIRM !== ADMIN_RESET_CONFIRMATION) {
    throw new Error("Admin reset is disabled for this environment.");
  }
}

export class AdminResetService {
  static async resetData(): Promise<AdminResetResult> {
    requireAdminResetEnabled();
    databaseUrl();

    try {
      const result = await resetAndSeedCashApplicationData();

      return {
        mode: "data",
        ...result,
      };
    } finally {
      await closeDb();
    }
  }

  static async resetSchemaAndData(): Promise<AdminResetResult> {
    requireAdminResetEnabled();
    const url = databaseUrl();

    try {
      await closeDb();
      await rebuildCashApplicationSchema(url);
      const result = await resetAndSeedCashApplicationData();

      return {
        mode: "schema",
        ...result,
      };
    } finally {
      await closeDb();
    }
  }
}
