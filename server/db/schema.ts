import { pgTable, text, timestamp, jsonb, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import type { MindMapNode, MindMapEdge } from "@shared/schema";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const savedMaps = pgTable("saved_maps", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  data: jsonb("data").$type<{
    nodes: MindMapNode[];
    edges: MindMapEdge[];
  }>().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);
export const insertSavedMapSchema = createInsertSchema(savedMaps);
export const selectSavedMapSchema = createSelectSchema(savedMaps);

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type SavedMap = typeof savedMaps.$inferSelect;
export type InsertSavedMap = typeof savedMaps.$inferInsert;
