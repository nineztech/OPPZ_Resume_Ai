  import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileText, Sparkles, ArrowLeft, CheckCircle, User } from 'lucide-react';
import ResumeUploadModal from '@/components/modals/ResumeUploadModal';
import AICustomizationModal from '@/components/modals/AICustomizationModal';
import AISuggestionsModal from '@/components/modals/AISuggestionsModal';
import { geminiParserService } from '@/services/geminiParserService';
import { getTemplateById } from '@/data/templates';
import type { AIProcessingResult } from '@/services/geminiParserService';

const UseTemplatePage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isSuggestionsModalOpen, setIsSuggestionsModalOpen] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [extractedData, setExtractedData] = useState<any>(null);
  const [aiResults, setAIResults] = useState<AIProcessingResult | null>(null);

  const templateId = searchParams.get('templateId');
  const selectedColor = searchParams.get('color');

  const handleFileUpload = async (file: File) => {
    setUploadedFile(file);
    setIsUploading(true);
    try {
      console.log("Starting Gemini parsing...");
      const geminiData = await geminiParserService.parseResume(file);
      console.log("Gemini parsing finished", geminiData);
      
      // Convert Gemini data to the format expected by ResumeBuilderPage
      const convertedData = geminiParserService.convertToResumeData(geminiData);
      console.log("Converted data for ResumeBuilderPage:", convertedData);
      setExtractedData(convertedData);
      setIsUploading(false);
      setIsModalOpen(true); // <-- This should open the modal
    } catch (err) {
      setIsUploading(false);
      console.error('Gemini parsing error:', err);
      alert('Failed to parse resume with AI. Please try again.');
    }
  };

  // const handleContinueWithRaw = () => {
  //   console.log("Navigating to ResumeBuilderPage with raw data:", extractedData);
  //   navigate('/resume/builder', { 
  //     state: { 
  //       templateId, 
  //       selectedColor, 
  //       mode: 'raw',
  //       extractedData // pass extracted data, not file!
  //     } 
  //   });
  // };

  // const handleCustomizeWithAI = () => {
  //   console.log("Navigating to ResumeBuilderPage with AI data:", extractedData);
  //   navigate('/resume/builder', { 
  //     state: { 
  //       templateId, 
  //       selectedColor, 
  //       mode: 'ai',
  //       extractedData // pass extracted data, not file!
  //     } 
  //   });
  // };

  // const handleContinueWithoutResume = async () => {
  //   // Get default template data
  //   const template = getTemplateById(templateId || 'modern-professional');
  //   const defaultData = template?.templateData;
    
  //   navigate('/resume/builder', { 
  //     state: { 
  //       templateId, 
  //       selectedColor, 
  //       mode: 'default',
  //       defaultData // pass default template data
  //     } 
  //   });
  // };

  // const handleAICustomization = (data: { 
  //   sector: string; 
  //   country: string; 
  //   designation: string; 
  //   aiResults?: AIProcessingResult;
  //   resumeFile?: File;
  // }) => {
  //   if (data.aiResults) {
  //     // Show AI suggestions modal
  //     setAIResults(data.aiResults);
  //     setIsAIModalOpen(false);
  //     setIsSuggestionsModalOpen(true);
  //   } else {
  //     // Continue without AI analysis (just job description)
  //     setIsAIModalOpen(false);
  //     navigate("/resume/builder", { 
  //       state: { 
  //         templateId, 
  //         selectedColor,
  //         mode: 'ai-basic',
  //         aiParams: { sector: data.sector, country: data.country, designation: data.designation }
  //       } 
  //     });
  //   }
  // };

  // const handleApplyAISuggestions = () => {
  //   if (aiResults) {
  //     // Navigate to resume builder with AI suggestions and parsed data
  //     setIsSuggestionsModalOpen(false);
  //     navigate("/resume/builder", { 
  //       state: { 
  //         templateId, 
  //         selectedColor,
  //         mode: 'ai-enhanced',
  //         extractedData: aiResults.resumeData,
  //         aiSuggestions: aiResults.suggestions,
  //         jobDescription: aiResults.jobDescription,
  //         aiParams: aiResults.parameters
  //       } 
  //     });
  //   }
  // };
