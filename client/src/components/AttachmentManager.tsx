import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Link, 
  Upload, 
  Image, 
  FileText, 
  Code, 
  Database, 
  Trash2, 
  ExternalLink,
  Download,
  Eye
} from 'lucide-react';
import type { Attachment, AttachmentType, FileType } from '@shared/schema';

interface AttachmentManagerProps {
  nodeId: string;
  attachments: Attachment[];
  onAttachmentAdded: (attachment: Attachment) => void;
  onAttachmentDeleted: (attachmentId: string) => void;
}

const fileTypeIcons: Record<FileType, React.ComponentType<any>> = {
  document: FileText,
  code: Code,
  data: Database,
  image: Image,
  other: FileText,
};

const fileTypeColors: Record<FileType, string> = {
  document: 'bg-blue-100 text-blue-800',
  code: 'bg-green-100 text-green-800',
  data: 'bg-purple-100 text-purple-800',
  image: 'bg-pink-100 text-pink-800',
  other: 'bg-gray-100 text-gray-800',
};

export default function AttachmentManager({ 
  nodeId, 
  attachments, 
  onAttachmentAdded, 
  onAttachmentDeleted 
}: AttachmentManagerProps) {
  const [isAddingAttachment, setIsAddingAttachment] = useState(false);
  const [linkForm, setLinkForm] = useState({ name: '', url: '' });
  const [imageForm, setImageForm] = useState({ name: '', url: '' });
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddLink = async () => {
    if (!linkForm.name || !linkForm.url) return;

    try {
      const response = await fetch('/api/attachments/link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nodeId,
          name: linkForm.name,
          url: linkForm.url,
        }),
      });

      if (response.ok) {
        const attachment = await response.json();
        onAttachmentAdded(attachment);
        setLinkForm({ name: '', url: '' });
        setIsAddingAttachment(false);
      }
    } catch (error) {
      console.error('Failed to add link:', error);
    }
  };

  const handleAddImage = async () => {
    if (!imageForm.url) return;

    try {
      const response = await fetch('/api/attachments/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nodeId,
          name: imageForm.name || 'Image',
          url: imageForm.url,
        }),
      });

      if (response.ok) {
        const attachment = await response.json();
        onAttachmentAdded(attachment);
        setImageForm({ name: '', url: '' });
        setIsAddingAttachment(false);
      }
    } catch (error) {
      console.error('Failed to add image:', error);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('nodeId', nodeId);
      formData.append('name', file.name);

      const response = await fetch('/api/attachments/file', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const attachment = await response.json();
        onAttachmentAdded(attachment);
        setIsAddingAttachment(false);
      }
    } catch (error) {
      console.error('Failed to upload file:', error);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeleteAttachment = async (attachmentId: string) => {
    try {
      const response = await fetch(`/api/attachments/${attachmentId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        onAttachmentDeleted(attachmentId);
      }
    } catch (error) {
      console.error('Failed to delete attachment:', error);
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${Math.round(bytes / Math.pow(1024, i) * 100) / 100} ${sizes[i]}`;
  };

  const renderAttachment = (attachment: Attachment) => {
    const IconComponent = attachment.type === 'link' 
      ? Link 
      : attachment.type === 'image' 
        ? Image 
        : fileTypeIcons[attachment.fileType || 'other'];

    return (
      <Card key={attachment.id} className="relative group">
        <CardContent className="p-3">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-2 flex-1 min-w-0">
              <IconComponent className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-sm truncate">{attachment.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  {attachment.fileType && (
                    <Badge className={`text-xs ${fileTypeColors[attachment.fileType]}`}>
                      {attachment.fileType}
                    </Badge>
                  )}
                  {attachment.fileSize && (
                    <span className="text-xs text-muted-foreground">
                      {formatFileSize(attachment.fileSize)}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {attachment.type === 'image' && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-3 w-3" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl">
                    <DialogHeader>
                      <DialogTitle>{attachment.name}</DialogTitle>
                    </DialogHeader>
                    <img 
                      src={attachment.url} 
                      alt={attachment.name}
                      className="max-w-full h-auto rounded-lg"
                    />
                  </DialogContent>
                </Dialog>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open(attachment.url, '_blank')}
              >
                <ExternalLink className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteAttachment(attachment.id)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">Attachments ({attachments.length})</h4>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsAddingAttachment(true)}
        >
          <Upload className="h-3 w-3 mr-1" />
          Add
        </Button>
      </div>

      {attachments.length > 0 && (
        <div className="space-y-2">
          {attachments.map(renderAttachment)}
        </div>
      )}

      <Dialog open={isAddingAttachment} onOpenChange={setIsAddingAttachment}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Attachment</DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue="link" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="link">Link</TabsTrigger>
              <TabsTrigger value="image">Image</TabsTrigger>
              <TabsTrigger value="file">File</TabsTrigger>
            </TabsList>
            
            <TabsContent value="link" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="link-name">Name</Label>
                <Input
                  id="link-name"
                  value={linkForm.name}
                  onChange={(e) => setLinkForm({ ...linkForm, name: e.target.value })}
                  placeholder="Link name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="link-url">URL</Label>
                <Input
                  id="link-url"
                  value={linkForm.url}
                  onChange={(e) => setLinkForm({ ...linkForm, url: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <Button onClick={handleAddLink} className="w-full">
                Add Link
              </Button>
            </TabsContent>
            
            <TabsContent value="image" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="image-name">Name (optional)</Label>
                <Input
                  id="image-name"
                  value={imageForm.name}
                  onChange={(e) => setImageForm({ ...imageForm, name: e.target.value })}
                  placeholder="Image name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="image-url">Image URL</Label>
                <Input
                  id="image-url"
                  value={imageForm.url}
                  onChange={(e) => setImageForm({ ...imageForm, url: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <Button onClick={handleAddImage} className="w-full">
                Add Image
              </Button>
            </TabsContent>
            
            <TabsContent value="file" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="file-upload">Choose File</Label>
                <Input
                  id="file-upload"
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  disabled={isUploading}
                />
              </div>
              {isUploading && (
                <p className="text-sm text-muted-foreground">Uploading...</p>
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}
