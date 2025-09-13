import { useState, useCallback } from 'react';
import { ReactFlow, Background, Controls, MiniMap, useNodesState, useEdgesState, addEdge, Connection, Edge, Node } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import AddNodeSidebar from './AddNodeSidebar';
import NodeDetailsModal from './NodeDetailsModal';
import MindMapNode from './MindMapNode';
import SearchBar from './SearchBar';
import AiPlaceholder from './AiPlaceholder';
import type { MindMapNode as MindMapNodeType, InsertMindMapNode, NodeType } from '@shared/schema';

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
  { id: 'e1-2', source: '1', target: '2', type: 'smoothstep' },
  { id: 'e1-3', source: '1', target: '3', type: 'smoothstep' },
];

export default function MindMapPage() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<MindMapNodeType | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredNodes, setFilteredNodes] = useState(initialNodes);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, type: 'smoothstep' }, eds)),
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
    setIsModalOpen(true);
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

  // Update existing nodes with click handlers and filter based on search
  const updatedNodes = (searchQuery ? filteredNodes : nodes).map(node => ({
    ...node,
    data: {
      ...node.data,
      onClick: () => handleNodeClick(node),
    },
  }));

  return (
    <div className="h-screen w-full flex bg-background" data-testid="page-mind-map">
      <AddNodeSidebar 
        onAddNode={addNode} 
        onSearch={handleSearch}
        onAskAi={handleAskAi}
      />
      
      <div className="flex-1 relative">
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
            nodeColor={(node) => {
              switch (node.data?.type) {
                case 'Concept': return 'hsl(var(--chart-1))';
                case 'Paper': return 'hsl(var(--chart-2))';
                case 'Dataset': return 'hsl(var(--chart-3))';
                default: return 'hsl(var(--muted))';
              }
            }}
          />
        </ReactFlow>
      </div>

      <NodeDetailsModal 
        node={selectedNode}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedNode(null);
        }}
      />
    </div>
  );
}