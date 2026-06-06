import { z } from "zod";

import {
  ADMIN_RESET_CONFIRMATION,
  AdminResetService,
} from "@/domains/cash-application/services/admin-reset.service";

export const adminResetInputSchema = z.object({
  action: z.enum(["data", "schema"]),
  confirmation: z.literal(ADMIN_RESET_CONFIRMATION),
});

export class AdminRoutes {
  static async reset(input: unknown) {
    const parsed = adminResetInputSchema.parse(input);

    if (parsed.action === "schema") {
      return AdminResetService.resetSchemaAndData();
    }

    return AdminResetService.resetData();
  }
}
