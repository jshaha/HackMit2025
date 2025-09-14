-- Supabase Database Schema for Mind Map Nodes
-- Run this SQL in your Supabase SQL editor

-- Create nodes table
CREATE TABLE nodes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  parent_id UUID REFERENCES nodes(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE nodes ENABLE ROW LEVEL SECURITY;

-- Create policy for users to only see their own nodes
CREATE POLICY "Users can view their own nodes" ON nodes
  FOR SELECT USING (auth.uid() = user_id);

-- Create policy for users to insert their own nodes
CREATE POLICY "Users can insert their own nodes" ON nodes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policy for users to update their own nodes
CREATE POLICY "Users can update their own nodes" ON nodes
  FOR UPDATE USING (auth.uid() = user_id);

-- Create policy for users to delete their own nodes
CREATE POLICY "Users can delete their own nodes" ON nodes
  FOR DELETE USING (auth.uid() = user_id);

-- Create an index on user_id for better performance
CREATE INDEX idx_nodes_user_id ON nodes(user_id);

-- Create an index on parent_id for hierarchical queries
CREATE INDEX idx_nodes_parent_id ON nodes(parent_id);

-- Create attachments table for storing links, images, and files
CREATE TABLE attachments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  node_id UUID REFERENCES nodes(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('link', 'image', 'file')),
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  file_type TEXT CHECK (file_type IN ('document', 'code', 'data', 'image', 'other')),
  file_size BIGINT, -- in bytes
  mime_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security for attachments
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;

-- Create policies for attachments (users can only access attachments for their own nodes)
CREATE POLICY "Users can view attachments for their own nodes" ON attachments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM nodes 
      WHERE nodes.id = attachments.node_id 
      AND nodes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert attachments for their own nodes" ON attachments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM nodes 
      WHERE nodes.id = attachments.node_id 
      AND nodes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update attachments for their own nodes" ON attachments
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM nodes 
      WHERE nodes.id = attachments.node_id 
      AND nodes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete attachments for their own nodes" ON attachments
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM nodes 
      WHERE nodes.id = attachments.node_id 
      AND nodes.user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX idx_attachments_node_id ON attachments(node_id);
CREATE INDEX idx_attachments_type ON attachments(type);

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
