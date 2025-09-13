import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle, Send, Sparkles } from 'lucide-react';

interface AiPlaceholderProps {
  onAskAi: (question: string) => void;
}

export default function AiPlaceholder({ onAskAi }: AiPlaceholderProps) {
  const [question, setQuestion] = useState('');
  const [isThinking, setIsThinking] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    
    setIsThinking(true);
    console.log('AI question asked:', question);
    onAskAi(question);
    
    // Simulate AI thinking time
    setTimeout(() => {
      setIsThinking(false);
      setQuestion('');
    }, 2000);
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
          Ask AI about your mind map
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            placeholder="Ask anything about your nodes..."
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
      </CardContent>
    </Card>
  );
}