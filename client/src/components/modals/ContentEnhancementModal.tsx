import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, Sparkles, Copy, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { API_URL } from '@/lib/apiConfig';

interface ContentEnhancementModalProps {
  isOpen: boolean;
  onClose: () => void;
  contentType: 'experience' | 'project';
  contentData: any;
  onEnhance: (enhancedDescription: string) => void;
}

export const ContentEnhancementModal: React.FC<ContentEnhancementModalProps> = ({
  isOpen,
  onClose,
  contentType,
  contentData,
  onEnhance,
}) => {
  const [enhancementPrompt, setEnhancementPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [enhancedContent, setEnhancedContent] = useState('');
  const [originalContent, setOriginalContent] = useState('');
  const [promptUsed, setPromptUsed] = useState('');
  const { toast } = useToast();

  const handleEnhance = async () => {
    if (!contentData) {
      toast({
        title: 'No Content Available',
        description: 'Please select content to enhance.',
        variant: 'destructive',
      });
      return;
    }

    if (!enhancementPrompt.trim()) {
      toast({
        title: 'Enhancement Prompt Required',
        description: 'Please enter a prompt to enhance the content.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/ai/enhance-content`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content_type: contentType,
          content_data: {
            id: contentData?.id || 'temp',
            description: contentData?.description || ''
          },
          enhancement_prompt: enhancementPrompt.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        // Store results and show results modal
        setOriginalContent(contentData?.description || '');
        setEnhancedContent(String(result.data.enhanced_content));
        setPromptUsed(enhancementPrompt.trim());
        setShowResults(true);
        toast({
          title: 'Content Enhanced Successfully',
          description: 'Review the enhanced content and apply if satisfied.',
        });
      } else {
        throw new Error(result.message || 'Failed to enhance content');
      }
    } catch (error) {
      console.error('Enhancement error:', error);
      toast({
        title: 'Enhancement Failed',
        description: error instanceof Error ? error.message : 'An error occurred while enhancing the content.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyEnhanced = () => {
    onEnhance(enhancedContent);
    handleClose();
  };

  const handleTryDifferentPrompt = () => {
    setShowResults(false);
    setEnhancedContent('');
    setOriginalContent('');
    setPromptUsed('');
  };

  const handleClose = () => {
    setShowResults(false);
    setEnhancedContent('');
    setOriginalContent('');
    setPromptUsed('');
    setEnhancementPrompt('');
    onClose();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied to clipboard',
      description: 'Content has been copied to your clipboard.',
    });
  };

  const getContentTitle = () => {
    if (!contentData) return 'Content';
    
    if (contentType === 'experience') {
      return `${contentData.position || 'Position'} at ${contentData.company || 'Company'}`;
    } else {
      return contentData.name || 'Project';
    }
  };

  const getCurrentDescription = () => {
    if (!contentData) return 'No content available';
    return contentData.description || 'No description available';
  };

  const quickSuggestions = [
    'Add more metrics and quantifiable achievements',
    'Make it more action-oriented with strong verbs',
    'Emphasize leadership and team collaboration',
    'Focus on business impact and results',
    'Include relevant technologies and tools',
    'Highlight problem-solving abilities',
    'Make it more concise and impactful',
    'Make this description into 5 points'
  ];

  const handleSuggestionClick = (suggestion: string) => {
    setEnhancementPrompt(suggestion);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-hidden">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
            <Sparkles className="h-5 w-5 text-blue-600" />
            Enhance {contentType === 'experience' ? 'Experience' : 'Project'} with AI - {getContentTitle()}
          </DialogTitle>
        </DialogHeader>

        {!showResults ? (
          // Input Modal
          <div className="space-y-6 overflow-y-auto">
            {/* Current Content Section */}
            <div className="space-y-3">
              <Label className="text-base font-semibold text-gray-900">
                Current Content
              </Label>
              <div className="bg-gray-50 border rounded-lg p-4 max-h-40 overflow-y-auto">
                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {getCurrentDescription()}
                </p>
              </div>
            </div>

            {/* Enhancement Prompt Section */}
            <div className="space-y-3">
              <Label className="text-base font-semibold text-gray-900">
                How would you like to enhance this content?
              </Label>
              <Textarea
                placeholder="Describe how you want to improve this experience..."
                value={enhancementPrompt}
                onChange={(e) => setEnhancementPrompt(e.target.value)}
                rows={4}
                className="resize-none"
                maxLength={500}
              />
              <div className="flex justify-between items-center text-xs text-gray-500">
                <span>{enhancementPrompt.length}/500 characters</span>
              </div>
            </div>

            {/* Quick Suggestions Section */}
            <div className="space-y-3">
              <Label className="text-base font-semibold text-gray-900">
                Quick Suggestions
              </Label>
              <div className="flex flex-wrap gap-2">
                {quickSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-full transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          // Results Modal
          <div className="space-y-6 overflow-y-auto">
            {/* Comparison Section */}
            <div className="grid grid-cols-2 gap-6">
              {/* Original Content */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold text-gray-900">Original</Label>
                  <button
                    onClick={() => copyToClipboard(originalContent)}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                  >
                    <Copy className="h-4 w-4 text-gray-500" />
                  </button>
                </div>
                <div className="bg-gray-50 border rounded-lg p-4 max-h-60 overflow-y-auto">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {originalContent}
                  </p>
                </div>
              </div>

              {/* Enhanced Content */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold text-green-600">Enhanced</Label>
                  <button
                    onClick={() => copyToClipboard(enhancedContent)}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                  >
                    <Copy className="h-4 w-4 text-gray-500" />
                  </button>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-h-60 overflow-y-auto">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {enhancedContent}
                  </p>
                </div>
              </div>
            </div>

            {/* Enhancement Prompt Used */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Enhancement Prompt Used</Label>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">{promptUsed}</p>
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="pt-4 border-t">
          {!showResults ? (
            <>
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleEnhance}
                disabled={isLoading || !enhancementPrompt.trim() || !contentData}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enhancing...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Enhance with AI
                  </>
                )}
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={handleTryDifferentPrompt}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Try Different Prompt
              </Button>
              <Button
                variant="outline"
                onClick={handleClose}
              >
                Cancel
              </Button>
              <Button
                onClick={handleApplyEnhanced}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                → Apply Enhanced Content
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
