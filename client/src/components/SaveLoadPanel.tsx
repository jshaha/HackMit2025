import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Save, FolderOpen, Trash2, Calendar } from 'lucide-react';
import { mindMapApi, ApiError } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import type { SavedMap, MindMapNode, MindMapEdge } from '@shared/schema';

interface SaveLoadPanelProps {
  nodes: MindMapNode[];
  edges: MindMapEdge[];
  title: string;
  onLoadMap: (nodes: MindMapNode[], edges: MindMapEdge[], title: string) => void;
  currentMapId?: string;
}

export default function SaveLoadPanel({ 
  nodes, 
  edges, 
  title, 
  onLoadMap, 
  currentMapId 
}: SaveLoadPanelProps) {
  const [isLoadDialogOpen, setIsLoadDialogOpen] = useState(false);
  const [savedMaps, setSavedMaps] = useState<SavedMap[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  // For demo purposes, using a fixed user ID
  // In a real app, this would come from authentication
  const userId = 'demo-user';

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      const mapData = {
        userId,
        title,
        data: {
          nodes,
          edges,
        },
      };

      if (currentMapId) {
        // Update existing map
        await mindMapApi.updateSavedMap(currentMapId, mapData);
        toast({
          title: "Map Updated",
          description: `"${title}" has been updated successfully.`,
        });
      } else {
        // Create new map
        await mindMapApi.createSavedMap(mapData);
        toast({
          title: "Map Saved",
          description: `"${title}" has been saved successfully.`,
        });
      }
    } catch (error) {
      console.error('Error saving map:', error);
      toast({
        title: "Save Failed",
        description: error instanceof ApiError ? error.message : "Failed to save the map. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  }, [nodes, edges, title, currentMapId, userId, toast]);

  const loadSavedMaps = useCallback(async () => {
    setIsLoading(true);
    try {
      const maps = await mindMapApi.getSavedMaps(userId);
      setSavedMaps(maps);
    } catch (error) {
      console.error('Error loading maps:', error);
      toast({
        title: "Load Failed",
        description: error instanceof ApiError ? error.message : "Failed to load saved maps. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [userId, toast]);

  const handleLoadMap = useCallback(async (map: SavedMap) => {
    try {
      onLoadMap(map.data.nodes, map.data.edges, map.title);
      setIsLoadDialogOpen(false);
      toast({
        title: "Map Loaded",
        description: `"${map.title}" has been loaded successfully.`,
      });
    } catch (error) {
      console.error('Error loading map:', error);
      toast({
        title: "Load Failed",
        description: "Failed to load the selected map. Please try again.",
        variant: "destructive",
      });
    }
  }, [onLoadMap, toast]);

  const handleDeleteMap = useCallback(async (map: SavedMap, event: React.MouseEvent) => {
    event.stopPropagation();
    try {
      await mindMapApi.deleteSavedMap(userId, map.id);
      setSavedMaps(prev => prev.filter(m => m.id !== map.id));
      toast({
        title: "Map Deleted",
        description: `"${map.title}" has been deleted successfully.`,
      });
    } catch (error) {
      console.error('Error deleting map:', error);
      toast({
        title: "Delete Failed",
        description: error instanceof ApiError ? error.message : "Failed to delete the map. Please try again.",
        variant: "destructive",
      });
    }
  }, [userId, toast]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="flex gap-2">
      {/* Save Button */}
      <Button
        onClick={handleSave}
        disabled={isSaving || nodes.length === 0}
        className="flex items-center gap-2 text-white hover:opacity-90"
        style={{ backgroundColor: '#8367C7' }}
        size="sm"
      >
        <Save className="w-4 h-4" />
        {isSaving ? 'Saving...' : currentMapId ? 'Update' : 'Save'}
      </Button>

      {/* Load Button */}
      <Dialog open={isLoadDialogOpen} onOpenChange={setIsLoadDialogOpen}>
        <DialogTrigger asChild>
          <Button
            onClick={loadSavedMaps}
            className="flex items-center gap-2 text-white hover:opacity-90"
            style={{ backgroundColor: '#5603AD' }}
            size="sm"
          >
            <FolderOpen className="w-4 h-4" />
            Load
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Load Saved Map</DialogTitle>
          </DialogHeader>
          
          <ScrollArea className="max-h-[60vh]">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-sm text-muted-foreground">Loading saved maps...</div>
              </div>
            ) : savedMaps.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-sm text-muted-foreground">No saved maps found.</div>
              </div>
            ) : (
              <div className="space-y-3">
                {savedMaps.map((map) => (
                  <Card
                    key={map.id}
                    className="cursor-pointer hover:bg-accent/50 transition-colors"
                    onClick={() => handleLoadMap(map)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm truncate">{map.title}</h3>
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(map.updatedAt.toString())}
                            </div>
                            <div>
                              {map.data.nodes.length} nodes, {map.data.edges.length} edges
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={(e) => handleDeleteMap(map, e)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
