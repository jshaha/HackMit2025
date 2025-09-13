import AddNodeSidebar from '../AddNodeSidebar';
import type { InsertMindMapNode } from '@shared/schema';

export default function AddNodeSidebarExample() {
  const handleAddNode = (node: InsertMindMapNode) => {
    console.log('New node added:', node);
  };

  return (
    <div className="h-screen bg-background">
      <AddNodeSidebar onAddNode={handleAddNode} />
    </div>
  );
}