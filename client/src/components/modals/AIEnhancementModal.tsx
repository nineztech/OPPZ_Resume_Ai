import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, ArrowRight, Copy, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  enhanceContentWithAI, 
  getEnhancementSuggestions, 
  validateEnhancementPrompt,
  formatContentForDisplay 
} from '@/services/aiEnhancementService';

interface AIEnhancementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (enhancedContent: string) => void;
  currentContent: string;
  type: 'experience' | 'project';
  title?: string;
}

const AIEnhancementModal: React.FC<AIEnhancementModalProps> = ({
  isOpen,
  onClose,
  onApply,
  currentContent,
  type,
  title
}) => {
  const [prompt, setPrompt] = useState('');
  const [enhancedContent, setEnhancedContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [promptError, setPromptError] = useState('');
  const { toast } = useToast();

  const suggestions = getEnhancementSuggestions(type);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setPrompt('');
      setEnhancedContent('');
      setShowPreview(false);
      setPromptError('');
      setIsGenerating(false);
    }
  }, [isOpen]);

  // Validate prompt in real-time
  useEffect(() => {
    if (prompt) {
      const validation = validateEnhancementPrompt(prompt);
      setPromptError(validation.isValid ? '' : validation.error || '');
    } else {
      setPromptError('');
    }
  }, [prompt]);

  const handleGenerate = async () => {
    // Validate prompt
    const validation = validateEnhancementPrompt(prompt);
    if (!validation.isValid) {
      setPromptError(validation.error || 'Invalid prompt');
      return;
    }

    if (!currentContent || !currentContent.trim()) {
      toast({
        title: 'Error',
        description: 'No content to enhance. Please add some content first.',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    setIsLoading(true);

    try {
      const result = await enhanceContentWithAI(currentContent, prompt, type);

      if (result.success && result.data) {
        setEnhancedContent(result.data.enhanced_content);
        setShowPreview(true);
        toast({
          title: 'Success',
          description: 'Content enhanced successfully!',
        });
      } else {
        throw new Error(result.error || result.message || 'Failed to enhance content');
      }
    } catch (error) {
      console.error('Enhancement error:', error);
      toast({
        title: 'Enhancement Failed',
        description: error instanceof Error ? error.message : 'Failed to enhance content. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      setIsGenerating(false);
    }
  };

  const handleApply = () => {
    if (enhancedContent) {
      onApply(enhancedContent);
      toast({
        title: 'Applied',
        description: 'Enhanced content has been applied successfully!',
      });
      onClose();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setPrompt(suggestion);
  };

  const handleCopyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content).then(() => {
      toast({
        title: 'Copied',
        description: 'Content copied to clipboard!',
      });
    }).catch(() => {
      toast({
        title: 'Error',
        description: 'Failed to copy content to clipboard.',
        variant: 'destructive',
      });
    });
  };

  const handleTryAgain = () => {
    setShowPreview(false);
    setEnhancedContent('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            Enhance {type === 'experience' ? 'Experience' : 'Project'} with AI
            {title && <span className="text-sm text-gray-500">- {title}</span>}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-auto space-y-6">
          {!showPreview ? (
            <>
              {/* Current Content Preview */}
              <div>
                <Label className="text-sm font-medium text-gray-700">Current Content</Label>
                <div className="mt-2 p-3 bg-gray-50 rounded-lg border max-h-32 overflow-auto">
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">
                    {currentContent || 'No content available'}
                  </p>
                </div>
              </div>

              {/* Enhancement Prompt */}
              <div>
                <Label htmlFor="prompt" className="text-sm font-medium text-gray-700">
                  How would you like to enhance this content?
                </Label>
                <Textarea
                  id="prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={`Describe how you want to improve this ${type}...`}
                  className={`mt-2 min-h-[100px] ${promptError ? 'border-red-500' : ''}`}
                  disabled={isLoading}
                />
                {promptError && (
                  <p className="mt-1 text-sm text-red-600">{promptError}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  {prompt.length}/500 characters
                </p>
              </div>

              {/* Quick Suggestions */}
              <div>
                <Label className="text-sm font-medium text-gray-700">Quick Suggestions</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {suggestions.map((suggestion, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="cursor-pointer hover:bg-blue-100 hover:text-blue-700 transition-colors"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      {suggestion}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          ) : (
            /* Preview Mode */
            <div className="space-y-4">
              {/* Comparison View */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-sm font-medium text-gray-700">Original</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopyToClipboard(currentContent)}
                      className="h-6 px-2"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg border h-64 overflow-auto">
                    <p className="text-sm text-gray-600 whitespace-pre-wrap">
                      {formatContentForDisplay(currentContent)}
                    </p>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-sm font-medium text-green-700">Enhanced</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopyToClipboard(enhancedContent)}
                      className="h-6 px-2"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg border h-64 overflow-auto">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {formatContentForDisplay(enhancedContent)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Enhancement Prompt Used */}
              <div>
                <Label className="text-sm font-medium text-gray-700">Enhancement Prompt Used</Label>
                <div className="mt-2 p-2 bg-blue-50 rounded border-l-4 border-blue-500">
                  <p className="text-sm text-blue-700">{prompt}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-2">
            {showPreview && (
              <Button
                variant="outline"
                onClick={handleTryAgain}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Try Different Prompt
              </Button>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            
            {!showPreview ? (
              <Button
                onClick={handleGenerate}
                disabled={isLoading || !prompt.trim() || !!promptError || !currentContent.trim()}
                className="flex items-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Enhancing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Enhance with AI
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={handleApply}
                disabled={isLoading}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
              >
                <ArrowRight className="w-4 h-4" />
                Apply Enhanced Content
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AIEnhancementModal;
