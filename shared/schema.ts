import { z } from "zod";

// Mind Map Node Types
export const nodeTypes = ["Concept", "Paper", "Dataset"] as const;
export type NodeType = typeof nodeTypes[number];

// Supabase Database Node Schema (for persistence)
export const databaseNodeSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  title: z.string().min(1, "Title is required"),
  content: z.string(),
  parent_id: z.string().uuid().nullable(),
  created_at: z.string().datetime(),
});

export const insertDatabaseNodeSchema = databaseNodeSchema.omit({ 
  id: true, 
  created_at: true 
});

export const updateDatabaseNodeSchema = databaseNodeSchema.partial().omit({ 
  id: true, 
  user_id: true, 
  created_at: true 
});

export type DatabaseNode = z.infer<typeof databaseNodeSchema>;
export type InsertDatabaseNode = z.infer<typeof insertDatabaseNodeSchema>;
export type UpdateDatabaseNode = z.infer<typeof updateDatabaseNodeSchema>;

// Mind Map Node Schema (for UI)
export const mindMapNodeSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Title is required"),
  type: z.enum(nodeTypes),
  description: z.string(),
  position: z.object({
    x: z.number(),
    y: z.number(),
  }),
});

export const insertMindMapNodeSchema = mindMapNodeSchema.omit({ id: true });

export type MindMapNode = z.infer<typeof mindMapNodeSchema>;
export type InsertMindMapNode = z.infer<typeof insertMindMapNodeSchema>;

// Mind Map Edge Schema
export const mindMapEdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
});

export type MindMapEdge = z.infer<typeof mindMapEdgeSchema>;

// Legacy user schemas (keeping for compatibility)
export const insertUserSchema = z.object({
  username: z.string(),
  password: z.string(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export interface User {
  id: string;
  username: string;
  password: string;
}
