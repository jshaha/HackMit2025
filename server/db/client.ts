import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema"; // import your schema

// Create or open the SQLite file
const sqlite = new Database(process.env.DATABASE_URL!.replace("sqlite:", ""));

// Create a Drizzle ORM client
export const db = drizzle(sqlite, { schema });
