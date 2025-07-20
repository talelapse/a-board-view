import { neonConfig, Pool } from "@neondatabase/serverless";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-serverless";
import { drizzle as drizzleSqlite } from "drizzle-orm/better-sqlite3";
import { getTableColumns } from "drizzle-orm";
import Database from "better-sqlite3";
import ws from "ws";

let db: any;
let pool: Pool | undefined;

async function initializeDb() {
  const isProd = process.env.NODE_ENV === "production";

  if (isProd) {
    // Production: Use Neon PostgreSQL
    console.log("Initializing PostgreSQL database for production...");
    neonConfig.webSocketConstructor = ws;
    if (!process.env.DATABASE_URL) {
      throw new Error(
        "DATABASE_URL must be set in production. Did you forget to provision a database?",
      );
    }
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const schema = await import("@shared/schema");
    db = drizzleNeon({ client: pool, schema });
    console.log("PostgreSQL database initialized.");
  } else {
    // Development: Use in-memory SQLite
    console.log("Initializing in-memory SQLite database for development...");
    const sqlite = new Database(":memory:");
    const schema = await import("@shared/schema.sqlite");
    db = drizzleSqlite(sqlite, { schema });

    // Dynamically build and execute CREATE TABLE statements from the schema
    for (const table of Object.values(schema)) {
      // @ts-expect-error - table is a table schema
      if (table && table[Symbol.for("drizzle:isTable")]) {
        // @ts-expect-error - accessing internal Drizzle properties
        const tableName = table.config.name;
        const columns = getTableColumns(table);
        const columnDefs = Object.values(columns)
          // @ts-expect-error - accessing internal Drizzle properties
          .map((c) => c.getSQL().toString())
          .join(", ");

        const createTableSql = `CREATE TABLE IF NOT EXISTS \`${tableName}\` (${columnDefs});`;

        try {
          sqlite.exec(createTableSql);
        } catch (e) {
          console.error(`Failed to create table ${tableName}:`, e);
          console.log("SQL:", createTableSql);
        }
      }
    }
    console.log("In-memory SQLite database initialized and tables created.");
  }
}

export { db, pool, initializeDb };

