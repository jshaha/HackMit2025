import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import type { MindMapNode } from '@shared/schema';

interface NodeDetailsModalProps {
  node: MindMapNode | null;
  isOpen: boolean;
  onClose: () => void;
}

const nodeTypeBadgeColors = {
  Concept: 'bg-chart-1 text-foreground hover:bg-chart-1/90',
  Paper: 'bg-chart-2 text-foreground hover:bg-chart-2/90',
  Dataset: 'bg-chart-3 text-foreground hover:bg-chart-3/90',
};

export default function NodeDetailsModal({ node, isOpen, onClose }: NodeDetailsModalProps) {
  if (!node) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md" data-testid="modal-node-details" aria-describedby="node-description">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold flex items-center gap-2">
            {node.title}
            <Badge 
              className={nodeTypeBadgeColors[node.type]}
              data-testid={`badge-type-${node.type.toLowerCase()}`}
            >
              {node.type}
            </Badge>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Description</h4>
            <p className="text-sm leading-relaxed" data-testid="text-description" id="node-description">
              {node.description || 'No description provided.'}
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 pt-2 border-t">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Position</h4>
              <p className="text-xs text-muted-foreground">
                X: {Math.round(node.position.x)}, Y: {Math.round(node.position.y)}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">ID</h4>
              <p className="text-xs text-muted-foreground font-mono">
                {node.id.slice(0, 8)}...
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}