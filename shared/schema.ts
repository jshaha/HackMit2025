import { z } from "zod";

// Mind Map Node Types
export const nodeTypes = ["Concept", "Paper", "Dataset"] as const;
export type NodeType = typeof nodeTypes[number];

// Attachment Types
export const attachmentTypes = ["link", "image", "file"] as const;
export type AttachmentType = typeof attachmentTypes[number];

// File Types for categorization
export const fileTypes = [
  "document", // .pdf, .doc, .docx, .txt, .md
  "code", // .js, .ts, .py, .java, .cpp, etc.
  "data", // .csv, .json, .xml, .xlsx
  "image", // .jpg, .png, .gif, .svg
  "other"
] as const;
export type FileType = typeof fileTypes[number];

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

// Attachment Schema
export const attachmentSchema = z.object({
  id: z.string().uuid(),
  nodeId: z.string().uuid(),
  type: z.enum(attachmentTypes),
  name: z.string().min(1, "Name is required"),
  url: z.string().url("Must be a valid URL"),
  fileType: z.enum(fileTypes).optional(),
  fileSize: z.number().optional(), // in bytes
  mimeType: z.string().optional(),
  createdAt: z.string().datetime(),
});

export const insertAttachmentSchema = attachmentSchema.omit({ 
  id: true, 
  createdAt: true 
});

export const updateAttachmentSchema = attachmentSchema.partial().omit({ 
  id: true, 
  nodeId: true,
  createdAt: true 
});

export type Attachment = z.infer<typeof attachmentSchema>;
export type InsertAttachment = z.infer<typeof insertAttachmentSchema>;
export type UpdateAttachment = z.infer<typeof updateAttachmentSchema>;

// Mind Map Node Schema (for UI) - Updated to include attachments
export const mindMapNodeSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Title is required"),
  type: z.enum(nodeTypes),
  description: z.string(),
  position: z.object({
    x: z.number(),
    y: z.number(),
  }),
  attachments: z.array(attachmentSchema).optional().default([]),
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
