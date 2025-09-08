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
import PDFViewer, { type ATSIssue } from '@/components/ui/pdf-viewer';

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

  // Convert ATS analysis results to visual issues for highlighting
  const convertToATSIssues = (results: ATSAnalysisResult | JDSpecificATSResult): ATSIssue[] => {
    const issues: ATSIssue[] = [];
    
    // Add issues based on weaknesses
    results.weaknesses.forEach(weakness => {
      let type: ATSIssue['type'] = 'formatting_issue';
      let severity: ATSIssue['severity'] = 'medium';
      
      // Determine issue type and severity based on weakness content
      if (weakness.toLowerCase().includes('name') || weakness.toLowerCase().includes('first') || weakness.toLowerCase().includes('last')) {
        type = 'contact_issue';
        severity = 'high';
      } else if (weakness.toLowerCase().includes('keyword') || weakness.toLowerCase().includes('skills')) {
        type = 'missing_keyword';
        severity = 'high';
      } else if (weakness.toLowerCase().includes('contact') || weakness.toLowerCase().includes('email') || weakness.toLowerCase().includes('phone')) {
        type = 'contact_issue';
        severity = 'high';
      } else if (weakness.toLowerCase().includes('format') || weakness.toLowerCase().includes('structure')) {
        type = 'formatting_issue';
        severity = 'medium';
      } else if (weakness.toLowerCase().includes('section') || weakness.toLowerCase().includes('missing')) {
        type = 'section_missing';
        severity = 'medium';
      } else if (weakness.toLowerCase().includes('achievement') || weakness.toLowerCase().includes('metric')) {
        type = 'achievement_missing';
        severity = 'medium';
      } else if (weakness.toLowerCase().includes('grammar') || weakness.toLowerCase().includes('spelling')) {
        type = 'grammar_error';
        severity = 'low';
      }
      
      issues.push({
        text: weakness.split(' ').slice(0, 3).join(' '), // First few words for highlighting
        type,
        severity,
        description: weakness,
        suggestion: results.recommendations.find(rec => 
          rec.toLowerCase().includes(weakness.split(' ')[0].toLowerCase())
        )
      });
    });
    
    // Add missing keywords for JD-specific analysis
    if ('missing_keywords' in results && results.missing_keywords) {
      results.missing_keywords.forEach(keyword => {
        issues.push({
          text: keyword,
          type: 'missing_keyword',
          severity: 'high',
          description: `Missing important keyword: "${keyword}"`,
          suggestion: `Consider adding "${keyword}" to relevant sections of your resume`
        });
      });
    }
    
    return issues;
  };

  // Extract name-related issues and suggestions
  const extractNameIssues = (results: ATSAnalysisResult | JDSpecificATSResult) => {
    const nameIssues: { type: string; description: string; suggestion: string; severity: 'high' | 'medium' | 'low'; details?: string }[] = [];
    
    // Check weaknesses for name-related issues with enhanced detection
    results.weaknesses.forEach(weakness => {
      const lowerWeakness = weakness.toLowerCase();
      
      // Enhanced detection for the specific text patterns the backend will generate
      if (lowerWeakness.includes('critical:') || lowerWeakness.includes('name') || 
          lowerWeakness.includes('first') || lowerWeakness.includes('last') ||
          lowerWeakness.includes('email') || lowerWeakness.includes('phone')) {
        
        let type = 'Name Issue';
        let suggestion = '';
        let severity: 'high' | 'medium' | 'low' = 'high';
        let details = '';
        
        // Check for specific backend-generated patterns and extract detailed explanations
        if (lowerWeakness.includes('critical: first name is missing')) {
          type = 'First Name Missing';
          suggestion = 'Add your first name prominently at the top of your resume header, ensuring it\'s clearly visible and matches your official documents';
          details = 'ATS systems require complete identification for candidate tracking and database management. Without your first name, recruiters cannot properly identify you in their systems.';
        } else if (lowerWeakness.includes('critical: last name is missing')) {
          type = 'Last Name Missing';
          suggestion = 'Include your last name alongside your first name in the resume header, using standard formatting like \'John Smith\' or \'SMITH, John\'';
          details = 'ATS systems need full name for proper candidate identification and search functionality. Your last name is crucial for database searches and candidate matching.';
        } else if (lowerWeakness.includes('critical: complete name') || lowerWeakness.includes('critical: first and last')) {
          type = 'Complete Name Missing';
          suggestion = 'Place your complete name (first and last) at the very top of your resume in a large, bold font (16-18pt) to ensure ATS systems can easily identify you';
          details = 'ATS systems cannot properly categorize or search for candidates without full names. This is a fundamental requirement for all resume submissions.';
        } else if (lowerWeakness.includes('critical: email address is missing')) {
          type = 'Email Missing';
          suggestion = 'Add your professional email address in the header section below your name, using standard formats like \'john.smith@email.com\'';
          details = 'Recruiters need email for direct communication and interview scheduling. Without an email, you may miss important opportunities.';
        } else if (lowerWeakness.includes('critical: phone number is missing')) {
          type = 'Phone Missing';
          suggestion = 'Add your phone number in the header section below your name, using standard formats like \'(555) 123-4567\'';
          details = 'Phone contact is essential for urgent communication and interview coordination. Recruiters often prefer calling for immediate responses.';
        } else if (lowerWeakness.includes('first name') && lowerWeakness.includes('last name')) {
          type = 'Complete Name Missing';
          suggestion = 'Add your complete name (first and last) prominently at the top of your resume';
          details = 'Both first and last names are required for proper ATS identification and candidate tracking.';
        } else if (lowerWeakness.includes('first name')) {
          type = 'First Name Missing';
          suggestion = 'Add your first name prominently at the top of your resume header, ensuring it\'s clearly visible and matches your official documents';
          details = 'Your first name is essential for personal identification and helps recruiters connect with you personally.';
        } else if (lowerWeakness.includes('last name')) {
          type = 'Last Name Missing';
          suggestion = 'Include your last name alongside your first name in the resume header, using standard formatting like \'John Smith\' or \'SMITH, John\'';
          details = 'Your last name is crucial for database searches and helps distinguish you from other candidates with similar first names.';
        } else if (lowerWeakness.includes('name')) {
          type = 'Name Incomplete';
          suggestion = 'Ensure your full name (first and last) is clearly visible at the top of your resume';
          details = 'Complete name identification is fundamental for ATS systems and professional presentation.';
        } else if (lowerWeakness.includes('email')) {
          type = 'Contact Issue';
          suggestion = 'Add your professional email address in the header section below your name, using standard formats like \'john.smith@email.com\'';
          details = 'Professional email communication is the primary method for job-related correspondence.';
        } else if (lowerWeakness.includes('phone')) {
          type = 'Contact Issue';
          suggestion = 'Add your phone number in the header section below your name, using standard formats like \'(555) 123-4567\'';
          details = 'Phone contact provides immediate access for urgent communications and interview scheduling.';
        }
        
        nameIssues.push({
          type,
          description: weakness,
          suggestion: suggestion || 'Ensure your complete name and contact information are prominently displayed',
          severity,
          details: details || 'This information is essential for ATS systems and recruiter communication.'
        });
      }
    });
    
    // Check recommendations for name-related suggestions
    results.recommendations.forEach(recommendation => {
      const lowerRec = recommendation.toLowerCase();
      
      if ((lowerRec.includes('name') || lowerRec.includes('email') || lowerRec.includes('phone')) && 
          !nameIssues.some(issue => issue.description === recommendation)) {
        
        let type = 'Name Improvement';
        let severity: 'high' | 'medium' | 'low' = 'medium';
        let details = 'Following this recommendation will improve your resume\'s ATS compatibility and professional presentation.';
        
        if (lowerRec.includes('critical') || lowerRec.includes('missing')) {
          severity = 'high';
          details = 'This is a critical requirement that must be addressed for your resume to be properly processed by ATS systems.';
        }
        
        nameIssues.push({
          type,
          description: recommendation,
          suggestion: 'Follow this recommendation to improve your resume\'s ATS compatibility',
          severity,
          details
        });
      }
    });
    
    return nameIssues;
  };

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

      // Parse resume first to get structured data
      console.log('Starting resume parsing...');
      const parseResponse = await atsService.parseResume(selectedFile);
      let parsedResumeData = null;
      
      console.log('Parse response:', parseResponse);
      
      if (parseResponse.success && parseResponse.data) {
        parsedResumeData = parseResponse.data;
        console.log('Resume parsed successfully:', parsedResumeData);
      } else {
        console.error('Resume parsing failed:', parseResponse.error);
        toast({
          title: 'Resume Parsing Warning',
          description: 'Could not parse resume for suggestions. Apply Suggestions will be disabled.',
          variant: 'destructive'
        } as any);
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
              originalFile: selectedFile,
              parsedResumeData: parsedResumeData
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
              parsedResumeData: parsedResumeData,
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
    const atsIssues = convertToATSIssues(standardResults);

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        {/* PDF Preview with ATS Highlighting */}
        {selectedFile && selectedFile.type === 'application/pdf' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Resume Preview with ATS Issues
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PDFViewer 
                file={selectedFile}
                atsIssues={atsIssues}
                showATSHighlights={true}
                onIssueClick={(issue) => {
                  toast({
                    title: issue.type.replace(/_/g, ' ').toUpperCase(),
                    description: issue.suggestion || issue.description,
                    variant: issue.severity === 'high' ? 'destructive' : 'default'
                  } as any);
                }}
                className="max-w-full"
              />
            </CardContent>
          </Card>
        )}
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
              {/* Standard Category Scores */}
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
              
              {/* Name & Contact Issues as Categories */}
              {(() => {
                const nameIssues = extractNameIssues(standardResults);
                if (nameIssues.length > 0) {
                  return nameIssues.map((issue, index) => {
                    // Calculate a score based on severity
                    let issueScore = 0;
                    if (issue.severity === 'high') issueScore = 20;
                    else if (issue.severity === 'medium') issueScore = 40;
                    else issueScore = 60;
                    
                    return (
                      <div key={`name-issue-${index}`} className="flex items-center justify-between border-l-4 border-orange-400 pl-3 bg-orange-50 rounded-r">
                        <div className="flex items-center space-x-2">
                          <AlertCircle className="w-4 h-4 text-orange-600" />
                          <span className="text-sm font-medium text-orange-800">
                            {issue.type}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                issueScore >= 60 ? 'bg-green-500' :
                                issueScore >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${issueScore}%` }}
                            />
                          </div>
                          <span className={`text-sm font-semibold ${
                            issueScore >= 60 ? 'text-green-600' :
                            issueScore >= 40 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {issueScore}
                          </span>
                        </div>
                      </div>
                    );
                  });
                }
                return null;
              })()}
            </div>
          </CardContent>
        </Card>

        {/* Name Suggestions */}
        {(() => {
          const nameIssues = extractNameIssues(standardResults);
          if (nameIssues.length > 0) {
            return (
              <Card className="border-orange-200 bg-orange-50">
                <CardHeader>
                  <CardTitle className="flex items-center text-orange-700">
                    <AlertCircle className="w-5 h-5 mr-2" />
                    Name & Contact Issues
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {nameIssues.map((issue, index) => (
                      <div key={index} className="p-3 bg-white rounded-lg border border-orange-200">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className={`font-medium text-sm ${
                              issue.severity === 'high' ? 'text-red-700' : 
                              issue.severity === 'medium' ? 'text-orange-700' : 'text-blue-700'
                            }`}>
                              {issue.type}
                            </h4>
                            <p className="text-sm text-gray-700 mt-1">{issue.description}</p>
                            
                            {/* Detailed Improvement Steps */}
                            <div className="mt-3 space-y-2">
                              <div className="p-2 bg-blue-50 rounded border-l-4 border-blue-400">
                                <p className="text-sm text-blue-800 font-medium">💡 Action Required:</p>
                                <p className="text-sm text-blue-700 mt-1">{issue.suggestion}</p>
                              </div>
                              
                              {issue.details && (
                                <div className="p-2 bg-gray-50 rounded border-l-4 border-gray-400">
                                  <p className="text-sm text-gray-800 font-medium">ℹ️ Why This Matters:</p>
                                  <p className="text-sm text-gray-700 mt-1">{issue.details}</p>
                                </div>
                              )}
                            </div>
                          </div>
                          <Badge 
                            variant={issue.severity === 'high' ? 'destructive' : 'secondary'} 
                            className="ml-2 flex-shrink-0"
                          >
                            {issue.severity === 'high' ? 'Critical' : 
                             issue.severity === 'medium' ? 'Important' : 'Minor'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          }
          return null;
        })()}

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
              <div className="space-y-3">
                {standardResults.weaknesses.map((weakness, index) => (
                  <div key={index} className="p-3 bg-red-50 rounded-lg border border-red-200">
                    <div className="flex items-start">
                      <XCircle className="w-4 h-4 text-red-500 mt-1 mr-3 flex-shrink-0" />
                      <div className="flex-1">
                        <h4 className="text-sm text-red-800 font-medium mb-2">Issue #{index + 1}</h4>
                        <p className="text-sm text-red-700 mb-3">{weakness}</p>
                        
                        {/* Detailed Improvement Steps */}
                        <div className="space-y-2">
                          <div className="p-2 bg-white rounded border-l-4 border-red-400">
                            <p className="text-sm text-red-700 font-medium">🔧 What Needs to Be Fixed:</p>
                            <p className="text-sm text-red-600 mt-1">
                              {weakness.toLowerCase().includes('keyword') ? 
                                'Your resume lacks relevant industry keywords and skills that ATS systems look for when matching candidates to job requirements.' :
                                weakness.toLowerCase().includes('achievement') || weakness.toLowerCase().includes('metric') ?
                                'Your resume bullet points lack specific numbers, percentages, and measurable outcomes that demonstrate your impact and value.' :
                                weakness.toLowerCase().includes('section') || weakness.toLowerCase().includes('missing') ?
                                'Essential resume sections are either missing or incomplete, making it difficult for ATS systems to categorize your information properly.' :
                                weakness.toLowerCase().includes('format') || weakness.toLowerCase().includes('structure') ?
                                'Your resume formatting is inconsistent or difficult to read, which can cause ATS parsing errors and reduce readability for human recruiters.' :
                                weakness.toLowerCase().includes('grammar') || weakness.toLowerCase().includes('spelling') ?
                                'Your resume contains language errors that can negatively impact your professional image and ATS scoring.' :
                                'This area of your resume needs attention to improve overall ATS compatibility and professional presentation.'
                              }
                            </p>
                          </div>
                          
                          <div className="p-2 bg-blue-50 rounded border-l-4 border-blue-400">
                            <p className="text-sm text-blue-700 font-medium">📍 Where to Make Changes:</p>
                            <p className="text-sm text-blue-600 mt-1">
                              {weakness.toLowerCase().includes('keyword') ? 
                                'Add keywords throughout your resume: in the summary section, work experience bullet points, skills section, and any relevant project descriptions.' :
                                weakness.toLowerCase().includes('achievement') || weakness.toLowerCase().includes('metric') ?
                                'Focus on your work experience section - rewrite bullet points to include specific numbers, percentages, and quantifiable results.' :
                                weakness.toLowerCase().includes('section') || weakness.toLowerCase().includes('missing') ?
                                'Review your entire resume structure and ensure you have: Header (name/contact), Summary, Experience, Education, Skills, and any relevant additional sections.' :
                                weakness.toLowerCase().includes('format') || weakness.toLowerCase().includes('structure') ?
                                'Apply consistent formatting across all sections: use the same font, spacing, bullet point style, and heading hierarchy throughout.' :
                                weakness.toLowerCase().includes('grammar') || weakness.toLowerCase().includes('spelling') ?
                                'Review your entire resume content, paying special attention to bullet points, job titles, and descriptions for language accuracy.' :
                                'Review the specific area mentioned in the issue and apply the necessary improvements.'
                              }
                            </p>
                          </div>
                          
                          <div className="p-2 bg-green-50 rounded border-l-4 border-green-400">
                            <p className="text-sm text-green-700 font-medium">✅ How to Implement:</p>
                            <p className="text-sm text-green-600 mt-1">
                              {weakness.toLowerCase().includes('keyword') ? 
                                'Research industry-specific keywords from job descriptions, company websites, and professional resources. Naturally incorporate these terms into your content without keyword stuffing.' :
                                weakness.toLowerCase().includes('achievement') || weakness.toLowerCase().includes('metric') ?
                                'Use the STAR method: Situation, Task, Action, Result. Include specific numbers like "increased sales by 25%", "managed team of 15 people", "reduced costs by $50K".' :
                                weakness.toLowerCase().includes('section') || weakness.toLowerCase().includes('missing') ?
                                'Create a clear section hierarchy with consistent formatting. Use standard section headings like "Professional Experience", "Education", "Technical Skills" that ATS systems recognize.' :
                                weakness.toLowerCase().includes('format') || weakness.toLowerCase().includes('structure') ?
                                'Use a clean, professional template with consistent margins (0.5-1 inch), readable fonts (Arial, Calibri, Times New Roman), and clear section breaks with adequate spacing.' :
                                weakness.toLowerCase().includes('grammar') || weakness.toLowerCase().includes('spelling') ?
                                'Use spell-check tools, read your resume aloud, have someone else review it, and ensure consistent verb tense throughout (use past tense for completed jobs, present tense for current role).' :
                                'Follow the specific guidance provided and implement the improvements systematically.'
                              }
                            </p>
                          </div>
                          
                          <div className="p-2 bg-purple-50 rounded border-l-4 border-purple-400">
                            <p className="text-sm text-purple-700 font-medium">💡 Why This Matters:</p>
                            <p className="text-sm text-purple-600 mt-1">
                              {weakness.toLowerCase().includes('keyword') ? 
                                'ATS systems scan for relevant keywords to match candidates to job requirements. Missing keywords can cause your resume to be filtered out before human review.' :
                                weakness.toLowerCase().includes('achievement') || weakness.toLowerCase().includes('metric') ?
                                'Quantified achievements demonstrate your value and impact to employers. They make your resume more compelling and help ATS systems understand your capabilities.' :
                                weakness.toLowerCase().includes('section') || weakness.toLowerCase().includes('missing') ?
                                'ATS systems expect standard resume sections to properly categorize and parse your information. Missing sections can cause parsing errors and reduce your score.' :
                                weakness.toLowerCase().includes('format') || weakness.toLowerCase().includes('structure') ?
                                'Poor formatting can cause ATS parsing errors, making your information unreadable to recruiters. Clean formatting ensures your content is properly extracted and displayed.' :
                                weakness.toLowerCase().includes('grammar') || weakness.toLowerCase().includes('spelling') ?
                                'Language errors can create a negative impression and suggest lack of attention to detail. They can also cause ATS parsing issues and reduce your professional credibility.' :
                                'Addressing this issue will improve your overall ATS score and increase your chances of passing through automated screening systems.'
                              }
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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
              <div className="space-y-3">
                {standardResults.recommendations.map((recommendation, index) => (
                  <div key={index} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-start">
                      <TrendingUp className="w-4 h-4 text-blue-500 mt-1 mr-3 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm text-blue-800 font-medium">{recommendation}</p>
                        <div className="mt-2 p-2 bg-white rounded border-l-4 border-blue-400">
                          <p className="text-sm text-blue-700 font-medium">✅ Implementation Steps:</p>
                          <p className="text-sm text-blue-600 mt-1">
                            {recommendation.toLowerCase().includes('keyword') ? 
                              'Research job-specific keywords, review the job description thoroughly, and naturally incorporate relevant terms throughout your resume.' :
                              recommendation.toLowerCase().includes('achievement') ? 
                              'Review your work history, identify quantifiable results relevant to the target role, and rewrite bullet points with specific numbers.' :
                              recommendation.toLowerCase().includes('section') ? 
                              'Organize your resume into clear sections with consistent formatting, ensuring all relevant information is properly categorized.' :
                              recommendation.toLowerCase().includes('format') ? 
                              'Use consistent fonts, spacing, and layout. Consider using resume templates designed for ATS compatibility.' :
                              'Follow this recommendation step-by-step to improve your resume\'s effectiveness and ATS compatibility.'
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </motion.div>
    );
  };

  const renderJobResults = () => {
    if (!jobResults) return null;

    const atsIssues = convertToATSIssues(jobResults);

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        {/* PDF Preview with ATS Highlighting */}
        {selectedFile && selectedFile.type === 'application/pdf' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Resume Preview with Job-Specific Issues
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PDFViewer 
                file={selectedFile}
                atsIssues={atsIssues}
                showATSHighlights={true}
                onIssueClick={(issue) => {
                  toast({
                    title: issue.type.replace(/_/g, ' ').toUpperCase(),
                    description: issue.suggestion || issue.description,
                    variant: issue.severity === 'high' ? 'destructive' : 'default'
                  } as any);
                }}
                className="max-w-full"
              />
            </CardContent>
          </Card>
        )}
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

        {/* Name Suggestions */}
        {(() => {
          const nameIssues = extractNameIssues(jobResults);
          if (nameIssues.length > 0) {
            return (
              <Card className="border-orange-200 bg-orange-50">
                <CardHeader>
                  <CardTitle className="flex items-center text-orange-700">
                    <AlertCircle className="w-5 h-5 mr-2" />
                    Name & Contact Issues
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {nameIssues.map((issue, index) => (
                      <div key={index} className="p-3 bg-white rounded-lg border border-orange-200">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className={`font-medium text-sm ${
                              issue.severity === 'high' ? 'text-red-700' : 
                              issue.severity === 'medium' ? 'text-orange-700' : 'text-blue-700'
                            }`}>
                              {issue.type}
                            </h4>
                            <p className="text-sm text-gray-700 mt-1">{issue.description}</p>
                            
                            {/* Detailed Improvement Steps */}
                            <div className="mt-3 space-y-2">
                              <div className="p-2 bg-blue-50 rounded border-l-4 border-blue-400">
                                <p className="text-sm text-blue-800 font-medium">💡 Action Required:</p>
                                <p className="text-sm text-blue-700 mt-1">{issue.suggestion}</p>
                              </div>
                              
                              {issue.details && (
                                <div className="p-2 bg-gray-50 rounded border-l-4 border-gray-400">
                                  <p className="text-sm text-gray-800 font-medium">ℹ️ Why This Matters:</p>
                                  <p className="text-sm text-gray-700 mt-1">{issue.details}</p>
                                </div>
                              )}
                            </div>
                          </div>
                          <Badge 
                            variant={issue.severity === 'high' ? 'destructive' : 'secondary'} 
                            className="ml-2 flex-shrink-0"
                          >
                            {issue.severity === 'high' ? 'Critical' : 
                             issue.severity === 'medium' ? 'Important' : 'Minor'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          }
          return null;
        })()}

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
              {/* Standard Category Scores */}
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
              
              {/* Name & Contact Issues as Categories */}
              {(() => {
                const nameIssues = extractNameIssues(jobResults);
                if (nameIssues.length > 0) {
                  return nameIssues.map((issue, index) => {
                    // Calculate a score based on severity
                    let issueScore = 0;
                    if (issue.severity === 'high') issueScore = 20;
                    else if (issue.severity === 'medium') issueScore = 40;
                    else issueScore = 60;
                    
                    return (
                      <div key={`name-issue-${index}`} className="flex items-center justify-between border-l-4 border-orange-400 pl-3 bg-orange-50 rounded-r">
                        <div className="flex items-center space-x-2">
                          <AlertCircle className="w-4 h-4 text-orange-600" />
                          <span className="text-sm font-medium text-orange-800">
                            {issue.type}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                issueScore >= 60 ? 'bg-green-500' :
                                issueScore >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${issueScore}%` }}
                            />
                          </div>
                          <span className={`text-sm font-semibold ${
                            issueScore >= 60 ? 'text-green-600' :
                            issueScore >= 40 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {issueScore}
                          </span>
                        </div>
                      </div>
                    );
                  });
                }
                return null;
              })()}
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
              <div className="space-y-3">
                {jobResults.weaknesses.map((weakness, index) => (
                  <div key={index} className="p-3 bg-red-50 rounded-lg border border-red-200">
                    <div className="flex items-start">
                      <XCircle className="w-4 h-4 text-red-500 mt-1 mr-3 flex-shrink-0" />
                      <div className="flex-1">
                        <h4 className="text-sm text-red-800 font-medium mb-2">Issue #{index + 1}</h4>
                        <p className="text-sm text-red-700 mb-3">{weakness}</p>
                        
                        {/* Detailed Improvement Steps */}
                        <div className="space-y-2">
                          <div className="p-2 bg-white rounded border-l-4 border-red-400">
                            <p className="text-sm text-red-700 font-medium">🔧 What Needs to Be Fixed:</p>
                            <p className="text-sm text-red-600 mt-1">
                              {weakness.toLowerCase().includes('keyword') ? 
                                'Your resume lacks relevant keywords from the job description that ATS systems use to match candidates to this specific role.' :
                                weakness.toLowerCase().includes('achievement') || weakness.toLowerCase().includes('metric') ?
                                'Your resume bullet points lack specific numbers, percentages, and measurable outcomes that demonstrate your impact and value to this role.' :
                                weakness.toLowerCase().includes('section') || weakness.toLowerCase().includes('missing') ?
                                'Essential resume sections are either missing or incomplete, making it difficult for ATS systems to categorize your information for this specific job.' :
                                weakness.toLowerCase().includes('format') || weakness.toLowerCase().includes('structure') ?
                                'Your resume formatting is inconsistent or difficult to read, which can cause ATS parsing errors and reduce your chances of being selected for this role.' :
                                weakness.toLowerCase().includes('experience') || weakness.toLowerCase().includes('relevance') ?
                                'Your work experience descriptions don\'t clearly align with the specific requirements and responsibilities outlined in this job description.' :
                                'This area of your resume needs attention to improve your match with the target job requirements and increase your chances of being selected.'
                              }
                            </p>
                          </div>
                          
                          <div className="p-2 bg-blue-50 rounded border-l-4 border-blue-400">
                            <p className="text-sm text-blue-700 font-medium">📍 Where to Make Changes:</p>
                            <p className="text-sm text-blue-600 mt-1">
                              {weakness.toLowerCase().includes('keyword') ? 
                                'Add job-specific keywords throughout your resume: in the summary section, work experience bullet points, skills section, and any relevant project descriptions that match the job requirements.' :
                                weakness.toLowerCase().includes('achievement') || weakness.toLowerCase().includes('metric') ?
                                'Focus on your work experience section - rewrite bullet points to include specific numbers, percentages, and quantifiable results that relate to the target role requirements.' :
                                weakness.toLowerCase().includes('section') || weakness.toLowerCase().includes('missing') ?
                                'Review your entire resume structure and ensure you have: Header (name/contact), Summary, Experience, Education, Skills, and any relevant additional sections that showcase your fit for this role.' :
                                weakness.toLowerCase().includes('format') || weakness.toLowerCase().includes('structure') ?
                                'Apply consistent formatting across all sections: use the same font, spacing, bullet point style, and heading hierarchy throughout to ensure ATS compatibility for this specific application.' :
                                weakness.toLowerCase().includes('experience') || weakness.toLowerCase().includes('relevance') ?
                                'Tailor your experience descriptions to highlight skills and achievements that directly relate to the job requirements and company needs for this specific position.' :
                                'Review the specific area mentioned in the issue and apply the necessary improvements to better align with the target job requirements.'
                              }
                            </p>
                          </div>
                          
                          <div className="p-2 bg-green-50 rounded border-l-4 border-green-400">
                            <p className="text-sm text-green-700 font-medium">✅ How to Implement:</p>
                            <p className="text-sm text-green-600 mt-1">
                              {weakness.toLowerCase().includes('keyword') ? 
                                'Research the specific job description thoroughly, identify key terms and skills mentioned, and naturally incorporate these keywords into your resume content without keyword stuffing.' :
                                weakness.toLowerCase().includes('achievement') || weakness.toLowerCase().includes('metric') ?
                                'Use the STAR method: Situation, Task, Action, Result. Include specific numbers like "increased sales by 25%", "managed team of 15 people", "reduced costs by $50K" that relate to the job requirements.' :
                                weakness.toLowerCase().includes('section') || weakness.toLowerCase().includes('missing') ?
                                'Create a clear section hierarchy with consistent formatting. Use standard section headings like "Professional Experience", "Education", "Technical Skills" that ATS systems recognize and that highlight your fit for this role.' :
                                weakness.toLowerCase().includes('format') || weakness.toLowerCase().includes('structure') ? 
                                'Use a clean, professional template with consistent margins (0.5-1 inch), readable fonts (Arial, Calibri, Times New Roman), and clear section breaks with adequate spacing for optimal ATS parsing.' :
                                weakness.toLowerCase().includes('experience') ? 
                                'Review your work history, identify experiences that directly relate to the job requirements, and rewrite descriptions to emphasize relevant skills and achievements for this specific position.' :
                                'Follow the specific guidance provided and implement the improvements systematically to better match the target job requirements.'
                              }
                            </p>
                          </div>
                          
                          <div className="p-2 bg-purple-50 rounded border-l-4 border-purple-400">
                            <p className="text-sm text-purple-700 font-medium">💡 Why This Matters:</p>
                            <p className="text-sm text-purple-600 mt-1">
                              {weakness.toLowerCase().includes('keyword') ? 
                                'ATS systems scan for relevant keywords from the job description to match candidates to this specific role. Missing keywords can cause your resume to be filtered out before human review.' :
                                weakness.toLowerCase().includes('achievement') || weakness.toLowerCase().includes('metric') ?
                                'Quantified achievements demonstrate your value and impact to employers. They make your resume more compelling and help ATS systems understand your capabilities for this specific role.' :
                                weakness.toLowerCase().includes('section') || weakness.toLowerCase().includes('missing') ?
                                'ATS systems expect standard resume sections to properly categorize and parse your information. Missing sections can cause parsing errors and reduce your score for this specific job application.' :
                                weakness.toLowerCase().includes('format') || weakness.toLowerCase().includes('structure') ?
                                'Poor formatting can cause ATS parsing errors, making your information unreadable to recruiters. Clean formatting ensures your content is properly extracted and displayed for this specific job evaluation.' :
                                weakness.toLowerCase().includes('experience') || weakness.toLowerCase().includes('relevance') ?
                                'Relevant experience alignment is crucial for job-specific applications. Recruiters need to see how your background directly relates to the role requirements to consider you as a strong candidate.' :
                                'Addressing this issue will improve your job match percentage and increase your chances of being selected for this specific position.'
                              }
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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
              <div className="space-y-3">
                {jobResults.recommendations.map((recommendation, index) => (
                  <div key={index} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-start">
                      <TrendingUp className="w-4 h-4 text-blue-500 mt-1 mr-3 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm text-blue-800 font-medium">{recommendation}</p>
                        <div className="mt-2 p-2 bg-white rounded border-l-4 border-blue-400">
                          <p className="text-sm text-blue-700 font-medium">✅ Implementation Steps:</p>
                          <p className="text-sm text-blue-600 mt-1">
                            {recommendation.toLowerCase().includes('keyword') ? 
                              'Research job-specific keywords, review the job description thoroughly, and naturally incorporate relevant terms throughout your resume.' :
                              recommendation.toLowerCase().includes('achievement') ? 
                              'Review your work history, identify quantifiable results relevant to the target role, and rewrite bullet points with specific numbers.' :
                              recommendation.toLowerCase().includes('section') ? 
                              'Organize your resume into clear sections with consistent formatting, prioritizing sections most relevant to the target position.' :
                              recommendation.toLowerCase().includes('format') ? 
                              'Use consistent fonts, spacing, and layout. Consider using resume templates designed for ATS compatibility and job-specific optimization.' :
                              recommendation.toLowerCase().includes('experience') ? 
                              'Tailor your experience descriptions to highlight skills and achievements that directly relate to the job requirements and company needs.' :
                              'Follow this recommendation step-by-step to improve your resume\'s effectiveness and better match the target job requirements.'
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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

        {/* ATS Requirements Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8"
        >
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center text-blue-800">
                <AlertCircle className="w-5 h-5 mr-2" />
                ATS Requirements Checklist
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="font-medium">Complete Name</span>
                  </div>
                  <p className="text-blue-700 ml-6">Must include first AND last name</p>
                  
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="font-medium">Contact Information</span>
                  </div>
                  <p className="text-blue-700 ml-6">Email OR phone number required</p>
                  
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="font-medium">Standard Sections</span>
                  </div>
                  <p className="text-blue-700 ml-6">Experience, Education, Skills clearly defined</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="font-medium">Keywords</span>
                  </div>
                  <p className="text-blue-700 ml-6">Relevant industry terms and skills</p>
                  
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="font-medium">Formatting</span>
                  </div>
                  <p className="text-blue-700 ml-6">Clean, readable structure</p>
                  
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="font-medium">Achievements</span>
                  </div>
                  <p className="text-blue-700 ml-6">Quantified results and metrics</p>
                </div>
              </div>
            </CardContent>
          </Card>
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
                      onChange={() => {
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
                      onChange={() => {
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
