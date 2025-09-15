import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // put application routes here
  // prefix all routes with /api

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)

  // LabBuddy Node Recommendations route
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
      // Declare outside try so we can reference in catch/logging
      let cleanReply = reply;
      try {
        // Remove markdown code blocks if present
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
        ? `You are LabBuddy, a helpful research assistant for a knowledge graph.
Here is the relevant context from the user's mind map (nodes):\n\n${JSON.stringify(nodes, null, 2)}

RESPONSE STYLE: Reply in plain, human-readable text. Do NOT use markdown, asterisks, backticks, underscores, headings, or any special formatting. Avoid emojis and special symbols. Keep sentences concise and easy to scan.`
        : `You are LabBuddy, a helpful research assistant.

RESPONSE STYLE: Reply in plain, human-readable text. Do NOT use markdown, asterisks, backticks, underscores, headings, or any special formatting. Avoid emojis and special symbols. Keep sentences concise and easy to scan.`;

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
      let reply = data.content?.[0]?.text || "No response from Claude";

      // Sanitize to remove markdown/special characters commonly used for formatting
      const clean = (text: string) => {
        return text
          // remove code fences and inline backticks
          .replace(/```[\s\S]*?```/g, " ")
          .replace(/`+/g, "")
          // remove bold/italic markers
          .replace(/\*\*|__/g, "")
          .replace(/\*|_/g, "")
          // strip leading markdown headings and bullets
          .replace(/^\s*#{1,6}\s+/gm, "")
          .replace(/^\s*[-•]\s+/gm, "")
          // normalize fancy quotes/dashes
          .replace(/[“”]/g, '"')
          .replace(/[’]/g, "'")
          .replace(/[–—]/g, "-")
          // collapse excess whitespace
          .replace(/\s+\n/g, "\n")
          .trim();
      };

      reply = clean(reply);

      res.json({ reply });
    } catch (err) {
      console.error("Claude API error:", err);
      res.status(500).json({ error: "Failed to get response from Claude" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}