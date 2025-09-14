import { useState, useEffect } from 'react';
import type { Attachment } from '@shared/schema';

export function useAttachments(nodeId: string) {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAttachments = async () => {
    if (!nodeId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/attachments/node/${nodeId}`);
      if (response.ok) {
        const data = await response.json();
        setAttachments(data);
      } else {
        setError('Failed to fetch attachments');
      }
    } catch (err) {
      setError('Failed to fetch attachments');
      console.error('Error fetching attachments:', err);
    } finally {
      setLoading(false);
    }
  };

  const addAttachment = (attachment: Attachment) => {
    setAttachments(prev => [...prev, attachment]);
  };

  const removeAttachment = (attachmentId: string) => {
    setAttachments(prev => prev.filter(a => a.id !== attachmentId));
  };

  const updateAttachment = (updatedAttachment: Attachment) => {
    setAttachments(prev => 
      prev.map(a => a.id === updatedAttachment.id ? updatedAttachment : a)
    );
  };

  useEffect(() => {
    fetchAttachments();
  }, [nodeId]);

  return {
    attachments,
    loading,
    error,
    addAttachment,
    removeAttachment,
    updateAttachment,
    refetch: fetchAttachments,
  };
}
