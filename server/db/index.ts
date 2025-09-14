import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "./schema";

let db: ReturnType<typeof drizzle> | null = null;

export function getDb() {
  if (!db) {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error("DATABASE_URL environment variable is not set");
    }
    
    // Extract file path from sqlite:// URL
    const dbPath = databaseUrl.replace('sqlite:', '');
    const sqlite = new Database(dbPath);
    db = drizzle(sqlite, { schema });
  }
  return db;
}

export function hasDatabase(): boolean {
  return !!process.env.DATABASE_URL;
}

export * from "./schema";
