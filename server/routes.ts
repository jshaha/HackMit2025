import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertSavedMapSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // put application routes here
  // prefix all routes with /api

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)

  // Mind Map API Routes
  
  // GET /api/maps/:userId - List all saved maps for a user
  app.get("/api/maps/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const maps = await storage.getSavedMaps(userId);
      res.json(maps);
    } catch (error) {
      console.error("Error fetching maps:", error);
      res.status(500).json({ error: "Failed to fetch maps" });
    }
  });

  // GET /api/maps/:userId/:mapId - Get a specific saved map
  app.get("/api/maps/:userId/:mapId", async (req, res) => {
    try {
      const { userId, mapId } = req.params;
      const map = await storage.getSavedMap(userId, mapId);
      
      if (!map) {
        return res.status(404).json({ error: "Map not found" });
      }
      
      res.json(map);
    } catch (error) {
      console.error("Error fetching map:", error);
      res.status(500).json({ error: "Failed to fetch map" });
    }
  });

  // POST /api/maps - Create a new saved map
  app.post("/api/maps", async (req, res) => {
    try {
      const validatedData = insertSavedMapSchema.parse(req.body);
      const map = await storage.createSavedMap(validatedData);
      res.status(201).json(map);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      console.error("Error creating map:", error);
      res.status(500).json({ error: "Failed to create map" });
    }
  });

  // PUT /api/maps/:mapId - Update an existing saved map
  app.put("/api/maps/:mapId", async (req, res) => {
    try {
      const { mapId } = req.params;
      const updateData = req.body;
      
      // Validate the update data (partial schema)
      const partialSchema = insertSavedMapSchema.partial();
      const validatedData = partialSchema.parse(updateData);
      
      const updatedMap = await storage.updateSavedMap(mapId, validatedData);
      
      if (!updatedMap) {
        return res.status(404).json({ error: "Map not found" });
      }
      
      res.json(updatedMap);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      console.error("Error updating map:", error);
      res.status(500).json({ error: "Failed to update map" });
    }
  });

  // DELETE /api/maps/:userId/:mapId - Delete a saved map
  app.delete("/api/maps/:userId/:mapId", async (req, res) => {
    try {
      const { userId, mapId } = req.params;
      const deleted = await storage.deleteSavedMap(userId, mapId);
      
      if (!deleted) {
        return res.status(404).json({ error: "Map not found" });
      }
      
      res.json({ message: "Map deleted successfully" });
    } catch (error) {
      console.error("Error deleting map:", error);
      res.status(500).json({ error: "Failed to delete map" });
    }
  });

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  const httpServer = createServer(app);

  return httpServer;
}
