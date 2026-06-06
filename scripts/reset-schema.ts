import { readFile } from "node:fs/promises";
import postgres from "postgres";

const migrationPath = "supabase/migrations/20260526000000_cash_application.sql";

const resetPublicSchemaSql = `
drop schema if exists public cascade;
create schema public;
alter schema public owner to postgres;

grant all on schema public to postgres;
grant all on schema public to anon;
grant all on schema public to authenticated;
grant all on schema public to service_role;

alter default privileges in schema public grant all on tables to postgres;
alter default privileges in schema public grant all on tables to anon;
alter default privileges in schema public grant all on tables to authenticated;
alter default privileges in schema public grant all on tables to service_role;

alter default privileges in schema public grant all on sequences to postgres;
alter default privileges in schema public grant all on sequences to anon;
alter default privileges in schema public grant all on sequences to authenticated;
alter default privileges in schema public grant all on sequences to service_role;

alter default privileges in schema public grant all on functions to postgres;
alter default privileges in schema public grant all on functions to anon;
alter default privileges in schema public grant all on functions to authenticated;
alter default privileges in schema public grant all on functions to service_role;
`;

export async function rebuildCashApplicationSchema(databaseUrl: string) {
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required to rebuild the schema.");
  }

  const sql = postgres(databaseUrl, {
    max: 1,
    prepare: false,
    idle_timeout: 20,
    connect_timeout: 15,
    onnotice: () => {},
  });

  try {
    const migrationSql = await readFile(migrationPath, "utf8");

    await sql.unsafe(resetPublicSchemaSql);
    await sql.unsafe(migrationSql);
  } finally {
    await sql.end({ timeout: 5 });
  }
}
