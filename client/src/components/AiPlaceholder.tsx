import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle, Send, Sparkles } from 'lucide-react';
import { askClaude } from '@/lib/askClaude';
import AiResponseModal from './AiResponseModal';

interface AiPlaceholderProps {
  onAskAi?: (question: string) => void; // Optional for backward compatibility
  nodes?: any[]; // Mind map nodes for context
}

export default function AiPlaceholder({ onAskAi, nodes }: AiPlaceholderProps) {
  const [question, setQuestion] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [response, setResponse] = useState('');
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    
    setIsThinking(true);
    setError('');
    setResponse('');
    
    try {
      console.log('AI question asked:', question);
      setCurrentQuestion(question);
      
      // Call the optional callback if provided
      if (onAskAi) {
        onAskAi(question);
      }
      
      // Get actual AI response with nodes context
      const aiResponse = await askClaude(question, nodes);
      setResponse(aiResponse);
      setShowModal(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get response from AI';
      setError(errorMessage);
      console.error('AI Error:', err);
    } finally {
      setIsThinking(false);
      setQuestion('');
    }
  };

  const suggestedQuestions = [
    'How are these concepts related?',
    'What papers should I read next?',
    'Find similar datasets',
    'Suggest new connections'
  ];

  return (
    <Card className="border-dashed border-2" style={{ borderColor: '#8367C7', backgroundColor: '#E5E5E5' }} data-testid="ai-placeholder">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2" style={{ color: '#5603AD' }}>
          <Sparkles className="w-4 h-4" style={{ color: '#5603AD' }} />
          LabBuddy - Your Research Assistant
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            placeholder="Ask LabBuddy about your knowledge web..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={isThinking}
            className="text-sm"
            data-testid="input-ai-question"
          />
          <Button 
            type="submit" 
            size="icon" 
            className="text-white hover:opacity-90"
            style={{ backgroundColor: '#5603AD' }}
            disabled={!question.trim() || isThinking}
            data-testid="button-ask-ai"
          >
            {isThinking ? (
              <MessageCircle className="w-4 h-4 animate-pulse" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </form>
        
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Quick suggestions:</p>
          <div className="flex flex-wrap gap-1">
            {suggestedQuestions.map((suggestion, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="text-xs h-6 px-2 hover:opacity-90"
                style={{ borderColor: '#8367C7', color: '#5603AD', backgroundColor: 'transparent' }}
                onClick={() => setQuestion(suggestion)}
                disabled={isThinking}
                data-testid={`button-suggestion-${index}`}
              >
                {suggestion}
              </Button>
            ))}
          </div>
        </div>
        
        {isThinking && (
          <div className="text-xs text-muted-foreground animate-pulse">
            AI is thinking...
          </div>
        )}
        
        {error && (
          <div className="text-xs text-red-500 mt-2 p-2 bg-red-50 rounded">
            {error}
          </div>
        )}
      </CardContent>
      
      {/* AI Response Modal */}
      <AiResponseModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        question={currentQuestion}
        response={response}
        isLoading={isThinking}
      />
    </Card>
  );
}