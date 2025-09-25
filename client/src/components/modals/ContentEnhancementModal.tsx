import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, ArrowRight, Copy, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { aiEnhancementService } from '@/services/aiEnhancementService';

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
  const [isGenerating, setIsGenerating] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [enhancedContent, setEnhancedContent] = useState('');
  const [originalContent, setOriginalContent] = useState('');
  const [promptUsed, setPromptUsed] = useState('');
  const [promptError, setPromptError] = useState('');
  const { toast } = useToast();

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setEnhancementPrompt('');
      setEnhancedContent('');
      setShowResults(false);
      setPromptError('');
      setIsGenerating(false);
    }
  }, [isOpen]);

  // Validate prompt in real-time
  useEffect(() => {
    if (enhancementPrompt) {
      // Simple validation - can be enhanced based on requirements
      if (enhancementPrompt.length < 1) {
        setPromptError('Prompt should be at least 1 character long');
      } else if (enhancementPrompt.length > 500) {
        setPromptError('Prompt should not exceed 500 characters');
      } else {
        setPromptError('');
      }
    } else {
      setPromptError('');
    }
  }, [enhancementPrompt]);

  const handleEnhance = async () => {
    // Validate prompt
    if (enhancementPrompt.length < 1) {
      setPromptError('Prompt should be at least 1 character long');
      return;
    }
    if (enhancementPrompt.length > 500) {
      setPromptError('Prompt should not exceed 500 characters');
      return;
    }

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

    setIsGenerating(true);
    setIsLoading(true);
    try {
      const result = await aiEnhancementService.enhanceContentWithAI(
        contentData?.description || '',
        enhancementPrompt.trim(),
        contentType
      );

      if (result.success && result.data) {
        // Store results and show results modal
        setOriginalContent(result.data.original_content);
        setEnhancedContent(result.data.enhanced_content);
        setPromptUsed(result.data.prompt_used);
        setShowResults(true);
        toast({
          title: 'Content Enhanced Successfully',
          description: 'Review the enhanced content and apply if satisfied.',
        });
      } else {
        throw new Error(result.message || result.error || 'Failed to enhance content');
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
      setIsGenerating(false);
    }
  };

  const handleApplyEnhanced = () => {
    if (enhancedContent) {
      onEnhance(enhancedContent);
      toast({
        title: 'Applied',
        description: 'Enhanced content has been applied successfully!',
      });
      handleClose();
    }
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
    navigator.clipboard.writeText(text).then(() => {
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
    'Make this description into 6 points'
  ];

  const handleSuggestionClick = (suggestion: string) => {
    setEnhancementPrompt(suggestion);
  };

  const formatContentForDisplay = (content: string) => {
    return content || 'No content available';
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            Enhance {contentType === 'experience' ? 'Experience' : 'Project'} with AI
            {getContentTitle() && <span className="text-sm text-gray-500">- {getContentTitle()}</span>}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-auto space-y-6">
          {!showResults ? (
            <>
              {/* Current Content Preview */}
              <div>
                <Label className="text-sm font-medium text-gray-700">Current Content</Label>
                <div className="mt-2 p-3 bg-gray-50 rounded-lg border max-h-32 overflow-auto">
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">
                    {getCurrentDescription()}
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
                  value={enhancementPrompt}
                  onChange={(e) => setEnhancementPrompt(e.target.value)}
                  placeholder={`Describe how you want to improve this ${contentType}...`}
                  className={`mt-2 min-h-[100px] ${promptError ? 'border-red-500' : ''}`}
                  disabled={isLoading}
                />
                {promptError && (
                  <p className="mt-1 text-sm text-red-600">{promptError}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  {enhancementPrompt.length}/500 characters
                </p>
              </div>

              {/* Quick Suggestions */}
              <div>
                <Label className="text-sm font-medium text-gray-700">Quick Suggestions</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {quickSuggestions.map((suggestion, index) => (
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
                      onClick={() => copyToClipboard(originalContent)}
                      className="h-6 px-2"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg border h-64 overflow-auto">
                    <p className="text-sm text-gray-600 whitespace-pre-wrap">
                      {formatContentForDisplay(originalContent)}
                    </p>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-sm font-medium text-green-700">Enhanced</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(enhancedContent)}
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
                  <p className="text-sm text-blue-700">{promptUsed}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-2">
            {showResults && (
              <Button
                variant="outline"
                onClick={handleTryDifferentPrompt}
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
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            
            {!showResults ? (
              <Button
                onClick={handleEnhance}
                disabled={isLoading || !enhancementPrompt.trim() || !!promptError || !contentData}
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
                onClick={handleApplyEnhanced}
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
