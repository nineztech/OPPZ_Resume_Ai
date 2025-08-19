import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sparkles, Building2, Globe, User, X, Upload, Loader2, CheckCircle } from 'lucide-react';
import countryList from 'react-select-country-list';
import { geminiParserService, type AIProcessingResult } from '@/services/geminiParserService';
import AISuggestionsModal from './AISuggestionsModal';

interface AICustomizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: (data: { 
    sector: string; 
    country: string; 
    designation: string; 
    aiResults?: AIProcessingResult;
    resumeFile?: File;
  }) => void;
  preUploadedFile?: File | null; // Add this prop
}

const AICustomizationModal: React.FC<AICustomizationModalProps> = ({
  isOpen,
  onClose,
  onContinue,
  preUploadedFile // Add this prop
}) => {
  const [sector, setSector] = useState('');
  const [country, setCountry] = useState('');
  const [designation, setDesignation] = useState('');
  const [countries] = useState(() => countryList().getData());
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  const [showSuggestionsModal, setShowSuggestionsModal] = useState(false);
  const [aiResults, setAiResults] = useState<AIProcessingResult | null>(null);
  const [jobDescription, setJobDescription] = useState<any>(null);

  // Set the pre-uploaded file when the modal opens
  React.useEffect(() => {
    if (isOpen && preUploadedFile) {
      setUploadedFile(preUploadedFile);
    }
  }, [isOpen, preUploadedFile]);

  if (!isOpen) return null;

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['.pdf', '.doc', '.docx', '.txt'];
      const fileName = file.name.toLowerCase();
      
      if (!allowedTypes.some(ext => fileName.endsWith(ext))) {
        alert('Please upload a PDF, DOC, DOCX, or TXT file.');
        return;
      }

      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size should be less than 10MB.');
        return;
      }

      setUploadedFile(file);
    }
  };

  const handleContinue = async () => {
    if (!sector || !country || !designation) {
      alert('Please fill in all fields.');
      return;
    }

    const params = { sector, country, designation };

    if (uploadedFile) {
      // Process with AI suggestions
      setIsProcessing(true);
      try {
        setProcessingStep('Parsing resume...');
        await new Promise(resolve => setTimeout(resolve, 500)); // Brief delay for UX
        
        setProcessingStep('Generating job description...');
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setProcessingStep('Analyzing and comparing...');
        const results = await geminiParserService.getAISuggestions(uploadedFile, params.sector, params.country, params.designation);
        
        setProcessingStep('Preparing suggestions...');
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Store results and show suggestions modal
        setAiResults(results);
        setJobDescription({
          jobTitle: `${params.designation} in ${params.sector}`,
          sector: params.sector,
          country: params.country
        });
        setShowSuggestionsModal(true);
        
        // Don't close the current modal - let the suggestions modal handle the flow
        // onClose();
      } catch (error) {
        console.error('AI processing error:', error);
        alert('Failed to process resume with AI. Please try again.');
      } finally {
        setIsProcessing(false);
        setProcessingStep('');
      }
    } else {
      // Continue without resume
      onContinue(params);
    }
  };

  const isFormValid = sector && country && designation;
  const canContinue = isFormValid && !isProcessing;

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
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <h2 className="text-lg font-semibold text-gray-900">AI Customization</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 flex-1 max-h-[70vh] overflow-y-auto">
            <p className="text-sm text-gray-600 mb-6">Tell us about your background and optionally upload your resume for AI-powered suggestions.</p>
            
            <div className="space-y-6">
              {/* Resume Upload Section */}
              <div>
                <Label className="flex items-center gap-2 mb-3">
                  <Upload className="w-4 h-4 text-gray-500" />
                  Upload Resume (Optional)
                </Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-purple-400 transition-colors">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="resume-upload"
                    disabled={isProcessing}
                  />
                  <label
                    htmlFor="resume-upload"
                    className="cursor-pointer block"
                  >
                    {uploadedFile ? (
                      <div className="text-green-600">
                        <CheckCircle className="w-8 h-8 mx-auto mb-2" />
                        <p className="font-medium">{uploadedFile.name}</p>
                        {/* <p className="text-sm text-gray-500">
                          {preUploadedFile ? 'Resume already uploaded from previous step' : 'Click to change file'}
                        </p> */}
                      </div>
                    ) : (
                      <div className="text-gray-500">
                        <Upload className="w-8 h-8 mx-auto mb-2" />
                        <p className="font-medium">Click to upload your resume</p>
                        <p className="text-sm">PDF, DOC, DOCX, or TXT (max 10MB)</p>
                      </div>
                    )}
                  </label>
                </div>
                {uploadedFile && (
                  <p className="text-xs text-purple-600 mt-2">
                    ✨ AI will analyze your resume and provide personalized suggestions
                  </p>
                )}
              </div>

              {/* Sector/Industry */}
              <div>
                <Label htmlFor="sector" className="flex items-center gap-2 mb-2">
                  <Building2 className="w-4 h-4 text-gray-500" />
                  Sector/Industry
                </Label>
                <Input
                  id="sector"
                  value={sector}
                  onChange={(e) => setSector(e.target.value)}
                  placeholder="e.g., Technology, Healthcare, Finance"
                  className="w-full"
                  disabled={isProcessing}
                />
              </div>

              {/* Country */}
              <div>
                <Label htmlFor="country" className="flex items-center gap-2 mb-2">
                  <Globe className="w-4 h-4 text-gray-500" />
                  Country
                </Label>
                <select
                  id="country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100"
                  disabled={isProcessing}
                >
                  <option value="">Select a country</option>
                  {countries.map((countryOption: any) => (
                    <option key={countryOption.value} value={countryOption.label}>
                      {countryOption.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Designation/Role */}
              <div>
                <Label htmlFor="designation" className="flex items-center gap-2 mb-2">
                  <User className="w-4 h-4 text-gray-500" />
                  Designation/Role
                </Label>
                <Input
                  id="designation"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  placeholder="e.g., Software Engineer, Marketing Manager"
                  className="w-full"
                  disabled={isProcessing}
                />
              </div>

              {/* Processing Status */}
              {isProcessing && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <Loader2 className="w-5 h-5 text-purple-600 animate-spin" />
                    <div>
                      <p className="font-medium text-purple-900">Processing with AI...</p>
                      <p className="text-sm text-purple-700">{processingStep}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-100 flex-shrink-0">
            <Button
              onClick={handleContinue}
              disabled={!canContinue}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  {uploadedFile ? 'Continue with AI Analysis' : 'Continue with AI'}
                </>
              )}
            </Button>
            {uploadedFile && !isProcessing && (
              <p className="text-xs text-center text-gray-500 mt-2">
                Your resume will be analyzed and compared with job requirements
              </p>
            )}
          </div>
        </div>
      </div>

      {/* AI Suggestions Modal */}
      {showSuggestionsModal && aiResults && jobDescription && (
        <AISuggestionsModal
          isOpen={showSuggestionsModal}
          onClose={() => {
            setShowSuggestionsModal(false);
            onClose(); // Close the parent modal when suggestions modal is closed
          }}
          suggestions={aiResults.suggestions || {}}
          jobDescription={jobDescription}
          onApplyChanges={() => {
            setShowSuggestionsModal(false);
            onContinue({ 
              sector, 
              country, 
              designation, 
              aiResults, 
              resumeFile: uploadedFile || undefined
            });
          }}
        />
      )}
    </>
  );
};

export default AICustomizationModal;
