import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Sparkles, Copy, Check } from 'lucide-react';

interface AiResponseModalProps {
  isOpen: boolean;
  onClose: () => void;
  question: string;
  response: string;
  isLoading?: boolean;
}

export default function AiResponseModal({ isOpen, onClose, question, response, isLoading }: AiResponseModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(response);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <Card className="w-full max-w-3xl max-h-[85vh] overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <CardHeader className="pb-4 border-b bg-gradient-to-r from-purple-50 to-blue-50">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent font-semibold">
                LabBuddy
              </span>
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="h-8 px-3 text-xs"
                disabled={!response}
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 mr-1" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3 mr-1" />
                    Copy
                  </>
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8 hover:bg-gray-200"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0 overflow-y-auto max-h-[calc(85vh-80px)]">
          <div className="p-6 space-y-5">
            {/* Question */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1 h-4 bg-purple-600 rounded-full" />
                <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Your Question</h3>
              </div>
              <p className="text-sm bg-purple-50 p-4 rounded-lg border border-purple-100 text-gray-800">
                {question}
              </p>
            </div>

            {/* Response */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1 h-4 bg-blue-600 rounded-full" />
                <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Response</h3>
              </div>
              {isLoading ? (
                <div className="flex items-center gap-3 text-gray-600 p-4">
                  <div className="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm">Thinking...</span>
                </div>
              ) : (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-800">
                    {response}
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}