import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Plus, Sparkles } from 'lucide-react';
import { insertMindMapNodeSchema, nodeTypes, type InsertMindMapNode } from '@shared/schema';
import SearchBar from './SearchBar';
import AiPlaceholder from './AiPlaceholder';

interface AddNodeSidebarProps {
  onAddNode: (node: InsertMindMapNode) => void;
  onSearch: (query: string) => void;
  onAskAi: (question: string) => void;
  nodes?: any[]; // Mind map nodes for AI context
}

export default function AddNodeSidebar({ onAddNode, onSearch, onAskAi, nodes }: AddNodeSidebarProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);

  const form = useForm<InsertMindMapNode>({
    resolver: zodResolver(insertMindMapNodeSchema),
    defaultValues: {
      title: '',
      type: 'Concept',
      description: '',
      position: { x: Math.random() * 400 + 100, y: Math.random() * 300 + 100 }
    }
  });

  const generateDescription = async () => {
    const title = form.getValues('title');
    const type = form.getValues('type');

    if (!title) {
      return;
    }

    setIsGeneratingDescription(true);
    try {
      const response = await fetch('/api/generate-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, type }),
      });

      if (!response.ok) throw new Error('Failed to generate description');

      const data = await response.json();
      form.setValue('description', data.description);
    } catch (error) {
      console.error('Error generating description:', error);
    } finally {
      setIsGeneratingDescription(false);
    }
  };

  const onSubmit = async (data: InsertMindMapNode) => {
    setIsSubmitting(true);
    console.log('Adding node:', data);

    // Add some randomness to position to avoid overlap
    const nodeData = {
      ...data,
      position: {
        x: Math.random() * 400 + 100,
        y: Math.random() * 300 + 100
      }
    };

    onAddNode(nodeData);
    form.reset();
    setIsSubmitting(false);
  };

  return (
    <div className="border-r border-border h-full overflow-y-auto flex flex-col" data-testid="sidebar-add-node">
      {/* Search Bar */}
      <div className="p-4 border-b border-border">
        <SearchBar onSearch={onSearch} placeholder="Search nodes..." />
      </div>
      
      {/* Add Node Form */}
      <Card className="m-4 border-0 shadow-sm" style={{ backgroundColor: '#E5E5E5' }}>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Plus className="w-5 h-5" style={{ color: '#5603AD' }} />
            Add New Node
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Title</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter node title..."
                        data-testid="input-title"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-type">
                          <SelectValue placeholder="Select node type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {nodeTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel className="text-sm font-medium">Description</FormLabel>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-6 text-xs text-purple-600 hover:text-purple-700"
                        onClick={generateDescription}
                        disabled={isGeneratingDescription || !form.watch('title')}
                      >
                        <Sparkles className="w-3 h-3 mr-1" />
                        {isGeneratingDescription ? 'Generating...' : 'AI Generate'}
                      </Button>
                    </div>
                    <FormControl>
                      <Textarea
                        placeholder="Describe this node..."
                        className="resize-none min-h-20"
                        data-testid="textarea-description"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full text-white hover:opacity-90 focus-visible:ring-0 focus-visible:ring-offset-0 border-0"
                style={{ backgroundColor: '#8367C7' }}
                disabled={isSubmitting}
                data-testid="button-add-node"
              >
                {isSubmitting ? 'Adding...' : 'Add Node'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      {/* AI Placeholder */}
      <div className="p-4 mt-auto">
        <AiPlaceholder onAskAi={onAskAi} nodes={nodes} />
      </div>
    </div>
  );
}