// Client-side function to get AI node recommendations
export interface AiRecommendation {
  title: string;
  type: 'Concept' | 'Paper' | 'Dataset' | 'Tool' | 'Person' | 'Organization' | 'Event' | 'Method';
  description: string;
  reasoning: string;
}

export interface AiRecommendationsResponse {
  recommendations: AiRecommendation[];
}

export async function getAiRecommendations(
  selectedNode: any, 
  allNodes: any[]
): Promise<AiRecommendationsResponse> {
  try {
    const res = await fetch("/api/ai-recommendations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ selectedNode, allNodes }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(`Server error: ${res.status} ${errorData.error || 'Unknown error'}`);
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error getting AI recommendations:", error);
    throw new Error("Failed to get AI recommendations. Please check your connection and try again.");
  }
}
