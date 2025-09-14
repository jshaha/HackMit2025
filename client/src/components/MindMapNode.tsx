import { Handle, Position } from 'reactflow';
import { cn } from '@/lib/utils';
import { X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { NodeType } from '@shared/schema';

interface MindMapNodeProps {
  data: {
    title: string;
    type: NodeType;
    description: string;
    onClick: () => void;
    onDelete?: () => void;
    onAiRecommend?: () => void;
  };
  id: string;
}

const nodeTypeColors = {
  Concept: 'border-2',
  Paper: 'border-2', 
  Dataset: 'border-2',
};

export default function MindMapNode({ data, id }: MindMapNodeProps) {
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
        className="w-3 h-3 bg-muted-foreground border-2 border-background z-10"
      />
      <div className="relative group">
        {/* Main Node */}
        <div 
          className={cn(
            'w-20 h-20 rounded-full cursor-pointer transition-all duration-200 hover:shadow-lg flex flex-col items-center justify-center hover:scale-105 shadow-md relative',
            'border-2 text-foreground',
            nodeTypeColors[data.type]
          )}
          style={{
            backgroundColor: '#F0F0F0',
            borderColor: data.type === 'Concept' ? '#C2F8CB' :
                        data.type === 'Paper' ? '#8367C7' :
                        '#5603AD'
          }}
          onClick={data.onClick}
          data-testid={`node-${data.type.toLowerCase()}-${data.title.toLowerCase().replace(/\s+/g, '-')}`}
        >
          <div className="text-xs font-semibold text-center leading-tight text-gray-700 whitespace-nowrap absolute left-1/2 transform -translate-x-1/2 top-6">
            {data.title}
          </div>
          <div className="text-[10px] text-center opacity-90 text-gray-600 absolute bottom-5 left-1/2 transform -translate-x-1/2">
            {data.type}
          </div>
        </div>

        {/* Hover Delete Button - Top Right */}
        {data.onDelete && (
          <Button
            variant="destructive"
            size="sm"
            className="absolute -top-1 -right-1 w-4 h-4 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20"
            onClick={(e) => {
              e.stopPropagation();
              data.onDelete?.();
            }}
          >
            <X className="w-2.5 h-2.5" />
          </Button>
        )}

        {/* AI Recommendation Button - Extending from right */}
        {data.onAiRecommend && (
          <Button
            variant="secondary"
            size="sm"
            className="absolute top-1/2 -translate-y-1/2 -right-6 w-5 h-5 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0"
            onClick={(e) => {
              e.stopPropagation();
              data.onAiRecommend?.();
            }}
          >
            <Sparkles className="w-2.5 h-2.5" />
          </Button>
        )}
      </div>
    </>
  );
}