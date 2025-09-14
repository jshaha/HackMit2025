import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // put application routes here
  // prefix all routes with /api

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)

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

  const httpServer = createServer(app);

  return httpServer;
}