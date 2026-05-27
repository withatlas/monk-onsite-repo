import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "@/db/schema";

function createDb() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is required for database access");
  }

  const client = postgres(connectionString, {
    max: 10,
    prepare: false,
    idle_timeout: 20,
    connect_timeout: 15,
  });

  postgresClient = client;

  return drizzle(client, { schema });
}

type CreatedDb = ReturnType<typeof createDb>;

let dbInstance: CreatedDb | null = null;
let postgresClient: ReturnType<typeof postgres> | null = null;

export const db = new Proxy({} as CreatedDb, {
  get(_target, prop) {
    if (!dbInstance) {
      dbInstance = createDb();
    }

    return (dbInstance as unknown as Record<string | symbol, unknown>)[prop];
  },
});

export type DBClient = CreatedDb;
export type TransactionType =
  | Parameters<Parameters<DBClient["transaction"]>[0]>[0]
  | DBClient;

export function handleError(error: unknown, context: string): never {
  throw new Error(
    `Database error in ${context}: ${
      error instanceof Error ? error.message : String(error)
    }`
  );
}

export async function closeDb() {
  if (!postgresClient) return;

  await postgresClient.end({ timeout: 5 });
  postgresClient = null;
  dbInstance = null;
}
