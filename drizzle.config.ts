import { defineConfig } from "drizzle-kit"
import type { Config } from "drizzle-kit"
import config from "./lib/config";

const DATABASE_URL = config.env.databaseUrl ?? "";

const drizzleConfig = {
    schema: "database/drizzle/schema.ts",
    out: "./migrations",
    dialect: "postgresql",
    dbCredentials: { url: DATABASE_URL },
} satisfies Config

export default defineConfig(drizzleConfig)