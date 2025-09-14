-- Supabase Database Schema for Mind Map Application
-- Run this SQL in your Supabase SQL editor

-- Create mind_map_nodes table
CREATE TABLE mind_map_nodes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('Concept', 'Paper', 'Dataset', 'Tool', 'Person', 'Organization', 'Event', 'Method')),
  description TEXT NOT NULL DEFAULT '',
  position_x REAL NOT NULL DEFAULT 0,
  position_y REAL NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create mind_map_edges table
CREATE TABLE mind_map_edges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  source_id UUID REFERENCES mind_map_nodes(id) ON DELETE CASCADE,
  target_id UUID REFERENCES mind_map_nodes(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE mind_map_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE mind_map_edges ENABLE ROW LEVEL SECURITY;

-- Create policies for mind_map_nodes
CREATE POLICY "Users can view their own mind map nodes" ON mind_map_nodes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own mind map nodes" ON mind_map_nodes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own mind map nodes" ON mind_map_nodes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own mind map nodes" ON mind_map_nodes
  FOR DELETE USING (auth.uid() = user_id);

-- Create policies for mind_map_edges
CREATE POLICY "Users can view their own mind map edges" ON mind_map_edges
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own mind map edges" ON mind_map_edges
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own mind map edges" ON mind_map_edges
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_mind_map_nodes_user_id ON mind_map_nodes(user_id);
CREATE INDEX idx_mind_map_edges_user_id ON mind_map_edges(user_id);
CREATE INDEX idx_mind_map_edges_source_id ON mind_map_edges(source_id);
CREATE INDEX idx_mind_map_edges_target_id ON mind_map_edges(target_id);

-- Optional: Create a function to get all descendants of a node
CREATE OR REPLACE FUNCTION get_node_descendants(node_uuid UUID)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  title TEXT,
  content TEXT,
  parent_id UUID,
  created_at TIMESTAMP WITH TIME ZONE,
  level INTEGER
) AS $$
BEGIN
  RETURN QUERY
  WITH RECURSIVE descendants AS (
    -- Base case: the node itself
    SELECT 
      n.id,
      n.user_id,
      n.title,
      n.content,
      n.parent_id,
      n.created_at,
      0 as level
    FROM nodes n
    WHERE n.id = node_uuid
    AND n.user_id = auth.uid()
    
    UNION ALL
    
    -- Recursive case: children of nodes in the result set
    SELECT 
      n.id,
      n.user_id,
      n.title,
      n.content,
      n.parent_id,
      n.created_at,
      d.level + 1
    FROM nodes n
    INNER JOIN descendants d ON n.parent_id = d.id
    WHERE n.user_id = auth.uid()
  )
  SELECT * FROM descendants;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
