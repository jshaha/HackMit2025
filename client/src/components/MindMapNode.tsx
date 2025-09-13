import { Handle, Position } from '@xyflow/react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { NodeType } from '@shared/schema';

interface MindMapNodeProps {
  data: {
    title: string;
    type: NodeType;
    description: string;
    onClick: () => void;
  };
}

const nodeTypeColors = {
  Concept: 'bg-chart-1 border-chart-1',
  Paper: 'bg-chart-2 border-chart-2', 
  Dataset: 'bg-chart-3 border-chart-3',
};

export default function MindMapNode({ data }: MindMapNodeProps) {
  return (
    <>
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-muted-foreground border-2 border-background"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-muted-foreground border-2 border-background"
      />
      <Card 
        className={cn(
          'min-w-32 min-h-16 p-4 cursor-pointer transition-all duration-200 hover:shadow-md',
          'border-2 text-white',
          nodeTypeColors[data.type]
        )}
        onClick={data.onClick}
        data-testid={`node-${data.type.toLowerCase()}-${data.title.toLowerCase().replace(/\s+/g, '-')}`}
      >
        <div className="text-sm font-semibold text-center">
          {data.title}
        </div>
        <div className="text-xs text-center mt-1 opacity-90">
          {data.type}
        </div>
      </Card>
    </>
  );
}