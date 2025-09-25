import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileText, Sparkles, ArrowRight, Upload, CheckCircle, Building2, Globe, User, ArrowLeft } from 'lucide-react';
import countryList from 'react-select-country-list';
import { geminiParserService } from '@/services/geminiParserService';

const ResumeProcessingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get data from navigation state
  const { uploadedFile, extractedData, templateId, selectedColor, directToAI } = location.state || {};
  
  // Left side (Resume Upload Modal content) state
  const [fileName] = useState(uploadedFile?.name || '');
  
  // Right side (AI Customization Modal content) state
  const [sector, setSector] = useState('');
  const [country, setCountry] = useState('');
  const [designation, setDesignation] = useState('');
  const [countries] = useState(() => countryList().getData());
  const [aiUploadedFile, setAiUploadedFile] = useState<File | null>(uploadedFile || null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAIActivated, setIsAIActivated] = useState(directToAI || false);
  const [loadingTexts] = useState([
    "You're almost there! 🚀",
    "Our AI is analyzing your resume...",
    "Finding the perfect suggestions for you...",
    "Crafting personalized recommendations...",
    "Almost ready to transform your career! ✨"
  ]);
  const [currentLoadingText, setCurrentLoadingText] = useState(0);

  // Redirect back if no template data and not coming from direct AI flow
  useEffect(() => {
    if (!templateId && !directToAI) {
      navigate('/resume/templates');
    }
  }, [templateId, directToAI, navigate]);

  const handleContinueWithRaw = () => {
    console.log("Navigating to ResumeBuilderPage with raw data:", extractedData);
    navigate('/resume/builder', { 
      state: { 
        templateId, 
        selectedColor, 
        mode: 'raw',
        extractedData
      } 
    });
  };

  const handleCustomizeWithAI = () => {
    setIsAIActivated(true);
  };

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

      setAiUploadedFile(file);
    }
  };

  const handleAIContinue = async () => {
    if (!sector || !country || !designation) {
      alert('Please fill in all fields.');
      return;
    }

    const params = { sector, country, designation };

    if (aiUploadedFile) {
      // Process with AI suggestions
      setIsProcessing(true);
      setCurrentLoadingText(0);
      
      // Start the loading text animation
      const textInterval = setInterval(() => {
        setCurrentLoadingText(prev => {
          if (prev < loadingTexts.length - 1) {
            return prev + 1;
          }
          return prev;
        });
      }, 5000);

      try {
        // Simulate processing steps with delays
        await new Promise(resolve => setTimeout(resolve, 1500)); // First text
        await new Promise(resolve => setTimeout(resolve, 1500)); // Second text
        await new Promise(resolve => setTimeout(resolve, 1500)); // Third text
        await new Promise(resolve => setTimeout(resolve, 1500)); // Fourth text
        await new Promise(resolve => setTimeout(resolve, 1500)); // Fifth text
        
        // Actual AI processing
        const results = await geminiParserService.getAISuggestions(aiUploadedFile, params.sector, params.country, params.designation);
        
        clearInterval(textInterval);
        
        // Navigate to AI suggestions page with results
        const jobDescription = {
          jobTitle: `${params.designation} in ${params.sector}`,
          sector: params.sector,
          country: params.country
        };
        
        navigate('/resume/ai-suggestions', {
          state: {
            suggestions: results.suggestions || {},
            jobDescription,
            sector: params.sector,
            country: params.country,
            designation: params.designation,
            aiResults: results,
            resumeFile: aiUploadedFile || undefined,
            // Add template info for returning to builder
            templateId,
            selectedColor,
            extractedData
          }
        });
      } catch (error) {
        clearInterval(textInterval);
        console.error('AI processing error:', error);
        alert('Failed to process resume with AI. Please try again.');
      } finally {
        setIsProcessing(false);
        setCurrentLoadingText(0);
      }
    } else {
      // Continue without resume
      navigate("/resume/builder", { 
        state: { 
          templateId, 
          selectedColor,
          mode: 'ai-basic',
          aiParams: { sector: params.sector, country: params.country, designation: params.designation }
        } 
      });
    }
  };

  const isFormValid = sector && country && designation;
  const canContinue = isFormValid && !isProcessing;

  if (!templateId && !directToAI) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Loading Overlay */}
      {isProcessing && (
        <div className="fixed inset-0 z-50 bg-white/80 backdrop-blur-sm flex items-center justify-center">
          <div className="text-center space-y-4 max-w-sm mx-auto px-6">
            {/* Spinner */}
            <div className="relative flex justify-center">
              <div className="w-12 h-12 border-3 border-purple-200 rounded-full"></div>
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-12 h-12 border-3 border-purple-600 rounded-full border-t-transparent"></div>
            </div>
            
            {/* Loading Text */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900">Processing with AI...</h3>
              <div className="min-h-[3rem] flex items-center justify-center">
                <p className="text-base text-purple-600 font-medium">
                  {loadingTexts[currentLoadingText]}
                </p>
              </div>
            </div>
            
            {/* Progress Dots */}
            <div className="flex justify-center space-x-2">
              {loadingTexts.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index <= currentLoadingText 
                      ? 'bg-purple-600' 
                      : 'bg-purple-200'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="w-full px-4 py-4">
        <div className="max-w-7xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate('/resume/templates')}
            className="mb-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Templates
          </Button>
        
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full px-4 pb-4">
        <div className="max-w-7xl mx-auto">
          <div className={`grid grid-cols-1 ${uploadedFile && extractedData ? 'lg:grid-cols-2' : 'lg:grid-cols-1 max-w-2xl mx-auto'} gap-6`}>
            
            {/* Left Side - Resume Upload Modal Content */}
            {uploadedFile && extractedData && (
              <div className="space-y-4">
              <Card className="h-fit">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold text-gray-900">AI Resume Parsing Complete!</CardTitle>
                  <CardDescription className="text-sm">Choose how you'd like to proceed with your parsed resume</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* File Info */}
                  <div className="p-2 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2">
                      <FileText className="w-3 h-3 text-green-600" />
                      <div>
                        <p className="font-medium text-green-900 text-xs">{fileName}</p>
                        <p className="text-xs text-green-700">AI parsing completed successfully</p>
                      </div>
                    </div>
                  </div>

                  {/* Options */}
                  <div className="space-y-3">
                    <Card 
                      className="cursor-pointer hover:shadow-md transition-shadow border-2 border-gray-200 hover:border-blue-300"
                      onClick={handleContinueWithRaw}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center">
                            <FileText className="w-3 h-3 text-blue-600" />
                          </div>
                          <div>
                            <CardTitle className="text-sm">Continue with AI Parsed Content</CardTitle>
                            <CardDescription className="text-xs">Use the AI-parsed content as-is</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-xs text-gray-600 mb-2">
                          Our AI has already parsed your resume and organized the content. 
                          You can now edit and refine the extracted information directly.
                        </p>
                        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-xs py-1.5">
                          Continue with Raw Parsed
                          <ArrowRight className="w-3 h-3 ml-2" />
                        </Button>
                      </CardContent>
                    </Card>

                    <Card 
                      className="cursor-pointer hover:shadow-md transition-shadow border-2 border-gray-200 hover:border-purple-300"
                      onClick={handleCustomizeWithAI}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 bg-purple-100 rounded-full flex items-center justify-center">
                            <Sparkles className="w-3 h-3 text-purple-600" />
                          </div>
                          <div>
                            <CardTitle className="text-sm">Get AI Enhancement Suggestions</CardTitle>
                            <CardDescription className="text-xs">Get AI-powered suggestions and improvements</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-xs text-gray-600 mb-2">
                          Our AI will analyze your parsed resume and suggest improvements to make it more 
                          compelling and professional. Perfect for enhancing your content.
                        </p>
                        <Button className="w-full bg-purple-600 hover:bg-purple-700 text-xs py-1.5">
                          Get AI Suggestions
                          <ArrowRight className="w-3 h-3 ml-2" />
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
              </div>
            )}

            {/* Right Side - AI Customization Modal Content */}
            <div className={`space-y-4 transition-all duration-300 ${!isAIActivated ? 'blur-sm opacity-50 pointer-events-none' : ''}`}>
              <Card className="h-fit">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    <CardTitle className="text-lg font-semibold text-gray-900">AI Customization</CardTitle>
                  </div>
                  <CardDescription className="text-sm">Tell us about your background and optionally upload your resume for AI-powered suggestions.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Resume Upload Section */}
                  <div>
                    <Label className="flex items-center gap-2 mb-2">
                      <Upload className="w-3 h-3 text-gray-500" />
                      Upload Resume
                      <span className="text-red-500">*</span>
                    </Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 text-center hover:border-purple-400 transition-colors">
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
                        {aiUploadedFile ? (
                          <div className="text-green-600">
                            <CheckCircle className="w-6 h-6 mx-auto mb-1" />
                            <p className="font-medium text-sm">{aiUploadedFile.name}</p>
                          </div>
                        ) : (
                          <div className="text-gray-500">
                            <Upload className="w-6 h-6 mx-auto mb-1" />
                            <p className="font-medium text-sm">Click to upload your resume</p>
                            <p className="text-xs">PDF, DOC, DOCX, or TXT (max 10MB)</p>
                          </div>
                        )}
                      </label>
                    </div>
                    {aiUploadedFile && (
                      <p className="text-xs text-purple-600 mt-1">
                        ✨ AI will analyze your resume and provide personalized suggestions
                      </p>
                    )}
                  </div>

                  {/* Sector/Industry */}
                  <div>
                    <Label htmlFor="sector" className="flex items-center gap-2 mb-1">
                      <Building2 className="w-3 h-3 text-gray-500" />
                      Sector/Industry
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="sector"
                      value={sector}
                      onChange={(e) => setSector(e.target.value)}
                      placeholder="e.g., Technology, Healthcare, Finance"
                      className="w-full py-1.5"
                      disabled={isProcessing}
                    />
                  </div>

                  {/* Country */}
                  <div>
                    <Label htmlFor="country" className="flex items-center gap-2 mb-1">
                      <Globe className="w-3 h-3 text-gray-500" />
                      Country
                      <span className="text-red-500">*</span>
                    </Label>
                    <select
                      id="country"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 text-sm"
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
                    <Label htmlFor="designation" className="flex items-center gap-2 mb-1">
                      <User className="w-3 h-3 text-gray-500" />
                      Designation/Role
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="designation"
                      value={designation}
                      onChange={(e) => setDesignation(e.target.value)}
                      placeholder="e.g., Software Engineer, Marketing Manager"
                      className="w-full py-1.5"
                      disabled={isProcessing}
                    />
                  </div>



                  {/* Continue Button */}
                  <Button
                    onClick={handleAIContinue}
                    disabled={!canContinue}
                    className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed py-1.5"
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-3 h-3 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3 h-3 mr-2" />
                        {aiUploadedFile ? 'Continue with AI Analysis' : 'Continue with AI'}
                      </>
                    )}
                  </Button>
                  {aiUploadedFile && !isProcessing && (
                    <p className="text-xs text-center text-gray-500 mt-1">
                      Your resume will be analyzed and compared with job requirements
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Activation Message */}
          {!isAIActivated && uploadedFile && extractedData && (
            <div className="mt-4 text-center">
              <p className="text-xs text-gray-500">
                Click "Get AI Enhancement Suggestions" on the left to activate AI customization
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumeProcessingPage;
