import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import { insertMindMapNodeSchema, nodeTypes, type InsertMindMapNode } from '@shared/schema';

interface AddNodeSidebarProps {
  onAddNode: (node: InsertMindMapNode) => void;
}

export default function AddNodeSidebar({ onAddNode }: AddNodeSidebarProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<InsertMindMapNode>({
    resolver: zodResolver(insertMindMapNodeSchema),
    defaultValues: {
      title: '',
      type: 'Concept',
      description: '',
      position: { x: Math.random() * 400 + 100, y: Math.random() * 300 + 100 }
    }
  });

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
    <div className="w-80 bg-card border-r border-border h-full overflow-y-auto" data-testid="sidebar-add-node">
      <Card className="m-4 border-0 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Plus className="w-5 h-5 text-primary" />
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
                    <FormLabel className="text-sm font-medium">Description</FormLabel>
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
                className="w-full"
                disabled={isSubmitting}
                data-testid="button-add-node"
              >
                {isSubmitting ? 'Adding...' : 'Add Node'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}