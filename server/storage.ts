import { type User, type InsertUser, type Attachment, type InsertAttachment, type UpdateAttachment } from "@shared/schema";
import { randomUUID } from "crypto";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Attachment methods
  getAttachments(nodeId: string): Promise<Attachment[]>;
  getAttachment(id: string): Promise<Attachment | undefined>;
  createAttachment(attachment: InsertAttachment): Promise<Attachment>;
  updateAttachment(id: string, attachment: UpdateAttachment): Promise<Attachment | undefined>;
  deleteAttachment(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private attachments: Map<string, Attachment>;

  constructor() {
    this.users = new Map();
    this.attachments = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Attachment methods
  async getAttachments(nodeId: string): Promise<Attachment[]> {
    return Array.from(this.attachments.values()).filter(
      (attachment) => attachment.nodeId === nodeId
    );
  }

  async getAttachment(id: string): Promise<Attachment | undefined> {
    return this.attachments.get(id);
  }

  async createAttachment(insertAttachment: InsertAttachment): Promise<Attachment> {
    const id = randomUUID();
    const attachment: Attachment = {
      ...insertAttachment,
      id,
      createdAt: new Date().toISOString(),
    };
    this.attachments.set(id, attachment);
    return attachment;
  }

  async updateAttachment(id: string, updateAttachment: UpdateAttachment): Promise<Attachment | undefined> {
    const existing = this.attachments.get(id);
    if (!existing) return undefined;

    const updated: Attachment = {
      ...existing,
      ...updateAttachment,
    };
    this.attachments.set(id, updated);
    return updated;
  }

  async deleteAttachment(id: string): Promise<boolean> {
    return this.attachments.delete(id);
  }
}

export const storage = new MemStorage();
