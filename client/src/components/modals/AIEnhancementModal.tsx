import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, Sparkles } from 'lucide-react';

interface AIEnhancementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEnhance: (prompt: string) => Promise<void>;
  currentContent: string;
  title: string;
  type: 'experience' | 'project';
}

const AIEnhancementModal: React.FC<AIEnhancementModalProps> = ({
  isOpen,
  onClose,
  onEnhance,
  currentContent,
  title,
  type
}) => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleEnhance = async () => {
    if (!prompt.trim()) return;
    
    setIsLoading(true);
    try {
      await onEnhance(prompt.trim());
      setPrompt('');
      onClose();
    } catch (error) {
      console.error('Enhancement failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setPrompt('');
      onClose();
    }
  };

  const getPlaceholderText = () => {
    if (type === 'experience') {
      return "e.g., Make this more professional and highlight quantifiable achievements, or Focus on leadership skills and team management, or Emphasize technical skills and problem-solving abilities";
    } else {
      return "e.g., Make this more technical and highlight the technologies used, or Focus on the impact and results achieved, or Emphasize the challenges overcome and solutions implemented";
    }
  };

  const getTitleText = () => {
    return type === 'experience' ? 'Enhance Experience' : 'Enhance Project';
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-600" />
            {getTitleText()}: {title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium text-gray-600">Current Content:</Label>
            <div className="mt-1 p-3 bg-gray-50 rounded-md text-sm text-gray-700 max-h-32 overflow-y-auto">
              {currentContent || 'No content available'}
            </div>
          </div>

          <div>
            <Label htmlFor="enhancement-prompt">
              Enhancement Prompt <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="enhancement-prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={getPlaceholderText()}
              rows={4}
              className="mt-1"
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500 mt-1">
              Describe how you want to enhance this {type}. Be specific about the style, focus, or improvements you want.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleEnhance}
            disabled={!prompt.trim() || isLoading}
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AIEnhancementModal;
