import AddNodeSidebar from '../AddNodeSidebar';
import type { InsertMindMapNode } from '@shared/schema';

export default function AddNodeSidebarExample() {
  const handleAddNode = (node: InsertMindMapNode) => {
    console.log('New node added:', node);
  };

  const handleSearch = (query: string) => {
    console.log('Search query:', query);
  };

  const handleAskAi = (question: string) => {
    console.log('AI question:', question);
  };

  return (
    <div className="h-screen bg-background">
      <AddNodeSidebar 
        onAddNode={handleAddNode} 
        onSearch={handleSearch}
        onAskAi={handleAskAi}
      />
    </div>
  );
}