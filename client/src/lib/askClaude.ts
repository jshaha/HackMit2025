// Client-side function to ask Claude via the server API
export async function askClaude(question: string, nodes?: any[]): Promise<string> {
  try {
    const res = await fetch("/api/ask-claude", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, nodes }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(`Server error: ${res.status} ${errorData.error || 'Unknown error'}`);
    }

    const data = await res.json();
    return data.reply;
  } catch (error) {
    console.error("Error asking Claude:", error);
    throw new Error("Failed to get response from Claude. Please check your connection and try again.");
  }
}
