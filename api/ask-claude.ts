import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { question, nodes } = req.body;

  if (!question) {
    return res.status(400).json({ error: "Question is required" });
  }

  // Get API key from environment variables only
  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

  if (!ANTHROPIC_API_KEY) {
    console.error('ANTHROPIC_API_KEY not found in environment variables');
    return res.status(500).json({ error: "Anthropic API key not configured. Please add ANTHROPIC_API_KEY to your Vercel environment variables." });
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
        .replace(/[""]/g, '"')
        .replace(/[']/g, "'")
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
}
