import { Handle, Position } from '@xyflow/react';
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
      <div 
        className={cn(
          'w-20 h-20 rounded-full cursor-pointer transition-all duration-200 hover:shadow-lg flex flex-col items-center justify-center hover:scale-105 shadow-md',
          'border-2 text-foreground',
          nodeTypeColors[data.type]
        )}
        onClick={data.onClick}
        data-testid={`node-${data.type.toLowerCase()}-${data.title.toLowerCase().replace(/\s+/g, '-')}`}
      >
        <div className="text-xs font-semibold text-center px-2 leading-tight">
          {data.title.length > 12 ? data.title.substring(0, 12) + '...' : data.title}
        </div>
        <div className="text-[10px] text-center mt-1 opacity-90">
          {data.type}
        </div>
      </div>
    </>
  );
}