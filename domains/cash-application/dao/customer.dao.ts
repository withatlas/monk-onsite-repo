import { asc, count } from "drizzle-orm";

import { customers, type Customer, type CustomerInsert } from "@/db/schema";
import {
  db,
  handleError,
  type TransactionType,
} from "@/domains/platform/infra/db/baseClient";

export class CustomerDao {
  static async listAll(tx: TransactionType = db): Promise<Customer[]> {
    try {
      return await tx.select().from(customers).orderBy(asc(customers.name));
    } catch (error) {
      handleError(error, "CustomerDao.listAll");
    }
  }

  static async count(tx: TransactionType = db): Promise<number> {
    try {
      const [row] = await tx.select({ value: count() }).from(customers);
      return row?.value ?? 0;
    } catch (error) {
      handleError(error, "CustomerDao.count");
    }
  }

  static async createMany(
    rows: CustomerInsert[],
    tx: TransactionType = db
  ): Promise<Customer[]> {
    try {
      if (rows.length === 0) return [];
      return await tx.insert(customers).values(rows).returning();
    } catch (error) {
      handleError(error, "CustomerDao.createMany");
    }
  }
}
