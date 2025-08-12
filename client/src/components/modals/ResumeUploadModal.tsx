import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Sparkles, ArrowRight, X } from 'lucide-react';
import AICustomizationModal from './AICustomizationModal';

interface ResumeUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinueWithRaw: () => void;
  onCustomizeWithAI: () => void;
  fileName: string;
}

const ResumeUploadModal: React.FC<ResumeUploadModalProps> = ({
  isOpen,
  onClose,
  onContinueWithRaw,
  onCustomizeWithAI,
  fileName
}) => {
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);

  if (!isOpen) return null;

  const handleCustomizeWithAI = () => {
    setIsAIModalOpen(true);
  };

  const handleAIContinue = (data: { sector: string; country: string; designation: string }) => {
    // Close both modals
    setIsAIModalOpen(false);
    onClose();
    // Call the original onCustomizeWithAI function
    onCustomizeWithAI();
  };

  const handleAIClose = () => {
    setIsAIModalOpen(false);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black/75 backdrop-blur-sm"
          onClick={onClose}
        />
        
        {/* Modal Content */}
        <div className="relative bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100 flex-shrink-0">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Resume Uploaded Successfully!</h2>
              <p className="text-sm text-gray-600 mt-1">Choose how you'd like to proceed</p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="p-4 overflow-y-auto flex-1">
            {/* File Info */}
            <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-green-600" />
                <div>
                  <p className="font-medium text-green-900 text-sm">{fileName}</p>
                  <p className="text-xs text-green-700">File uploaded successfully</p>
                </div>
              </div>
            </div>

            {/* Options */}
            <div className="space-y-3">
              <Card 
                className="cursor-pointer hover:shadow-md transition-shadow border-2 border-gray-200 hover:border-blue-300"
                onClick={onContinueWithRaw}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <FileText className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-base">Continue with Raw Content</CardTitle>
                      <CardDescription className="text-xs">Use the extracted content as-is</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-xs text-gray-600 mb-3">
                    We'll extract the content from your resume and let you edit it directly. 
                    Perfect for quick updates and minor changes.
                  </p>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-sm py-2">
                    Continue with Raw
                    <ArrowRight className="w-3 h-3 ml-2" />
                  </Button>
                </CardContent>
              </Card>

              <Card 
                className="cursor-pointer hover:shadow-md transition-shadow border-2 border-gray-200 hover:border-purple-300"
                onClick={handleCustomizeWithAI}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <CardTitle className="text-base">Customize with AI</CardTitle>
                      <CardDescription className="text-xs">Get AI-powered suggestions and improvements</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-xs text-gray-600 mb-3">
                    Our AI will analyze your resume and suggest improvements to make it more 
                    compelling and professional. Perfect for enhancing your content.
                  </p>
                  <Button className="w-full bg-purple-600 hover:bg-purple-700 text-sm py-2">
                    Customize with AI
                    <ArrowRight className="w-3 h-3 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* AI Customization Modal */}
      <AICustomizationModal
        isOpen={isAIModalOpen}
        onClose={handleAIClose}
        onContinue={handleAIContinue}
      />
    </>
  );
};

export default ResumeUploadModal; 