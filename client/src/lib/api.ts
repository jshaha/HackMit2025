import type { SavedMap, InsertSavedMap } from '@shared/schema';

const API_BASE = '/api';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new ApiError(response.status, error.error || 'Request failed');
  }

  return response.json();
}

export const mindMapApi = {
  // Get all saved maps for a user
  async getSavedMaps(userId: string): Promise<SavedMap[]> {
    return fetchApi(`/maps/${userId}`);
  },

  // Get a specific saved map
  async getSavedMap(userId: string, mapId: string): Promise<SavedMap> {
    return fetchApi(`/maps/${userId}/${mapId}`);
  },

  // Create a new saved map
  async createSavedMap(mapData: InsertSavedMap): Promise<SavedMap> {
    return fetchApi('/maps', {
      method: 'POST',
      body: JSON.stringify(mapData),
    });
  },

  // Update an existing saved map
  async updateSavedMap(mapId: string, mapData: Partial<InsertSavedMap>): Promise<SavedMap> {
    return fetchApi(`/maps/${mapId}`, {
      method: 'PUT',
      body: JSON.stringify(mapData),
    });
  },

  // Delete a saved map
  async deleteSavedMap(userId: string, mapId: string): Promise<{ message: string }> {
    return fetchApi(`/maps/${userId}/${mapId}`, {
      method: 'DELETE',
    });
  },

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return fetchApi('/health');
  },
};
