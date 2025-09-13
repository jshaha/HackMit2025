import { z } from "zod";

// Mind Map Node Types
export const nodeTypes = ["Concept", "Paper", "Dataset"] as const;
export type NodeType = typeof nodeTypes[number];

// Mind Map Node Schema
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
