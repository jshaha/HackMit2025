import { supabase } from './supabase';
import { DatabaseNode, InsertDatabaseNode, UpdateDatabaseNode } from './supabase';

// Get all nodes for the current logged-in user
export async function getNodesForUser(): Promise<DatabaseNode[]> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('nodes')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch nodes: ${error.message}`);
  }

  return data || [];
}

// Add a new node for the current user
export async function addNode(nodeData: Omit<InsertDatabaseNode, 'user_id'>): Promise<DatabaseNode> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const newNode: InsertDatabaseNode = {
    ...nodeData,
    user_id: user.id,
  };

  const { data, error } = await supabase
    .from('nodes')
    .insert(newNode)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create node: ${error.message}`);
  }

  return data;
}

// Update a node
export async function updateNode(nodeId: string, updates: UpdateDatabaseNode): Promise<DatabaseNode> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('nodes')
    .update(updates)
    .eq('id', nodeId)
    .eq('user_id', user.id) // Ensure user can only update their own nodes
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update node: ${error.message}`);
  }

  return data;
}

// Delete a node
export async function deleteNode(nodeId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { error } = await supabase
    .from('nodes')
    .delete()
    .eq('id', nodeId)
    .eq('user_id', user.id); // Ensure user can only delete their own nodes

  if (error) {
    throw new Error(`Failed to delete node: ${error.message}`);
  }
}

// Get a single node by ID
export async function getNodeById(nodeId: string): Promise<DatabaseNode | null> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('nodes')
    .select('*')
    .eq('id', nodeId)
    .eq('user_id', user.id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Node not found
    }
    throw new Error(`Failed to fetch node: ${error.message}`);
  }

  return data;
}
