import { drizzle } from "drizzle-orm/neon-serverless";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

let db: ReturnType<typeof drizzle> | null = null;

export function getDb() {
  if (!db) {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error("DATABASE_URL environment variable is not set");
    }
    
    const sql = neon(databaseUrl);
    db = drizzle(sql, { schema });
  }
  return db;
}

export function hasDatabase(): boolean {
  return !!process.env.DATABASE_URL;
}

export * from "./schema";