// In UseTemplatePage.tsx - Update these navigation methods:

const handleContinueWithRaw = () => {
  console.log("Navigating to ResumeBuilderPage with raw data:", extractedData);
  
  // Include color in URL parameters
  const params = new URLSearchParams();
  params.set('templateId', templateId || 'modern-professional');
  if (selectedColor) {
    params.set('color', encodeURIComponent(selectedColor));
  }
  
  navigate(`/resume/builder?${params.toString()}`, { 
    state: { 
      templateId, 
      selectedColor, 
      mode: 'raw',
      extractedData
    } 
  });
};

const handleCustomizeWithAI = () => {
  console.log("Navigating to ResumeBuilderPage with AI data:", extractedData);
  
  // Include color in URL parameters
  const params = new URLSearchParams();
  params.set('templateId', templateId || 'modern-professional');
  if (selectedColor) {
    params.set('color', encodeURIComponent(selectedColor));
  }
  
  navigate(`/resume/builder?${params.toString()}`, { 
    state: { 
      templateId, 
      selectedColor, 
      mode: 'ai',
      extractedData
    } 
  });
};

const handleContinueWithoutResume = async () => {
  // Get default template data
  const template = getTemplateById(templateId || 'modern-professional');
  const defaultData = template?.templateData;
  
  // Include color in URL parameters
  const params = new URLSearchParams();
  params.set('templateId', templateId || 'modern-professional');
  if (selectedColor) {
    params.set('color', encodeURIComponent(selectedColor));
  }
  
  navigate(`/resume/builder?${params.toString()}`, { 
    state: { 
      templateId, 
      selectedColor, 
      mode: 'default',
      defaultData
    } 
  });
};

const handleAICustomization = (data: { 
  sector: string; 
  country: string; 
  designation: string; 
  aiResults?: AIProcessingResult;
  resumeFile?: File;
}) => {
  // Include color in URL parameters
  const params = new URLSearchParams();
  params.set('templateId', templateId || 'modern-professional');
  if (selectedColor) {
    params.set('color', encodeURIComponent(selectedColor));
  }
  
  if (data.aiResults) {
    // Show AI suggestions modal
    setAIResults(data.aiResults);
    setIsAIModalOpen(false);
    setIsSuggestionsModalOpen(true);
  } else {
    // Continue without AI analysis (just job description)
    setIsAIModalOpen(false);
    navigate(`/resume/builder?${params.toString()}`, { 
      state: { 
        templateId, 
        selectedColor,
        mode: 'ai-basic',
        aiParams: { sector: data.sector, country: data.country, designation: data.designation }
      } 
    });
  }
};

