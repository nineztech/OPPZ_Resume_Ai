import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, Target, Zap, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { atsService } from '@/services/atsService';
import type { ATSAnalysisResult, JDSpecificATSResult } from '@/services/atsService';

interface ATSUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAnalysisComplete: (results: ATSAnalysisResult | JDSpecificATSResult, type: 'standard' | 'job-specific') => void;
}

const ATSUploadModal: React.FC<ATSUploadModalProps> = ({
  isOpen,
  onClose,
  onAnalysisComplete
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [analysisType, setAnalysisType] = useState<'standard' | 'job-specific'>('standard');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const { toast } = useToast();

  const handleFileChange = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const file = files[0];
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    
    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(pdf|docx|txt)$/i)) {
      toast({
        title: 'Invalid File Type',
        description: 'Please upload a PDF, DOCX, or TXT file.',
        variant: 'destructive'
      } as any);
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast({
        title: 'File Too Large',
        description: 'Please upload a file smaller than 10MB.',
        variant: 'destructive'
      } as any);
      return;
    }

    setSelectedFile(file);
  }, [toast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    handleFileChange(e.dataTransfer.files);
  }, [handleFileChange]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  }, []);

  const analyzeResume = async () => {
    if (!selectedFile) {
      toast({
        title: 'No File Selected',
        description: 'Please upload a resume file first.',
        variant: 'destructive'
      } as any);
      return;
    }

    if (analysisType === 'job-specific' && !jobDescription.trim()) {
      toast({
        title: 'Job Description Required',
        description: 'Please provide a job description for job-specific analysis.',
        variant: 'destructive'
      } as any);
      return;
    }

    setIsAnalyzing(true);

    try {
      if (analysisType === 'standard') {
        const response = await atsService.analyzeResumeStandard(selectedFile);
        if (response.success && response.data) {
          onAnalysisComplete(response.data, 'standard');
          onClose();
          toast({
            title: 'Analysis Complete',
            description: 'Your resume has been analyzed successfully!',
          } as any);
        } else {
          throw new Error(response.error || 'Analysis failed');
        }
      } else {
        const response = await atsService.analyzeResumeForJob(selectedFile, jobDescription);
        if (response.success && response.data) {
          onAnalysisComplete(response.data, 'job-specific');
          onClose();
          toast({
            title: 'Analysis Complete',
            description: 'Your resume has been analyzed against the job description!',
          } as any);
        } else {
          throw new Error(response.error || 'Analysis failed');
        }
      }
    } catch (error) {
      toast({
        title: 'Analysis Failed',
        description: error instanceof Error ? error.message : 'Something went wrong. Please try again.',
        variant: 'destructive'
      } as any);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetModal = () => {
    setSelectedFile(null);
    setJobDescription('');
    setAnalysisType('standard');
    setIsAnalyzing(false);
    setDragActive(false);
  };

  const handleClose = () => {
    if (!isAnalyzing) {
      resetModal();
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            ATS Resume Analysis
          </DialogTitle>
          <p className="text-center text-gray-600">
            Get instant feedback on your resume's ATS compatibility
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Analysis Type Selection */}
          <div className="flex justify-center space-x-4">
            <Button
              variant={analysisType === 'standard' ? 'default' : 'outline'}
              onClick={() => setAnalysisType('standard')}
              className="flex items-center"
              disabled={isAnalyzing}
            >
              <FileText className="w-4 h-4 mr-2" />
              Standard Analysis
            </Button>
            <Button
              variant={analysisType === 'job-specific' ? 'default' : 'outline'}
              onClick={() => setAnalysisType('job-specific')}
              className="flex items-center"
              disabled={isAnalyzing}
            >
              <Target className="w-4 h-4 mr-2" />
              Job-Specific Analysis
            </Button>
          </div>

          {/* Analysis Type Description */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
              <div className="text-sm">
                {analysisType === 'standard' ? (
                  <div>
                    <strong>Standard Analysis:</strong> Evaluates your resume against general ATS best practices including formatting, keywords, section completeness, and achievements.
                  </div>
                ) : (
                  <div>
                    <strong>Job-Specific Analysis:</strong> Compares your resume directly against a specific job description to show match percentage and missing keywords.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Your Resume
            </label>
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                dragActive 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
              <div className="space-y-1">
                <p className="font-medium text-gray-700">
                  {selectedFile ? selectedFile.name : 'Drop your resume here or click to browse'}
                </p>
                <p className="text-xs text-gray-500">
                  Supports PDF, DOCX, and TXT files (max 10MB)
                </p>
              </div>
              <input
                type="file"
                accept=".pdf,.docx,.txt"
                onChange={(e) => handleFileChange(e.target.files)}
                className="hidden"
                id="ats-resume-upload"
                disabled={isAnalyzing}
              />
              <label htmlFor="ats-resume-upload">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-3" 
                  asChild
                  disabled={isAnalyzing}
                >
                  <span className="cursor-pointer">Choose File</span>
                </Button>
              </label>
            </div>
          </div>

          {/* Job Description Input */}
          <AnimatePresence>
            {analysisType === 'job-specific' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Description *
                </label>
                <Textarea
                  placeholder="Paste the job description here to analyze how well your resume matches the specific role..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="min-h-[120px]"
                  disabled={isAnalyzing}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isAnalyzing}
            >
              Cancel
            </Button>
            <Button
              onClick={analyzeResume}
              disabled={
                !selectedFile || 
                isAnalyzing || 
                (analysisType === 'job-specific' && !jobDescription.trim())
              }
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {isAnalyzing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Analyzing...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Analyze Resume
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ATSUploadModal;
