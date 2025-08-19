import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Upload, FileText, Target, Zap, CheckCircle, AlertCircle, XCircle, BarChart3, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { atsService } from '@/services/atsService';
import type { ATSAnalysisResult, JDSpecificATSResult } from '@/services/atsService';

const ATSScorePage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [jobDescriptionFile, setJobDescriptionFile] = useState<File | null>(null);
  const [jdInputType, setJdInputType] = useState<'text' | 'file'>('text');
  const [analysisType, setAnalysisType] = useState<'standard' | 'job-specific'>('standard');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [standardResults, setStandardResults] = useState<ATSAnalysisResult | null>(null);
  const [jobResults, setJobResults] = useState<JDSpecificATSResult | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [jdDragActive, setJdDragActive] = useState(false);
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
    setStandardResults(null);
    setJobResults(null);
  }, [toast]);

  const handleJdFileChange = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const file = files[0];
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    
    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(pdf|docx|txt)$/i)) {
      toast({
        title: 'Invalid File Type',
        description: 'Please upload a PDF, DOCX, or TXT file for job description.',
        variant: 'destructive'
      } as any);
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast({
        title: 'File Too Large',
        description: 'Please upload a job description file smaller than 10MB.',
        variant: 'destructive'
      } as any);
      return;
    }

    setJobDescriptionFile(file);
    setJobResults(null);
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

  const handleJdDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setJdDragActive(false);
    handleJdFileChange(e.dataTransfer.files);
  }, [handleJdFileChange]);

  const handleJdDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setJdDragActive(true);
  }, []);

  const handleJdDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setJdDragActive(false);
  }, []);

  const extractFileContent = async (file: File): Promise<string | undefined> => {
    if (file.type === 'text/plain') {
      return await file.text();
    }
    // For PDF and DOCX files, we can't easily extract content on the frontend
    // The backend will handle this during analysis
    return undefined;
  };

  const analyzeResume = async () => {
    if (!selectedFile) {
      toast({
        title: 'No File Selected',
        description: 'Please upload a resume file first.',
        variant: 'destructive'
      } as any);
      return;
    }

    if (analysisType === 'job-specific') {
      if (jdInputType === 'text' && !jobDescription.trim()) {
        toast({
          title: 'Job Description Required',
          description: 'Please provide a job description for job-specific analysis.',
          variant: 'destructive'
        } as any);
        return;
      }
      
      if (jdInputType === 'file' && !jobDescriptionFile) {
        toast({
          title: 'Job Description File Required',
          description: 'Please upload a job description file for job-specific analysis.',
          variant: 'destructive'
        } as any);
        return;
      }
    }

    setIsAnalyzing(true);

    try {
      let fileContent: string | undefined;
      try {
        fileContent = await extractFileContent(selectedFile);
      } catch (error) {
        console.log('Could not extract file content for preview:', error);
      }

      if (analysisType === 'standard') {
        const response = await atsService.analyzeResumeStandard(selectedFile);
        if (response.success && response.data) {
          setStandardResults(response.data);
          
          // Navigate to results page with data
          navigate('/resume/ats-results', {
            state: {
              results: response.data,
              analysisType: 'standard',
              fileName: selectedFile.name,
              fileContent: response.data.extracted_text || fileContent,
              originalFile: selectedFile
            }
          });
        } else {
          throw new Error(response.error || 'Analysis failed');
        }
      } else {
        let response;
        if (jdInputType === 'text') {
          response = await atsService.analyzeResumeForJob(selectedFile, jobDescription);
        } else {
          response = await atsService.analyzeResumeForJobFile(selectedFile, jobDescriptionFile!);
        }
        
        if (response.success && response.data) {
          setJobResults(response.data);
          
          // Navigate to results page with data
          navigate('/resume/ats-results', {
            state: {
              results: response.data,
              analysisType: 'job-specific',
              fileName: selectedFile.name,
              fileContent: response.data.extracted_text || fileContent,
              originalFile: selectedFile,
              jdInputType: jdInputType,
              jdFileName: jdInputType === 'file' ? jobDescriptionFile?.name : undefined
            }
          });
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

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 65) return 'text-blue-600';
    if (score >= 45) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="w-6 h-6 text-green-600" />;
    if (score >= 65) return <AlertCircle className="w-6 h-6 text-blue-600" />;
    if (score >= 45) return <AlertCircle className="w-6 h-6 text-yellow-600" />;
    return <XCircle className="w-6 h-6 text-red-600" />;
  };

  const renderStandardResults = () => {
    if (!standardResults) return null;

    const interpretation = atsService.getScoreInterpretation(standardResults.overall_score);

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        {/* Overall Score */}
        <Card>
          <CardHeader className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              {getScoreIcon(standardResults.overall_score)}
              <CardTitle className="text-2xl">ATS Score</CardTitle>
            </div>
            <div className={`text-6xl font-bold ${getScoreColor(standardResults.overall_score)}`}>
              {standardResults.overall_score}
            </div>
            <div className="text-gray-600">out of 100</div>
            <Badge variant={interpretation.level === 'Excellent' ? 'default' : 'secondary'} className="mt-2">
              {interpretation.level}
            </Badge>
          </CardHeader>
          <CardContent>
            <p className={`text-center ${interpretation.color}`}>
              {interpretation.message}
            </p>
          </CardContent>
        </Card>

        {/* Category Scores */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Category Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(standardResults.category_scores).map(([key, score]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{atsService.formatCategoryName(key)}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          score >= 80 ? 'bg-green-500' :
                          score >= 65 ? 'bg-blue-500' :
                          score >= 45 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${score}%` }}
                      />
                    </div>
                    <span className={`text-sm font-semibold ${getScoreColor(score)}`}>
                      {score}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Strengths */}
        {standardResults.strengths.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-green-600">
                <CheckCircle className="w-5 h-5 mr-2" />
                Strengths
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {standardResults.strengths.map((strength, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-1 mr-2 flex-shrink-0" />
                    <span className="text-sm">{strength}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Weaknesses */}
        {standardResults.weaknesses.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-red-600">
                <XCircle className="w-5 h-5 mr-2" />
                Areas for Improvement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {standardResults.weaknesses.map((weakness, index) => (
                  <li key={index} className="flex items-start">
                    <XCircle className="w-4 h-4 text-red-500 mt-1 mr-2 flex-shrink-0" />
                    <span className="text-sm">{weakness}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Recommendations */}
        {standardResults.recommendations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-blue-600">
                <TrendingUp className="w-5 h-5 mr-2" />
                Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {standardResults.recommendations.map((recommendation, index) => (
                  <li key={index} className="flex items-start">
                    <TrendingUp className="w-4 h-4 text-blue-500 mt-1 mr-2 flex-shrink-0" />
                    <span className="text-sm">{recommendation}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </motion.div>
    );
  };

  const renderJobResults = () => {
    if (!jobResults) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        {/* Overall Score & Match */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-lg">ATS Score</CardTitle>
              <div className={`text-4xl font-bold ${getScoreColor(jobResults.overall_score)}`}>
                {jobResults.overall_score}
              </div>
              <div className="text-gray-600">out of 100</div>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-lg">Job Match</CardTitle>
              <div className={`text-4xl font-bold ${getScoreColor(jobResults.match_percentage)}`}>
                {jobResults.match_percentage}%
              </div>
              <div className="text-gray-600">compatibility</div>
            </CardHeader>
          </Card>
        </div>

        {/* Missing Keywords */}
        {jobResults.missing_keywords.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-orange-600">
                <AlertCircle className="w-5 h-5 mr-2" />
                Missing Keywords
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {jobResults.missing_keywords.map((keyword, index) => (
                  <Badge key={index} variant="secondary" className="bg-orange-100 text-orange-800">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Category Scores */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Category Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(jobResults.category_scores).map(([key, score]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{atsService.formatCategoryName(key)}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          score >= 80 ? 'bg-green-500' :
                          score >= 65 ? 'bg-blue-500' :
                          score >= 45 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${score}%` }}
                      />
                    </div>
                    <span className={`text-sm font-semibold ${getScoreColor(score)}`}>
                      {score}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Strengths, Weaknesses, Recommendations - similar to standard results */}
        {jobResults.strengths.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-green-600">
                <CheckCircle className="w-5 h-5 mr-2" />
                Strengths
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {jobResults.strengths.map((strength, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-1 mr-2 flex-shrink-0" />
                    <span className="text-sm">{strength}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {jobResults.weaknesses.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-red-600">
                <XCircle className="w-5 h-5 mr-2" />
                Areas for Improvement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {jobResults.weaknesses.map((weakness, index) => (
                  <li key={index} className="flex items-start">
                    <XCircle className="w-4 h-4 text-red-500 mt-1 mr-2 flex-shrink-0" />
                    <span className="text-sm">{weakness}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {jobResults.recommendations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-blue-600">
                <TrendingUp className="w-5 h-5 mr-2" />
                Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {jobResults.recommendations.map((recommendation, index) => (
                  <li key={index} className="flex items-start">
                    <TrendingUp className="w-4 h-4 text-blue-500 mt-1 mr-2 flex-shrink-0" />
                    <span className="text-sm">{recommendation}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            ATS Resume Score
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Get instant feedback on your resume's ATS compatibility. Upload your resume and receive a detailed analysis with actionable recommendations.
          </p>
        </motion.div>

        {/* Analysis Type Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex justify-center space-x-4">
            <Button
              variant={analysisType === 'standard' ? 'default' : 'outline'}
              onClick={() => setAnalysisType('standard')}
              className="flex items-center"
            >
              <FileText className="w-4 h-4 mr-2" />
              Standard Analysis
            </Button>
            <Button
              variant={analysisType === 'job-specific' ? 'default' : 'outline'}
              onClick={() => setAnalysisType('job-specific')}
              className="flex items-center"
            >
              <Target className="w-4 h-4 mr-2" />
              Job-Specific Analysis
            </Button>
          </div>
        </motion.div>

        {/* Upload Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <Card>
            <CardHeader>
              <CardTitle>Upload Your Resume</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <div className="space-y-2">
                  <p className="text-lg font-medium text-gray-700">
                    {selectedFile ? selectedFile.name : 'Drop your resume here or click to browse'}
                  </p>
                  <p className="text-sm text-gray-500">
                    Supports PDF, DOCX, and TXT files (max 10MB)
                  </p>
                </div>
                <input
                  type="file"
                  accept=".pdf,.docx,.txt"
                  onChange={(e) => handleFileChange(e.target.files)}
                  className="hidden"
                  id="resume-upload"
                />
                <label htmlFor="resume-upload">
                  <Button variant="outline" className="mt-4" asChild>
                    <span className="cursor-pointer">Choose File</span>
                  </Button>
                </label>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Job Description Input (for job-specific analysis) */}
        {analysisType === 'job-specific' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-8"
          >
            <Card>
              <CardHeader>
                <CardTitle>Job Description</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Input Type Selection */}
                <div className="flex space-x-4">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="jdInputType"
                      value="text"
                      checked={jdInputType === 'text'}
                      onChange={(e) => {
                        setJdInputType('text');
                        setJobDescriptionFile(null);
                      }}
                      className="text-blue-600"
                    />
                    <span>Paste job description text</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="jdInputType"
                      value="file"
                      checked={jdInputType === 'file'}
                      onChange={(e) => {
                        setJdInputType('file');
                        setJobDescription('');
                      }}
                      className="text-blue-600"
                    />
                    <span>Upload job description file</span>
                  </label>
                </div>

                {/* Text Input */}
                {jdInputType === 'text' && (
                  <Textarea
                    placeholder="Paste the job description here to analyze how well your resume matches the specific role..."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    className="min-h-[150px]"
                  />
                )}

                {/* File Input */}
                {jdInputType === 'file' && (
                  <div
                    className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                      jdDragActive 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onDrop={handleJdDrop}
                    onDragOver={handleJdDragOver}
                    onDragLeave={handleJdDragLeave}
                  >
                    <FileText className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-700">
                        {jobDescriptionFile ? jobDescriptionFile.name : 'Drop job description file here or click to browse'}
                      </p>
                      <p className="text-xs text-gray-500">
                        Supports PDF, DOCX, and TXT files (max 10MB)
                      </p>
                    </div>
                    <input
                      type="file"
                      accept=".pdf,.docx,.txt"
                      onChange={(e) => handleJdFileChange(e.target.files)}
                      className="hidden"
                      id="jd-upload"
                    />
                    <label htmlFor="jd-upload">
                      <Button variant="outline" size="sm" className="mt-3" asChild>
                        <span className="cursor-pointer">Choose File</span>
                      </Button>
                    </label>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Analyze Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mb-8"
        >
          <Button
            onClick={analyzeResume}
            disabled={
              !selectedFile || 
              isAnalyzing || 
              (analysisType === 'job-specific' && jdInputType === 'text' && !jobDescription.trim()) ||
              (analysisType === 'job-specific' && jdInputType === 'file' && !jobDescriptionFile)
            }
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            {isAnalyzing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Analyzing Resume...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Analyze Resume
              </>
            )}
          </Button>
        </motion.div>

        {/* Results */}
        {analysisType === 'standard' && standardResults && renderStandardResults()}
        {analysisType === 'job-specific' && jobResults && renderJobResults()}
      </div>
    </div>
  );
};

export default ATSScorePage;
