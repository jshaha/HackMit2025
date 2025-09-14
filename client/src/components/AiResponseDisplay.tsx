import { useState } from 'react';
import { askClaude } from '@/lib/askClaude';
import AiResponseModal from './AiResponseModal';

interface AiResponseDisplayProps {
  onAskAi?: (question: string) => void; // Optional for backward compatibility
  nodes?: any[]; // Mind map nodes for context
}

export default function AiResponseDisplay({ onAskAi, nodes }: AiResponseDisplayProps) {
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setIsLoading(true);
    setError('');
    
    try {
      const aiResponse = await askClaude(question, nodes);
      setResponse(aiResponse);
      setShowModal(true);
      
      // Also call the optional callback if provided
      if (onAskAi) {
        onAskAi(question);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get response from AI';
      setError(errorMessage);
      console.error('AI Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask me anything..."
          className="flex-1 p-2 border rounded"
          disabled={isLoading}
        />
        <button 
          type="submit" 
          disabled={isLoading}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
        >
          {isLoading ? 'Thinking...' : 'Ask'}
        </button>
      </form>

      {error && <div className="text-red-500">{error}</div>}
      
      {/* AI Response Modal */}
      <AiResponseModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        question={question}
        response={response}
        isLoading={isLoading}
      />
    </div>
  );
}
