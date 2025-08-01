import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Sparkles, ArrowRight, X } from 'lucide-react';

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
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-white rounded-xl shadow-2xl max-w-2xl w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Resume Uploaded Successfully!</h2>
            <p className="text-sm text-gray-600 mt-1">Choose how you'd like to proceed</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          {/* File Info */}
          <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-medium text-green-900">{fileName}</p>
                <p className="text-sm text-green-700">File uploaded successfully</p>
              </div>
            </div>
          </div>

          {/* Options */}
          <div className="space-y-4">
            <Card 
              className="cursor-pointer hover:shadow-md transition-shadow border-2 border-gray-200 hover:border-blue-300"
              onClick={onContinueWithRaw}
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Continue with Raw Content</CardTitle>
                    <CardDescription>Use the extracted content as-is</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  We'll extract the content from your resume and let you edit it directly. 
                  Perfect for quick updates and minor changes.
                </p>
                <Button className="mt-4 w-full bg-blue-600 hover:bg-blue-700">
                  Continue with Raw
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover:shadow-md transition-shadow border-2 border-gray-200 hover:border-purple-300"
              onClick={onCustomizeWithAI}
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Customize with AI</CardTitle>
                    <CardDescription>Get AI-powered suggestions and improvements</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Our AI will analyze your resume and suggest improvements to make it more 
                  compelling and professional. Perfect for enhancing your content.
                </p>
                <Button className="mt-4 w-full bg-purple-600 hover:bg-purple-700">
                  Customize with AI
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeUploadModal; 