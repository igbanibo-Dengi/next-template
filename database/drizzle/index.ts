import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless"
import * as schema from "./schema"
import config from "@/lib/config";

const DATABASE_URL = config.env.databaseUrl ?? "";

const sql = neon(DATABASE_URL);

const db = drizzle(sql, { schema })

export default db;