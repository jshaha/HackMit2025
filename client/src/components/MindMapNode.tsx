import { Handle, Position } from 'reactflow';
import { cn } from '@/lib/utils';
import { X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
// Define NodeType locally since @shared/schema import is not available
type NodeType = 'Concept' | 'Paper' | 'Dataset' | 'Tool' | 'Person' | 'Organization' | 'Event' | 'Method';

interface MindMapNodeProps {
  data: {
    title: string;
    type: NodeType;
    description: string;
    onClick: () => void;
    onDelete?: () => void;
    onAiRecommend?: () => void;
    isAiGenerated?: boolean;
  };
  id: string;
}

const nodeTypeColors: Record<string, string> = {
  Concept: 'border-2',
  Paper: 'border-2', 
  Dataset: 'border-2',
  Tool: 'border-2',
  Person: 'border-2',
  Organization: 'border-2',
  Event: 'border-2',
  Method: 'border-2',
};

export default function MindMapNode({ data, id }: MindMapNodeProps) {
  return (
    <>
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-muted-foreground border-2 border-background"
        style={{ top: '-6px' }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-muted-foreground border-2 border-background z-10"
        style={{ bottom: '25px' }}
      />
      <div className="relative group">
        {/* Main Node */}
        <div
          className={cn(
            'rounded-full cursor-pointer transition-all duration-200 hover:shadow-lg flex flex-col items-center justify-center hover:scale-105 shadow-md relative w-20 h-20',
            'border-2 text-foreground',
            nodeTypeColors[data.type]
          )}
          style={{
            backgroundColor: '#F0F0F0',
            borderColor: data.isAiGenerated ? '#8b5cf6' :
                        data.type === 'Concept' ? '#C2F8CB' :
                        data.type === 'Paper' ? '#8367C7' :
                        '#5603AD'
          }}
          onClick={data.onClick}
          data-testid={`node-${data.type.toLowerCase()}-${data.title.toLowerCase().replace(/\s+/g, '-')}`}
        >
          <div className="font-semibold text-center leading-tight text-gray-700 whitespace-nowrap absolute left-1/2 transform -translate-x-1/2 text-xs top-6">
            {data.title}
          </div>
          <div className="text-center opacity-90 text-gray-600 absolute left-1/2 transform -translate-x-1/2 text-[10px] bottom-5">
            {data.type}
          </div>
        </div>

        {/* Hover Delete Button */}
        {data.onDelete && (
          <Button
            variant="destructive"
            size="sm"
            className="absolute -bottom-1 -right-4 w-5 h-5 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20"
            onClick={(e) => {
              e.stopPropagation();
              data.onDelete?.();
            }}
          >
            <X className="w-2.5 h-2.5" />
          </Button>
        )}

        {/* AI Recommendation Button */}
        {data.onAiRecommend && (
          <Button
            variant="secondary"
            size="sm"
            className="absolute -bottom-1 -right-6 w-5 h-5 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0"
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