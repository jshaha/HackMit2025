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

// Complete Mind Map Schema
export const mindMapSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Title is required"),
  nodes: z.array(mindMapNodeSchema),
  edges: z.array(mindMapEdgeSchema),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const insertMindMapSchema = mindMapSchema.omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export type MindMap = z.infer<typeof mindMapSchema>;
export type InsertMindMap = z.infer<typeof insertMindMapSchema>;

// Saved Map Schema for database
export const savedMapSchema = z.object({
  id: z.string(),
  userId: z.string(),
  title: z.string().min(1, "Title is required"),
  data: z.object({
    nodes: z.array(mindMapNodeSchema),
    edges: z.array(mindMapEdgeSchema),
  }),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const insertSavedMapSchema = savedMapSchema.omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export type SavedMap = z.infer<typeof savedMapSchema>;
export type InsertSavedMap = z.infer<typeof insertSavedMapSchema>;

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
