import { afterEach, describe, expect, it, vi } from "vitest";

import { AdminRoutes } from "@/domains/cash-application/routes/admin";
import { AdminResetService } from "@/domains/cash-application/services/admin-reset.service";

describe("AdminRoutes", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("routes data reset requests to the data reset service", async () => {
    const resetData = vi
      .spyOn(AdminResetService, "resetData")
      .mockResolvedValue({
        mode: "data",
        customerCount: 15,
        invoiceCount: 68,
        transactionCount: 0,
      });

    await AdminRoutes.reset({
      action: "data",
      confirmation: "monk-onsite-repo",
    });

    expect(resetData).toHaveBeenCalledOnce();
  });

  it("routes schema reset requests to the schema reset service", async () => {
    const resetSchema = vi
      .spyOn(AdminResetService, "resetSchemaAndData")
      .mockResolvedValue({
        mode: "schema",
        customerCount: 15,
        invoiceCount: 68,
        transactionCount: 0,
      });

    await AdminRoutes.reset({
      action: "schema",
      confirmation: "monk-onsite-repo",
    });

    expect(resetSchema).toHaveBeenCalledOnce();
  });

  it("rejects reset requests without the confirmation value", async () => {
    await expect(
      AdminRoutes.reset({ action: "data", confirmation: "wrong" }),
    ).rejects.toThrow();
  });
});