const handleApplyAISuggestions = () => {
  if (aiResults) {
    // Include color in URL parameters
    const params = new URLSearchParams();
    params.set('templateId', templateId || 'modern-professional');
    if (selectedColor) {
      params.set('color', encodeURIComponent(selectedColor));
    }
    
    // Navigate to resume builder with AI suggestions and parsed data
    setIsSuggestionsModalOpen(false);
    navigate(`/resume/builder?${params.toString()}`, { 
      state: { 
        templateId, 
        selectedColor,
        mode: 'ai-enhanced',
        extractedData: aiResults.resumeData,
        aiSuggestions: aiResults.suggestions,
        jobDescription: aiResults.jobDescription,
        aiParams: aiResults.parameters
      } 
    });
  }
};
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* Upload Section */}
        <section className="w-full px-4 py-12">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => navigate('/resume/templates')}
            className="mb-6 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Templates
          </Button>
          <div className="w-full max-w-4xl mx-auto">
            <Card 
              className="border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors cursor-pointer"
              onClick={() => {
                if (!isUploading) {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = '.pdf,.doc,.docx,.txt';
                  input.onchange = (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (file) {
                      handleFileUpload(file);
                    }
                  };
                  input.click();
                }
              }}
            >
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Upload className="w-8 h-8 text-blue-600" />
                </div>
                <CardTitle className="text-2xl font-semibold text-gray-900">
                  Upload Your Resume for AI Parsing
                </CardTitle>
                <CardDescription className="text-lg text-gray-600">
                  Our AI will intelligently parse and organize your resume content
                </CardDescription>
              </CardHeader>
              
              <CardContent className="text-center">
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                      size="lg"
                      className="bg-blue-600 hover:bg-blue-700 text-white font-medium"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isUploading) {
                          const input = document.createElement('input');
                          input.type = 'file';
                          input.accept = '.pdf,.doc,.docx,.txt';
                          input.onchange = (e) => {
                            const file = (e.target as HTMLInputElement).files?.[0];
                            if (file) {
                              handleFileUpload(file);
                            }
                          };
                          input.click();
                        }
                      }}
                      disabled={isUploading}
                    >
                      {isUploading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="w-5 h-5 mr-2" />
                          Choose File
                        </>
                      )}
                    </Button>
                  </div>
                  
                  <div className="text-sm text-gray-500">
                    Supported formats: PDF, DOC, DOCX, TXT (Max 10MB)
                  </div>
                </div>

                {/* Upload Progress */}
                {isUploading && (
                  <div className="mt-6">
                    <div className="bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: '60%' }}></div>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">AI is parsing your resume...</p>
                  </div>
                )}

                {/* File Info */}
                {uploadedFile && !isUploading && (
                  <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <div className="flex-1">
                        <p className="font-medium text-green-900">{uploadedFile.name}</p>
                        <p className="text-sm text-green-700">
                          {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Continue without resume button */}
            <div className="mt-8 text-center">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-gradient-to-br from-blue-50 via-white to-purple-50 text-gray-500">or</span>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleContinueWithoutResume}
                  className="bg-white hover:bg-gray-50 border-gray-300 text-gray-700 hover:text-gray-900"
                >
                  <User className="w-5 h-5 mr-2" />
                  Continue without resume
                </Button>
                <Button
                  size="lg"
                  onClick={() => setIsAIModalOpen(true)}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  AI-Powered Resume
                </Button>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Start with a blank template or get AI-powered resume suggestions
              </p>
            </div>

            {/* Features */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6 w-full">
              <Card className="text-center p-6">
                <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">AI Content Parsing</h3>
                <p className="text-gray-600 text-sm">
                  Our AI intelligently parses and organizes your resume content
                </p>
              </Card>

              <Card className="text-center p-6">
                <div className="mx-auto w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <Sparkles className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">AI Enhancement</h3>
                <p className="text-gray-600 text-sm">
                  Get AI-powered suggestions to improve your resume content
                </p>
              </Card>

              <Card className="text-center p-6">
                <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Professional Templates</h3>
                <p className="text-gray-600 text-sm">
                  Apply your content to our professional resume templates
                </p>
              </Card>
            </div>
          </div>
        </section>

      {/* Resume Upload Modal */}
      <ResumeUploadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onContinueWithRaw={handleContinueWithRaw}
        onCustomizeWithAI={handleCustomizeWithAI}
        fileName={uploadedFile?.name || ''}
        uploadedFile={uploadedFile} // Pass the uploaded file
      />

      {/* AI Customization Modal */}
      <AICustomizationModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        onContinue={handleAICustomization}
      />

      {/* AI Suggestions Modal */}
      {aiResults && aiResults.suggestions && aiResults.jobDescription && (
        <AISuggestionsModal
          isOpen={isSuggestionsModalOpen}
          onClose={() => setIsSuggestionsModalOpen(false)}
          suggestions={aiResults.suggestions}
          jobDescription={aiResults.jobDescription}
          onApplyChanges={handleApplyAISuggestions}
        />
      )}
    </div>
  );
};

export default UseTemplatePage; 