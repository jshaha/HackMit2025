import { type User, type InsertUser, type SavedMap, type InsertSavedMap } from "@shared/schema";
import { randomUUID } from "crypto";
import { getDb, hasDatabase, users, savedMaps } from "./db";
import { eq, and } from "drizzle-orm";

// Storage interface with mind map operations
export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Mind map operations
  getSavedMaps(userId: string): Promise<SavedMap[]>;
  getSavedMap(userId: string, mapId: string): Promise<SavedMap | undefined>;
  createSavedMap(map: InsertSavedMap): Promise<SavedMap>;
  updateSavedMap(mapId: string, map: Partial<InsertSavedMap>): Promise<SavedMap | undefined>;
  deleteSavedMap(userId: string, mapId: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  private db = getDb();

  async getUser(id: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await this.db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async getSavedMaps(userId: string): Promise<SavedMap[]> {
    return await this.db.select().from(savedMaps).where(eq(savedMaps.userId, userId));
  }

  async getSavedMap(userId: string, mapId: string): Promise<SavedMap | undefined> {
    const result = await this.db
      .select()
      .from(savedMaps)
      .where(and(eq(savedMaps.id, mapId), eq(savedMaps.userId, userId)))
      .limit(1);
    return result[0];
  }

  async createSavedMap(map: InsertSavedMap): Promise<SavedMap> {
    const result = await this.db.insert(savedMaps).values(map).returning();
    return result[0];
  }

  async updateSavedMap(mapId: string, map: Partial<InsertSavedMap>): Promise<SavedMap | undefined> {
    const result = await this.db
      .update(savedMaps)
      .set({ ...map, updatedAt: new Date() })
      .where(eq(savedMaps.id, mapId))
      .returning();
    return result[0];
  }

  async deleteSavedMap(userId: string, mapId: string): Promise<boolean> {
    const result = await this.db
      .delete(savedMaps)
      .where(and(eq(savedMaps.id, mapId), eq(savedMaps.userId, userId)))
      .returning();
    return result.length > 0;
  }
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private maps: Map<string, SavedMap>;

  constructor() {
    this.users = new Map();
    this.maps = new Map();
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
    const user: User = { 
      ...insertUser, 
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async getSavedMaps(userId: string): Promise<SavedMap[]> {
    return Array.from(this.maps.values()).filter(map => map.userId === userId);
  }

  async getSavedMap(userId: string, mapId: string): Promise<SavedMap | undefined> {
    const map = this.maps.get(mapId);
    return map && map.userId === userId ? map : undefined;
  }

  async createSavedMap(insertMap: InsertSavedMap): Promise<SavedMap> {
    const id = randomUUID();
    const now = new Date();
    const map: SavedMap = {
      ...insertMap,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.maps.set(id, map);
    return map;
  }

  async updateSavedMap(mapId: string, updateData: Partial<InsertSavedMap>): Promise<SavedMap | undefined> {
    const existingMap = this.maps.get(mapId);
    if (!existingMap) return undefined;

    const updatedMap: SavedMap = {
      ...existingMap,
      ...updateData,
      updatedAt: new Date()
    };
    this.maps.set(mapId, updatedMap);
    return updatedMap;
  }

  async deleteSavedMap(userId: string, mapId: string): Promise<boolean> {
    const map = this.maps.get(mapId);
    if (map && map.userId === userId) {
      this.maps.delete(mapId);
      return true;
    }
    return false;
  }
}

// Create storage instance based on database availability
export const storage: IStorage = hasDatabase() ? new DatabaseStorage() : new MemStorage();
