import { useState, useCallback } from 'react';
import { ReactFlow, Background, Controls, MiniMap, useNodesState, useEdgesState, addEdge, Connection, Node } from 'reactflow';
import 'reactflow/dist/style.css';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { Edit2, X, Trash2, Sparkles, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AddNodeSidebar from './AddNodeSidebar';
import MindMapNode from './MindMapNode';
import SupabaseAuthButtons from './SupabaseAuthButtons';
import type { MindMapNode as MindMapNodeType, InsertMindMapNode, NodeType } from '@shared/schema';
import { getAiRecommendations, type AiRecommendation } from '@/lib/getAiRecommendations';

// Define the node data type
type MindMapNodeData = {
  title: string;
  type: NodeType;
  description: string;
  onClick: () => void;
  onDelete?: () => void;
  onAiRecommend?: () => void;
  onAccept?: () => void;
  isRecommendation?: boolean;
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
  const [showRecommendation, setShowRecommendation] = useState(false);
  const [recommendedNode, setRecommendedNode] = useState<InsertMindMapNode | null>(null);

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
    // Regular node click
    console.log('Node clicked:', nodeData); // Debug log
    
    // Handle case where nodeData might not have data property
    const nodeTitle = nodeData.data?.title || nodeData.title;
    const nodeType = nodeData.data?.type || nodeData.type;
    const nodeDescription = nodeData.data?.description || nodeData.description;
    
    if (!nodeTitle) {
      console.error('Node data is missing title:', nodeData);
      return;
    }
    
    const node: MindMapNodeType = {
      id: nodeData.id,
      title: nodeTitle,
      type: nodeType,
      description: nodeDescription,
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

  // AI Recommendation utilities
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState<AiRecommendation[]>([]);
  const [showAiRecommendations, setShowAiRecommendations] = useState(false);
  const [selectedEdge, setSelectedEdge] = useState<string | null>(null);
  const [showEdgeContextMenu, setShowEdgeContextMenu] = useState(false);
  const [edgeContextMenuPosition, setEdgeContextMenuPosition] = useState({ x: 0, y: 0 });

  // Handle accepting a recommendation (clicking Accept button)
  const handleAcceptRecommendation = useCallback((recommendation: AiRecommendation, nodeId: string) => {
    console.log('handleAcceptRecommendation called with:', { recommendation, nodeId, selectedNode });
    
    if (!selectedNode) {
      console.log('No selected node, returning');
      return;
    }
    
    // Find the accepted recommendation node to keep its position
    setNodes((currentNodes) => {
      const acceptedNode = currentNodes.find(n => n.id === nodeId);
      
      if (!acceptedNode) {
        console.log('No accepted node found with ID:', nodeId);
        return currentNodes;
      }
      
      // Convert the accepted recommendation node to a permanent node
      const permanentNodeId = `node-${Date.now()}`;
      const permanentNode: ReactFlowMindMapNode = {
        id: permanentNodeId,
        type: 'mindMapNode',
        position: acceptedNode.position,
        data: {
          title: recommendation.title,
          type: recommendation.type,
          description: recommendation.description,
          onClick: () => handleNodeClick({
            id: permanentNodeId,
            title: recommendation.title,
            type: recommendation.type,
            description: recommendation.description,
            position: acceptedNode.position,
          }),
        },
      };
      
      // Remove all recommendation nodes and add the permanent node
      const filteredNodes = currentNodes.filter(node => !node.data.isRecommendation);
      return [...filteredNodes, permanentNode];
    });
    
    // Remove recommendation edges and add solid edge
    setEdges((currentEdges) => {
      const filteredEdges = currentEdges.filter(edge => !edge.style?.strokeDasharray);
      
      const permanentNodeId = `node-${Date.now()}`;
      const newEdge = {
        id: `edge-${Date.now()}`,
        source: selectedNode.id,
        target: permanentNodeId,
        type: 'default' as const,
        style: { stroke: '#8b5cf6', strokeWidth: 2 },
      };
      
      return [...filteredEdges, newEdge];
    });
    
    // Clear AI recommendations state
    setAiRecommendations([]);
    setShowAiRecommendations(false);
  }, [selectedNode, setNodes, setEdges, handleNodeClick]);

  const handleGetAiRecommendationsForNode = useCallback(async (nodeData: MindMapNodeType) => {
    setIsLoadingRecommendations(true);
    try {
      // Get AI recommendations based on the provided node and all nodes
      const response = await getAiRecommendations(nodeData, nodes);
      
      // Add recommendations as regular nodes with dotted edges
      const timestamp = Date.now();
      response.recommendations.forEach((rec, index) => {
        const newNodeId = `rec-${timestamp}-${index}`;
        
        // Position all suggestions below the selected node in a horizontal line
        const spacing = 200; // Horizontal spacing between suggestions
        const verticalOffset = 200; // Distance below the selected node
        const numRecs = response.recommendations.length;
        
        // Center the suggestions horizontally around the selected node
        const totalWidth = (numRecs - 1) * spacing;
        const startX = nodeData.position.x - (totalWidth / 2);
        
        const x = startX + (index * spacing);
        const y = nodeData.position.y + verticalOffset;
        
        const newNode: ReactFlowMindMapNode = {
          id: newNodeId,
          type: 'mindMapNode',
          position: { x, y },
          data: {
            title: rec.title,
            type: rec.type,
            description: rec.description,
            isRecommendation: true,
            onClick: () => handleNodeClick({ id: newNodeId, data: { title: rec.title, type: rec.type, description: rec.description }, position: { x, y } }),
            onAccept: () => handleAcceptRecommendation(rec, newNodeId),
            // Explicitly omit onDelete and onAiRecommend to hide those buttons
          },
        };
        
        // Add the recommended node
        setNodes((nds) => [...nds, newNode]);
        
        // Create dotted edge from selected node to recommended node
        const newEdge = {
          id: `rec-edge-${timestamp}-${index}`,
          source: nodeData.id,
          target: newNodeId,
          type: 'default' as const,
          style: { 
            stroke: '#8b5cf6', 
            strokeWidth: 2, 
            strokeDasharray: '5,5',
            opacity: 0.7
          },
          animated: true,
        };
        setEdges((eds) => [...eds, newEdge]);
      });
      
      // Store recommendations for click handling
      setAiRecommendations(response.recommendations.map((rec, index) => ({
        ...rec,
        nodeId: `rec-${timestamp}-${index}`
      })));
      
    } catch (error) {
      console.error('Failed to get AI recommendations:', error);
      // Fallback to simple recommendations
      const fallbackRecs = [
        {
          title: 'Related Research',
          type: 'Concept' as const,
          description: 'A related concept that builds upon the selected node.',
          reasoning: 'This is a fallback recommendation when AI recommendations fail.'
        },
        {
          title: 'Test Paper',
          type: 'Paper' as const,
          description: 'A test paper recommendation.',
          reasoning: 'This is a test paper recommendation.'
        },
        {
          title: 'Test Dataset',
          type: 'Dataset' as const,
          description: 'A test dataset recommendation.',
          reasoning: 'This is a test dataset recommendation.'
        }
      ];
      
      // Add fallback recommendations as nodes
      const timestamp = Date.now();
      fallbackRecs.forEach((rec, index) => {
        const newNodeId = `rec-${timestamp}-${index}`;
        
        // Position all suggestions below the selected node in a horizontal line
        const spacing = 200; // Horizontal spacing between suggestions
        const verticalOffset = 200; // Distance below the selected node
        const numRecs = fallbackRecs.length;
        
        // Center the suggestions horizontally around the selected node
        const totalWidth = (numRecs - 1) * spacing;
        const startX = nodeData.position.x - (totalWidth / 2);
        
        const x = startX + (index * spacing);
        const y = nodeData.position.y + verticalOffset;
        
        const newNode: ReactFlowMindMapNode = {
          id: newNodeId,
          type: 'mindMapNode',
          position: { x, y },
          data: {
            title: rec.title,
            type: rec.type,
            description: rec.description,
            isRecommendation: true,
            onClick: () => handleNodeClick({ id: newNodeId, data: { title: rec.title, type: rec.type, description: rec.description }, position: { x, y } }),
            onAccept: () => handleAcceptRecommendation(rec, newNodeId),
            // Explicitly omit onDelete and onAiRecommend to hide those buttons
          },
        };
        
        setNodes((nds) => [...nds, newNode]);
        
        const newEdge = {
          id: `rec-edge-${timestamp}-${index}`,
          source: nodeData.id,
          target: newNodeId,
          type: 'default' as const,
          style: { 
            stroke: '#8b5cf6', 
            strokeWidth: 2, 
            strokeDasharray: '5,5',
            opacity: 0.7
          },
          animated: true,
        };
        setEdges((eds) => [...eds, newEdge]);
      });
      
      setAiRecommendations(fallbackRecs.map((rec, index) => ({
        ...rec,
        nodeId: `rec-${timestamp}-${index}`
      })));
    } finally {
      setIsLoadingRecommendations(false);
    }
  }, [nodes, setNodes, setEdges, handleNodeClick, handleAcceptRecommendation]);

  const handleGetAiRecommendations = useCallback(async () => {
    if (!selectedNode) {
      console.log('No node selected for AI recommendations');
      return;
    }
    
    return handleGetAiRecommendationsForNode(selectedNode);
  }, [selectedNode, handleGetAiRecommendationsForNode]);

  const handleDeclineAiRecommendations = useCallback(() => {
    setShowAiRecommendations(false);
    setAiRecommendations([]);
    setIsLoadingRecommendations(false);
  }, []);


  const handleDeclineRecommendation = useCallback(() => {
    setShowRecommendation(false);
    setRecommendedNode(null);
  }, []);

  // Edge handling functions
  const handleEdgeClick = useCallback((event: React.MouseEvent, edgeId: string) => {
    event.stopPropagation();
    setSelectedEdge(edgeId);
    setShowEdgeContextMenu(true);
    setEdgeContextMenuPosition({ x: event.clientX, y: event.clientY });
  }, []);

  const handleDeleteEdge = useCallback((edgeId: string) => {
    setEdges((eds) => eds.filter(edge => edge.id !== edgeId));
    setShowEdgeContextMenu(false);
    setSelectedEdge(null);
  }, [setEdges]);

  const handleEdgeContextMenuClose = useCallback(() => {
    setShowEdgeContextMenu(false);
    setSelectedEdge(null);
  }, []);

  // Update existing nodes with click handlers and filter based on search
  const updatedNodes = (searchQuery ? filteredNodes : nodes).map(node => ({
    ...node,
    data: {
      ...node.data,
      onClick: () => handleNodeClick(node),
      onDelete: () => handleDeleteNode(node.id),
      onAiRecommend: () => {
        // Set the node as selected first, then get recommendations
        const nodeData = {
          id: node.id,
          title: node.data.title,
          type: node.data.type,
          description: node.data.description,
          position: node.position,
        };
        setSelectedNode(nodeData);
        
        // Call handleGetAiRecommendations with the nodeData directly
        handleGetAiRecommendationsForNode(nodeData);
      },
    },
  }));

  // Use regular nodes and edges (recommendations are added directly as nodes)
  const allNodes = updatedNodes;
  const allEdges = edges;

  return (
    <div className="h-screen w-full bg-background" data-testid="page-mind-map">
      <PanelGroup direction="horizontal" className="h-full">
        <Panel defaultSize={20} minSize={15} maxSize={30}>
          <AddNodeSidebar 
            onAddNode={addNode}
            onSearch={handleSearch}
            onAskAi={handleAskAi}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        </Panel>
        
        <PanelResizeHandle className="w-1 bg-border hover:bg-primary/20 transition-colors cursor-col-resize flex items-center justify-center group">
          <div className="w-0.5 h-6 bg-border group-hover:bg-primary/40 rounded-full transition-colors" />
        </PanelResizeHandle>

        {/* Node Details Sidebar - Only show when node is selected */}
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
                          className="h-6 px-2 text-xs"
                        >
                          <Edit2 className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleGetAiRecommendations}
                          disabled={isLoadingRecommendations}
                          className="h-6 px-2 text-xs"
                        >
                          <Sparkles className="w-3 h-3 mr-1" />
                          {isLoadingRecommendations ? 'Loading...' : 'AI'}
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
                          />
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Type</label>
                          <Select 
                            value={editingNodeData.type} 
                            onValueChange={(value) => handleEditingNodeChange('type', value)}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Concept">Concept</SelectItem>
                              <SelectItem value="Person">Person</SelectItem>
                              <SelectItem value="Paper">Paper</SelectItem>
                              <SelectItem value="Tool">Tool</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Description</label>
                          <Textarea
                            value={editingNodeData.description}
                            onChange={(e) => handleEditingNodeChange('description', e.target.value)}
                            className="mt-1 min-h-[100px]"
                            placeholder="Enter description..."
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Title</label>
                          <h3 className="text-lg font-medium mt-1">{selectedNode.title}</h3>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Type</label>
                          <div className="mt-1">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white" style={{
                              backgroundColor: selectedNode.type === 'Concept' ? '#5603AD' :
                                             selectedNode.type === 'Person' ? '#B91C1C' :
                                             selectedNode.type === 'Tool' ? '#059669' :
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

        <Panel defaultSize={selectedNode ? 55 : 75}>
          <div className="h-full relative">
            {/* Auth Buttons - Top right */}
            <div className="absolute top-4 right-4 z-10">
              <SupabaseAuthButtons />
            </div>

            {/* AI Recommendations Button - Only show when node is selected */}
            {selectedNode && (
              <div className="absolute top-16 right-4 z-10">
                <Button
                  onClick={handleGetAiRecommendations}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg"
                  size="sm"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Suggest Next Node
                </Button>
              </div>
            )}

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

            {/* AI Recommendation Dialog */}
            {showRecommendation && recommendedNode && (
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center z-30">
                <div className="bg-white rounded-lg shadow-xl p-6 max-w-md mx-4 border">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                    AI Recommendation
                  </h3>
                  
                  <div className="space-y-3 mb-6">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Suggested Node</label>
                      <h4 className="text-lg font-semibold">{recommendedNode.title}</h4>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-600">Type</label>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ml-2 ${
                        recommendedNode.type === 'Concept' ? 'text-black' :
                        recommendedNode.type === 'Paper' ? 'text-white' :
                        'text-white'
                      }`}
                      style={{
                        backgroundColor: recommendedNode.type === 'Concept' ? '#C2F8CB' :
                                       recommendedNode.type === 'Paper' ? '#8367C7' :
                                       '#5603AD'
                      }}>
                        {recommendedNode.type}
                      </span>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-600">Description</label>
                      <p className="text-sm text-gray-700 mt-1">{recommendedNode.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={handleDeclineRecommendation}
                      className="flex-1"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Decline
                    </Button>
                    <Button
                      onClick={() => {
                        console.log('Accept button clicked with:', { recommendedNode, selectedNode });
                        console.log('All nodes:', nodes);
                        console.log('Looking for node with title:', recommendedNode.title);
                        // Find the actual recommendation node ID
                        const recNode = nodes.find(n => {
                          console.log('Checking node:', n, 'data:', n.data);
                          return n.data?.title === recommendedNode.title && (n.data as any)?.isRecommendation;
                        });
                        const nodeId = recNode?.id || '';
                        console.log('Found recommendation node:', recNode, 'ID:', nodeId);
                        handleAcceptRecommendation(recommendedNode, nodeId);
                      }}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Accept
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <ReactFlow
              nodes={allNodes}
              edges={allEdges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              nodeTypes={nodeTypes}
              onNodeClick={handleNodeClick}
              onPaneClick={() => setSelectedNode(null)}
              onEdgeClick={(event, edge) => handleEdgeClick(event, edge.id)}
              className="bg-background"
              fitView
              fitViewOptions={{ padding: 0.1 }}
            >
              <Background color="#94a3b8" gap={16} />
              <Controls className="bg-card border border-border rounded-lg shadow-sm" />
              <MiniMap 
                className="bg-card border border-border rounded-lg"
                nodeColor={() => '#F0F0F0'}
              />
            </ReactFlow>

            {/* Edge Context Menu */}
            {showEdgeContextMenu && selectedEdge && (
              <div 
                className="absolute bg-white border border-gray-300 rounded shadow-lg z-50 p-2"
                style={{ 
                  left: edgeContextMenuPosition.x, 
                  top: edgeContextMenuPosition.y 
                }}
                onClick={handleEdgeContextMenuClose}
              >
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteEdge(selectedEdge)}
                  className="w-full text-left justify-start"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Edge
                </Button>
              </div>
            )}
          </div>
        </Panel>
      </PanelGroup>
    </div>
  );
};