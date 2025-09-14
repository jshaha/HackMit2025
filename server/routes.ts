import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { fileUploadService, getFileType, getMimeType } from "./fileUpload";
import { insertAttachmentSchema, updateAttachmentSchema } from "@shared/schema";
import multer from "multer";

// Configure multer for file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

export async function registerRoutes(app: Express): Promise<Server> {
  // put application routes here
  // prefix all routes with /api

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)

  // AI Node Recommendations route
  app.post("/api/ai-recommendations", async (req, res) => {
    const { selectedNode, allNodes } = req.body;

    if (!selectedNode) {
      return res.status(400).json({ error: "Selected node is required" });
    }

    // Get API key from environment variables only
    const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || process.env.VITE_ANTHROPIC_API_KEY;

    if (!ANTHROPIC_API_KEY) {
      return res.status(500).json({ error: "Anthropic API key not configured" });
    }

    try {
      // Create context from all nodes
      const graphContext = allNodes && allNodes.length > 0 
        ? `You are an AI assistant helping a researcher expand their knowledge graph. Here is their current mind map:\n\n${JSON.stringify(allNodes, null, 2)}\n\nThe user has selected this node: ${JSON.stringify(selectedNode, null, 2)}`
        : `You are an AI assistant helping a researcher expand their knowledge graph. The user has selected this node: ${JSON.stringify(selectedNode, null, 2)}`;

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: `${graphContext}

IMPORTANT: You must respond with a JSON object containing exactly 3 node recommendations. Each recommendation should have:
- title: A clear, concise title for the node
- type: One of "Concept", "Paper", "Dataset", "Tool", "Person", "Organization", "Event", "Method"
- description: A detailed description explaining how it relates to the selected node and the broader context
- reasoning: Why this node would be valuable to add

Format your response as valid JSON with this exact structure:
{
  "recommendations": [
    {
      "title": "Node Title 1",
      "type": "Concept",
      "description": "Detailed description...",
      "reasoning": "Why this is valuable..."
    },
    {
      "title": "Node Title 2", 
      "type": "Paper",
      "description": "Detailed description...",
      "reasoning": "Why this is valuable..."
    },
    {
      "title": "Node Title 3",
      "type": "Dataset", 
      "description": "Detailed description...",
      "reasoning": "Why this is valuable..."
    }
  ]
}`,
          messages: [
            {
              role: "user",
              content: `Based on the selected node "${selectedNode.title}" and the current knowledge graph, suggest 3 new nodes that would be valuable to add. Consider:
1. Direct connections to the selected node
2. Gaps in the current knowledge graph
3. Important concepts, papers, or datasets that would strengthen the research area
4. Different types of nodes to create a well-rounded graph

Provide 3 diverse, high-quality recommendations that would genuinely help expand this research area.`
            }
          ],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Anthropic API error: ${response.status} ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      const reply = data.content?.[0]?.text || "No response from Claude";

      // Try to parse the JSON response
      try {
        // Remove markdown code blocks if present
        let cleanReply = reply;
        if (cleanReply.includes('```json')) {
          cleanReply = cleanReply.replace(/```json\n?/, '').replace(/\n?```$/, '');
        } else if (cleanReply.includes('```')) {
          cleanReply = cleanReply.replace(/```\n?/, '').replace(/\n?```$/, '');
        }
        
        // Trim whitespace
        cleanReply = cleanReply.trim();
        
        const recommendations = JSON.parse(cleanReply);
        res.json(recommendations);
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError);
        console.error('Cleaned Reply:', cleanReply);
        // If JSON parsing fails, return a structured error
        res.status(500).json({ 
          error: "Failed to parse AI recommendations", 
          rawResponse: reply 
        });
      }
    } catch (err) {
      console.error("AI Recommendations error:", err);
      res.status(500).json({ error: "Failed to get AI recommendations" });
    }
  });

  // Anthropic API route
  app.post("/api/ask-claude", async (req, res) => {
    const { question, nodes } = req.body;

    if (!question) {
      return res.status(400).json({ error: "Question is required" });
    }

    // Get API key from environment variables only
    const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || process.env.VITE_ANTHROPIC_API_KEY;

    if (!ANTHROPIC_API_KEY) {
      return res.status(500).json({ error: "Anthropic API key not configured" });
    }

    try {
      // Create context from nodes if provided
      const graphContext = nodes && nodes.length > 0 
        ? `You are an AI assistant helping a researcher navigate their knowledge graph.
Here is the relevant context from the graph:\n\n${JSON.stringify(nodes, null, 2)}

IMPORTANT: Format your responses in a clear, readable way. Use:
- **Bold text** for emphasis
- Bullet points for lists
- Clear headings with ##
- Simple mathematical notation (like x^2 instead of LaTeX)
- Line breaks for readability
- Avoid complex LaTeX formatting`
        : `You are an AI assistant helping a researcher with their questions.

IMPORTANT: Format your responses in a clear, readable way. Use:
- **Bold text** for emphasis
- Bullet points for lists
- Clear headings with ##
- Simple mathematical notation (like x^2 instead of LaTeX)
- Line breaks for readability
- Avoid complex LaTeX formatting`;

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: graphContext,
          messages: [
            {
              role: "user",
              content: question
            }
          ],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Anthropic API error: ${response.status} ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();

      // Extract Claude's reply text
      const reply = data.content?.[0]?.text || "No response from Claude";

      res.json({ reply });
    } catch (err) {
      console.error("Claude API error:", err);
      res.status(500).json({ error: "Failed to get response from Claude" });
    }
  });

  // Attachment routes
  
  // Get attachments for a node
  app.get("/api/attachments/node/:nodeId", async (req, res) => {
    try {
      const { nodeId } = req.params;
      const attachments = await storage.getAttachments(nodeId);
      res.json(attachments);
    } catch (error) {
      console.error("Get attachments error:", error);
      res.status(500).json({ error: "Failed to get attachments" });
    }
  });

  // Get a specific attachment
  app.get("/api/attachments/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const attachment = await storage.getAttachment(id);
      if (!attachment) {
        return res.status(404).json({ error: "Attachment not found" });
      }
      res.json(attachment);
    } catch (error) {
      console.error("Get attachment error:", error);
      res.status(500).json({ error: "Failed to get attachment" });
    }
  });

  // Create a link attachment
  app.post("/api/attachments/link", async (req, res) => {
    try {
      const validatedData = insertAttachmentSchema.parse({
        ...req.body,
        type: "link"
      });

      const attachment = await storage.createAttachment(validatedData);
      res.status(201).json(attachment);
    } catch (error) {
      console.error("Create link attachment error:", error);
      if (error instanceof Error && error.name === "ZodError") {
        return res.status(400).json({ error: "Invalid attachment data", details: error.message });
      }
      res.status(500).json({ error: "Failed to create link attachment" });
    }
  });

  // Upload file attachment
  app.post("/api/attachments/file", upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file provided" });
      }

      const { nodeId, name } = req.body;
      if (!nodeId) {
        return res.status(400).json({ error: "Node ID is required" });
      }

      // Upload the file
      const uploadedFile = await fileUploadService.uploadFile(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype
      );

      // Create attachment record
      const attachmentData = {
        nodeId,
        type: "file" as const,
        name: name || uploadedFile.originalName,
        url: uploadedFile.url,
        fileType: uploadedFile.fileType,
        fileSize: uploadedFile.size,
        mimeType: uploadedFile.mimeType,
      };

      const validatedData = insertAttachmentSchema.parse(attachmentData);
      const attachment = await storage.createAttachment(validatedData);
      
      res.status(201).json(attachment);
    } catch (error) {
      console.error("Upload file attachment error:", error);
      if (error instanceof Error && error.name === "ZodError") {
        return res.status(400).json({ error: "Invalid attachment data", details: error.message });
      }
      res.status(500).json({ error: "Failed to upload file attachment" });
    }
  });

  // Create image attachment from URL
  app.post("/api/attachments/image", async (req, res) => {
    try {
      const { nodeId, name, url } = req.body;
      
      if (!nodeId || !url) {
        return res.status(400).json({ error: "Node ID and URL are required" });
      }

      // For images, we can either store the URL directly or download and re-host
      // For now, we'll store the URL directly for external images
      const attachmentData = {
        nodeId,
        type: "image" as const,
        name: name || "Image",
        url,
        fileType: "image" as const,
        mimeType: getMimeType(url),
      };

      const validatedData = insertAttachmentSchema.parse(attachmentData);
      const attachment = await storage.createAttachment(validatedData);
      
      res.status(201).json(attachment);
    } catch (error) {
      console.error("Create image attachment error:", error);
      if (error instanceof Error && error.name === "ZodError") {
        return res.status(400).json({ error: "Invalid attachment data", details: error.message });
      }
      res.status(500).json({ error: "Failed to create image attachment" });
    }
  });

  // Update attachment
  app.put("/api/attachments/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = updateAttachmentSchema.parse(req.body);

      const attachment = await storage.updateAttachment(id, validatedData);
      if (!attachment) {
        return res.status(404).json({ error: "Attachment not found" });
      }

      res.json(attachment);
    } catch (error) {
      console.error("Update attachment error:", error);
      if (error instanceof Error && error.name === "ZodError") {
        return res.status(400).json({ error: "Invalid attachment data", details: error.message });
      }
      res.status(500).json({ error: "Failed to update attachment" });
    }
  });

  // Delete attachment
  app.delete("/api/attachments/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteAttachment(id);
      
      if (!deleted) {
        return res.status(404).json({ error: "Attachment not found" });
      }

      res.status(204).send();
    } catch (error) {
      console.error("Delete attachment error:", error);
      res.status(500).json({ error: "Failed to delete attachment" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}