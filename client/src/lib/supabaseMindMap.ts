import { supabase } from './supabase';
import type { MindMapNode, InsertMindMapNode } from '@shared/schema';

export interface SupabaseMindMapNode {
  id: string;
  user_id: string;
  title: string;
  type: string;
  description: string;
  position_x: number;
  position_y: number;
  created_at: string;
  updated_at: string;
}

export interface SupabaseEdge {
  id: string;
  user_id: string;
  source_id: string;
  target_id: string;
  created_at: string;
}

// Convert Supabase node to app node
export function supabaseToAppNode(supabaseNode: SupabaseMindMapNode): MindMapNode {
  return {
    id: supabaseNode.id,
    title: supabaseNode.title,
    type: supabaseNode.type as any,
    description: supabaseNode.description,
    position: {
      x: supabaseNode.position_x,
      y: supabaseNode.position_y,
    },
  };
}

// Convert app node to Supabase node
export function appToSupabaseNode(appNode: MindMapNode, userId: string): Partial<SupabaseMindMapNode> {
  return {
    id: appNode.id,
    user_id: userId,
    title: appNode.title,
    type: appNode.type,
    description: appNode.description,
    position_x: appNode.position.x,
    position_y: appNode.position.y,
  };
}

// Load all nodes for the current user
export async function loadUserNodes(userId: string): Promise<MindMapNode[]> {
  try {
    const { data, error } = await supabase
      .from('mind_map_nodes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error loading nodes:', error);
      throw error;
    }

    return data?.map(supabaseToAppNode) || [];
  } catch (error) {
    console.error('Failed to load nodes:', error);
    return [];
  }
}

// Save a new node
export async function saveNode(node: InsertMindMapNode, userId: string): Promise<MindMapNode | null> {
  try {
    const supabaseNode = {
      user_id: userId,
      title: node.title,
      type: node.type,
      description: node.description,
      position_x: node.position.x,
      position_y: node.position.y,
    };

    const { data, error } = await supabase
      .from('mind_map_nodes')
      .insert(supabaseNode)
      .select()
      .single();

    if (error) {
      console.error('Error saving node:', error);
      throw error;
    }

    return supabaseToAppNode(data);
  } catch (error) {
    console.error('Failed to save node:', error);
    return null;
  }
}

// Update an existing node
export async function updateNode(node: MindMapNode, userId: string): Promise<MindMapNode | null> {
  try {
    const supabaseNode = {
      title: node.title,
      type: node.type,
      description: node.description,
      position_x: node.position.x,
      position_y: node.position.y,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('mind_map_nodes')
      .update(supabaseNode)
      .eq('id', node.id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating node:', error);
      throw error;
    }

    return supabaseToAppNode(data);
  } catch (error) {
    console.error('Failed to update node:', error);
    return null;
  }
}

// Delete a node
export async function deleteNode(nodeId: string, userId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('mind_map_nodes')
      .delete()
      .eq('id', nodeId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting node:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Failed to delete node:', error);
    return false;
  }
}

// Load edges for the current user
export async function loadUserEdges(userId: string): Promise<{ source: string; target: string; id: string }[]> {
  try {
    const { data, error } = await supabase
      .from('mind_map_edges')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Error loading edges:', error);
      throw error;
    }

    return data?.map(edge => ({
      source: edge.source_id,
      target: edge.target_id,
      id: edge.id,
    })) || [];
  } catch (error) {
    console.error('Failed to load edges:', error);
    return [];
  }
}

// Save an edge
export async function saveEdge(sourceId: string, targetId: string, userId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('mind_map_edges')
      .insert({
        user_id: userId,
        source_id: sourceId,
        target_id: targetId,
      });

    if (error) {
      console.error('Error saving edge:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Failed to save edge:', error);
    return false;
  }
}

// Delete an edge
export async function deleteEdge(edgeId: string, userId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('mind_map_edges')
      .delete()
      .eq('id', edgeId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting edge:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Failed to delete edge:', error);
    return false;
  }
}
