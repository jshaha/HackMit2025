import { useState, useCallback } from 'react';
import { ReactFlow, Background, Controls, MiniMap, useNodesState, useEdgesState, addEdge, Connection, Node } from 'reactflow';
import 'reactflow/dist/style.css';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { Edit2, X, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AddNodeSidebar from './AddNodeSidebar';
import MindMapNode from './MindMapNode';
import type { MindMapNode as MindMapNodeType, InsertMindMapNode, NodeType } from '@shared/schema';
import { nodeTypes as schemaNodeTypes } from '@shared/schema';

// Define the node data type
type MindMapNodeData = {
  title: string;
  type: NodeType;
  description: string;
  onClick: () => void;
};

// Define the React Flow node type
type ReactFlowMindMapNode = Node<MindMapNodeData, 'mindMapNode'>;

// Register custom node types
const nodeTypes = {
  mindMapNode: MindMapNode,
};

// Example data - 3 nodes and 2 edges as requested
const initialNodes: ReactFlowMindMapNode[] = [
  {
    id: '1',
    type: 'mindMapNode',
    position: { x: 250, y: 100 },
    data: {
      title: 'Machine Learning',
      type: 'Concept' as const,
      description: 'Core concepts and algorithms in machine learning, including supervised and unsupervised learning techniques.',
      onClick: () => {},
    },
  },
  {
    id: '2', 
    type: 'mindMapNode',
    position: { x: 100, y: 250 },
    data: {
      title: 'GPT-4 Paper',
      type: 'Paper' as const,
      description: 'OpenAI\'s technical paper describing the GPT-4 large language model architecture and capabilities.',
      onClick: () => {},
    },
  },
  {
    id: '3',
    type: 'mindMapNode', 
    position: { x: 400, y: 250 },
    data: {
      title: 'ImageNet',
      type: 'Dataset' as const,
      description: 'Large-scale image database used for visual object recognition research with over 14 million images.',
      onClick: () => {},
    },
  },
];

const initialEdges = [
  { 
    id: 'e1-2', 
    source: '1', 
    target: '2', 
    type: 'default',
    style: { stroke: '#94a3b8', strokeWidth: 2 }
  },
  { 
    id: 'e1-3', 
    source: '1', 
    target: '3', 
    type: 'default',
    style: { stroke: '#94a3b8', strokeWidth: 2 }
  },
];

export default function MindMapPage() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<MindMapNodeType | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredNodes, setFilteredNodes] = useState<ReactFlowMindMapNode[]>(initialNodes);
  const [mindMapTitle, setMindMapTitle] = useState('My Research Mind Map');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(mindMapTitle);
  const [isEditingNode, setIsEditingNode] = useState(false);
  const [editingNodeData, setEditingNodeData] = useState<MindMapNodeType | null>(null);

  const onConnect = useCallback(
    (params: Connection) => {
      const newEdge = {
        ...params,
        type: 'default' as const,
        style: { stroke: '#94a3b8', strokeWidth: 2 }
      };
      
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [setEdges]
  );

  const handleNodeClick = useCallback((nodeData: any) => {
    const node: MindMapNodeType = {
      id: nodeData.id,
      title: nodeData.data.title,
      type: nodeData.data.type,
      description: nodeData.data.description,
      position: nodeData.position,
    };
    setSelectedNode(node);
  }, []);

  const addNode = useCallback((nodeData: InsertMindMapNode) => {
    const id = `node-${Date.now()}`;
    const newNode: ReactFlowMindMapNode = {
      id,
      type: 'mindMapNode',
      position: nodeData.position,
      data: {
        title: nodeData.title,
        type: nodeData.type,
        description: nodeData.description,
        onClick: () => handleNodeClick({ id, data: nodeData, position: nodeData.position }),
      },
    };
    
    setNodes((nds) => [...nds, newNode]);
  }, [setNodes, handleNodeClick]);

  // Handle search functionality
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredNodes(nodes);
      return;
    }
    
    const filtered = nodes.filter(node => 
      node.data.title.toLowerCase().includes(query.toLowerCase()) ||
      node.data.type.toLowerCase().includes(query.toLowerCase()) ||
      node.data.description.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredNodes(filtered);
  }, [nodes]);

  // Handle AI questions
  const handleAskAi = useCallback((question: string) => {
    console.log('AI question received:', question);
    // This would integrate with an actual AI service
  }, []);

  // Handle title editing
  const handleTitleEdit = useCallback(() => {
    setIsEditingTitle(true);
    setTempTitle(mindMapTitle);
  }, [mindMapTitle]);

  const handleTitleSave = useCallback(() => {
    setMindMapTitle(tempTitle);
    setIsEditingTitle(false);
  }, [tempTitle]);

  const handleTitleCancel = useCallback(() => {
    setTempTitle(mindMapTitle);
    setIsEditingTitle(false);
  }, [mindMapTitle]);

  const handleTitleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleSave();
    } else if (e.key === 'Escape') {
      handleTitleCancel();
    }
  }, [handleTitleSave, handleTitleCancel]);

  // Handle node deletion with edge reconnection
  const handleDeleteNode = useCallback((nodeId: string) => {
    // Find edges connected to this node
    const connectedEdges = edges.filter(edge => 
      edge.source === nodeId || edge.target === nodeId
    );
    
    // Find parent and child nodes
    const parentEdges = connectedEdges.filter(edge => edge.target === nodeId);
    const childEdges = connectedEdges.filter(edge => edge.source === nodeId);
    
    // Create new edges connecting parents to children
    const newEdges: any[] = [];
    parentEdges.forEach(parentEdge => {
      childEdges.forEach(childEdge => {
        newEdges.push({
          id: `reconnect-${parentEdge.source}-${childEdge.target}`,
          source: parentEdge.source,
          target: childEdge.target,
          type: 'default',
          style: { stroke: '#94a3b8', strokeWidth: 2 }
        });
      });
    });
    
    // Update state
    setNodes(nodes => nodes.filter(node => node.id !== nodeId));
    setEdges(edges => [
      ...edges.filter(edge => edge.source !== nodeId && edge.target !== nodeId),
      ...newEdges
    ]);
    setSelectedNode(null); // Close sidebar
  }, [edges, setNodes, setEdges]);

  // Handle node editing
  const handleEditNode = useCallback(() => {
    if (selectedNode) {
      setIsEditingNode(true);
      setEditingNodeData({ ...selectedNode });
    }
  }, [selectedNode]);

  const handleSaveNodeEdit = useCallback(() => {
    if (editingNodeData) {
      // Update the node in React Flow
      setNodes(nodes => nodes.map(node => 
        node.id === editingNodeData.id 
          ? {
              ...node,
              data: {
                ...node.data,
                title: editingNodeData.title,
                type: editingNodeData.type,
                description: editingNodeData.description
              }
            }
          : node
      ));
      
      setSelectedNode(editingNodeData);
      setIsEditingNode(false);
      setEditingNodeData(null);
    }
  }, [editingNodeData, setNodes]);

  const handleCancelNodeEdit = useCallback(() => {
    setIsEditingNode(false);
    setEditingNodeData(null);
  }, []);

  const handleEditingNodeChange = useCallback((field: keyof MindMapNodeType, value: any) => {
    if (editingNodeData) {
      setEditingNodeData({
        ...editingNodeData,
        [field]: value
      });
    }
  }, [editingNodeData]);

  // Update existing nodes with click handlers and filter based on search
  const updatedNodes = (searchQuery ? filteredNodes : nodes).map(node => ({
    ...node,
    data: {
      ...node.data,
      onClick: () => handleNodeClick(node),
    },
  }));

  return (
    <div className="h-screen w-full bg-background" data-testid="page-mind-map">
      <PanelGroup direction="horizontal">
        <Panel defaultSize={25} minSize={20} maxSize={40}>
          <div style={{ backgroundColor: '#F5F5F5' }} className="h-full">
            <AddNodeSidebar 
              onAddNode={addNode} 
              onSearch={handleSearch}
              onAskAi={handleAskAi}
            />
          </div>
        </Panel>
        
        <PanelResizeHandle className="w-1 bg-border hover:bg-primary/20 transition-colors cursor-col-resize flex items-center justify-center group">
          <div className="w-0.5 h-6 bg-border group-hover:bg-primary/40 rounded-full transition-colors" />
        </PanelResizeHandle>

        {selectedNode && (
          <>
            <Panel defaultSize={25} minSize={20} maxSize={40}>
              <div className="border-r border-border h-full overflow-y-auto flex flex-col" style={{ backgroundColor: '#F5F5F5' }} data-testid="sidebar-node-details">
                {/* Header */}
                <div className="p-4 border-b border-border flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Node Details</h2>
                  <div className="flex items-center gap-2">
                    {isEditingNode ? (
                      <>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={handleSaveNodeEdit}
                          className="h-6 px-2 text-xs"
                        >
                          Save
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleCancelNodeEdit}
                          className="h-6 px-2 text-xs"
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleEditNode}
                          className="h-6 w-6 p-0"
                        >
                          <Edit2 className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteNode(selectedNode.id)}
                          className="h-6 w-6 p-0"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSelectedNode(null)}
                      className="h-6 w-6"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                {/* Content */}
                <div className="p-4 flex-1">
                  <div className="space-y-4">
                    {isEditingNode && editingNodeData ? (
                      <>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Title</label>
                          <Input
                            value={editingNodeData.title}
                            onChange={(e) => handleEditingNodeChange('title', e.target.value)}
                            className="mt-1"
                            placeholder="Enter node title..."
                          />
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Type</label>
                          <Select
                            value={editingNodeData.type}
                            onValueChange={(value) => handleEditingNodeChange('type', value)}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Select node type" />
                            </SelectTrigger>
                            <SelectContent>
                              {schemaNodeTypes.map((type: string) => (
                                <SelectItem key={type} value={type}>
                                  {type}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Description</label>
                          <Textarea
                            value={editingNodeData.description}
                            onChange={(e) => handleEditingNodeChange('description', e.target.value)}
                            className="mt-1 resize-none min-h-20"
                            placeholder="Describe this node..."
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Title</label>
                          <h3 className="text-lg font-semibold mt-1">{selectedNode.title}</h3>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Type</label>
                          <div className="mt-1">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              selectedNode.type === 'Concept' ? 'text-black' :
                              selectedNode.type === 'Paper' ? 'text-white' :
                              'text-white'
                            }`}
                            style={{
                              backgroundColor: selectedNode.type === 'Concept' ? '#C2F8CB' :
                                             selectedNode.type === 'Paper' ? '#8367C7' :
                                             '#5603AD'
                            }}>
                              {selectedNode.type}
                            </span>
                          </div>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Description</label>
                          <p className="text-sm mt-1 leading-relaxed">{selectedNode.description}</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </Panel>
            
            <PanelResizeHandle className="w-1 bg-border hover:bg-primary/20 transition-colors cursor-col-resize flex items-center justify-center group">
              <div className="w-0.5 h-6 bg-border group-hover:bg-primary/40 rounded-full transition-colors" />
            </PanelResizeHandle>
          </>
        )}
        
        <Panel defaultSize={75}>
          <div className="h-full relative">
            {/* Mind Map Title */}
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 group">
              {isEditingTitle ? (
                <Input
                  value={tempTitle}
                  onChange={(e) => setTempTitle(e.target.value)}
                  onKeyDown={handleTitleKeyDown}
                  onBlur={handleTitleSave}
                  className="text-lg font-semibold text-center bg-transparent border-0 focus-visible:ring-0 shadow-none"
                  autoFocus
                />
              ) : (
                <div className="flex items-center gap-2 cursor-pointer">
                  <h1 className="text-lg font-semibold text-foreground">{mindMapTitle}</h1>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={handleTitleEdit}
                  >
                    <Edit2 className="w-3 h-3" />
                  </Button>
                </div>
              )}
            </div>

            {searchQuery && filteredNodes.length === 0 && (
              <div className="absolute top-4 left-4 z-10 bg-card border border-border rounded-lg p-3 shadow-sm">
                <p className="text-sm text-muted-foreground">No nodes found matching "{searchQuery}"</p>
              </div>
            )}
            <ReactFlow
              nodes={updatedNodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              nodeTypes={nodeTypes}
              className="bg-background"
              data-testid="canvas-react-flow"
            >
              <Background color="#94a3b8" gap={16} />
              <Controls className="bg-card border border-border rounded-lg shadow-sm" />
              <MiniMap 
                className="bg-card border border-border rounded-lg"
                nodeColor={() => '#F0F0F0'}
              />
            </ReactFlow>
          </div>
        </Panel>
      </PanelGroup>
    </div>
  );
}