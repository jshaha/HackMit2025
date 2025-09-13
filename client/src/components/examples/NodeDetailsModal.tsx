import { useState } from 'react';
import { Button } from '@/components/ui/button';
import NodeDetailsModal from '../NodeDetailsModal';
import type { MindMapNode } from '@shared/schema';

export default function NodeDetailsModalExample() {
  const [isOpen, setIsOpen] = useState(false);
  
  const sampleNode: MindMapNode = {
    id: 'example-node-1',
    title: 'Deep Learning',
    type: 'Concept',
    description: 'A subset of machine learning that uses neural networks with multiple layers to model and understand complex patterns in data. It has revolutionized fields like computer vision, natural language processing, and speech recognition.',
    position: { x: 100, y: 200 }
  };

  return (
    <div className="p-8 bg-background">
      <Button onClick={() => setIsOpen(true)} data-testid="button-open-modal">
        Open Node Details Modal
      </Button>
      
      <NodeDetailsModal 
        node={sampleNode}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </div>
  );
}