import { defineConfig } from "drizzle-kit";

if (process.env.NODE_ENV !== "development" && !process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required for non-development environments");
}

export default defineConfig({
  out: process.env.NODE_ENV === "development" ? null : "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
