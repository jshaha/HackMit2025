import { useState, useEffect } from 'react';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { getNodesForUser, addNode, updateNode, deleteNode } from '@/lib/nodes';
import { DatabaseNode } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function NodesManager() {
  const { user, isAuthenticated } = useSupabaseAuth();
  const [nodes, setNodes] = useState<DatabaseNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingNode, setEditingNode] = useState<string | null>(null);
  const [newNode, setNewNode] = useState({ title: '', content: '', parent_id: null as string | null });
  const [editingData, setEditingData] = useState({ title: '', content: '', parent_id: null as string | null });

  // Load nodes when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadNodes();
    } else {
      setNodes([]);
    }
  }, [isAuthenticated]);

  const loadNodes = async () => {
    try {
      setLoading(true);
      const userNodes = await getNodesForUser();
      setNodes(userNodes);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load nodes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddNode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNode.title.trim()) return;

    try {
      const addedNode = await addNode({
        title: newNode.title,
        content: newNode.content,
        parent_id: newNode.parent_id || null,
      });
      
      setNodes(prev => [...prev, addedNode]);
      setNewNode({ title: '', content: '', parent_id: null });
      
      toast({
        title: "Success",
        description: "Node added successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add node",
        variant: "destructive",
      });
    }
  };

  const handleUpdateNode = async (nodeId: string) => {
    try {
      const updatedNode = await updateNode(nodeId, editingData);
      setNodes(prev => prev.map(node => node.id === nodeId ? updatedNode : node));
      setEditingNode(null);
      
      toast({
        title: "Success",
        description: "Node updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update node",
        variant: "destructive",
      });
    }
  };

  const handleDeleteNode = async (nodeId: string) => {
    try {
      await deleteNode(nodeId);
      setNodes(prev => prev.filter(node => node.id !== nodeId));
      
      toast({
        title: "Success",
        description: "Node deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete node",
        variant: "destructive",
      });
    }
  };

  const startEditing = (node: DatabaseNode) => {
    setEditingNode(node.id);
    setEditingData({
      title: node.title,
      content: node.content,
      parent_id: node.parent_id,
    });
  };

  const cancelEditing = () => {
    setEditingNode(null);
    setEditingData({ title: '', content: '', parent_id: null });
  };

  if (!isAuthenticated) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Please sign in to manage your nodes.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">My Nodes</h2>
        <Badge variant="outline">
          {nodes.length} node{nodes.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      {/* Add new node form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add New Node
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddNode} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={newNode.title}
                  onChange={(e) => setNewNode(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter node title"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Parent ID (optional)</label>
                <Input
                  value={newNode.parent_id || ''}
                  onChange={(e) => setNewNode(prev => ({ ...prev, parent_id: e.target.value || null }))}
                  placeholder="Enter parent node ID"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Content</label>
              <Textarea
                value={newNode.content}
                onChange={(e) => setNewNode(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Enter node content"
                rows={3}
              />
            </div>
            <Button type="submit" className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Add Node
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Nodes list */}
      {loading ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Loading nodes...</p>
        </div>
      ) : nodes.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">No nodes found. Create your first node above!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {nodes.map((node) => (
            <Card key={node.id}>
              <CardContent className="p-4">
                {editingNode === node.id ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Title</label>
                        <Input
                          value={editingData.title}
                          onChange={(e) => setEditingData(prev => ({ ...prev, title: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Parent ID</label>
                        <Input
                          value={editingData.parent_id || ''}
                          onChange={(e) => setEditingData(prev => ({ ...prev, parent_id: e.target.value || null }))}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Content</label>
                      <Textarea
                        value={editingData.content}
                        onChange={(e) => setEditingData(prev => ({ ...prev, content: e.target.value }))}
                        rows={3}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => handleUpdateNode(node.id)} size="sm">
                        <Save className="w-4 h-4 mr-2" />
                        Save
                      </Button>
                      <Button onClick={cancelEditing} variant="outline" size="sm">
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{node.title}</h3>
                        <p className="text-muted-foreground text-sm mt-1">{node.content}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span>ID: {node.id}</span>
                          {node.parent_id && <span>Parent: {node.parent_id}</span>}
                          <span>Created: {new Date(node.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          onClick={() => startEditing(node)}
                          variant="outline"
                          size="sm"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => handleDeleteNode(node.id)}
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
