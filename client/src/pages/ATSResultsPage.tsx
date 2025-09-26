import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Download,
  RotateCcw,
  Wand2,
  Loader2
} from 'lucide-react';
import PDFViewer from '@/components/ui/pdf-viewer';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { atsService } from '@/services/atsService';
import type { ATSAnalysisResult, JDSpecificATSResult } from '@/services/atsService';


interface LocationState {
  results: ATSAnalysisResult | JDSpecificATSResult;
  analysisType: 'standard' | 'job-specific';
  fileName: string;
  fileContent?: string;
  originalFile: File;
  parsedResumeData?: any;
}

const ATSResultsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeSection, setActiveSection] = useState<string>('');
  const [isApplyingSuggestions, setIsApplyingSuggestions] = useState<boolean>(false);
  const state = location.state as LocationState;

  useEffect(() => {
    console.log('ATSResultsPage - location.state:', location.state);
    console.log('ATSResultsPage - parsedResumeData:', state?.parsedResumeData);
    
    if (!state || !state.results) {
      toast({
        title: 'No Results Found',
        description: 'Please upload and analyze a resume first.',
        variant: 'destructive'
      } as any);
      navigate('/resume/ats-score');
    } else if (state.results.detailed_feedback) {
      // Set first section as active by default
      const firstKey = Object.keys(state.results.detailed_feedback)[0];
      if (firstKey) {
        setActiveSection(firstKey);
      }
    }
  }, [state, navigate, toast]);



  if (!state || !state.results) {
    return null;
  }

  const { results } = state;

  const currentScore = results.overall_score;

  const selectSection = (section: string) => {
    setActiveSection(section);
  };

  const applyATSSuggestions = async () => {
    if (!state.parsedResumeData && !state.fileContent) {
      toast({
        title: 'No Resume Data Available',
        description: 'Neither parsed resume data nor extracted text is available to apply suggestions.',
        variant: 'destructive'
      } as any);
      return;
    }

    setIsApplyingSuggestions(true);
    
    try {
      // Use parsed resume data if available, otherwise create a basic structure from extracted text
      let resumeDataToUse = state.parsedResumeData;
      
      if (!resumeDataToUse && state.fileContent) {
        // Create a basic resume structure from extracted text
        resumeDataToUse = {
          basicDetails: {
            fullName: '',
            title: '',
            phone: '',
            email: '',
            location: '',
            website: '',
            github: '',
            linkedin: ''
          },
          summary: '',
          experience: [],
          education: [],
          skills: [],
          extractedText: state.fileContent
        };
      }

      const response = await atsService.applyATSSuggestions(resumeDataToUse, state.results);
      
      if (response.success && response.data) {
        // Navigate directly to resume builder with improved data and changes popup
        navigate('/resume/builder', {
          state: {
            improvedResumeData: response.data,
            improvementSummary: (response as any).improvement_summary,
            fromATS: true,
            originalFile: state.originalFile,
            showChangesPopup: true,
            atsResults: state.results
          }
        });
      } else {
        throw new Error(response.error || 'Failed to apply suggestions');
      }
    } catch (error) {
      console.error('Failed to apply ATS suggestions:', error);
      toast({
        title: 'Failed to Apply Suggestions',
        description: error instanceof Error ? error.message : 'An error occurred while applying suggestions.',
        variant: 'destructive'
      } as any);
    } finally {
      setIsApplyingSuggestions(false);
    }
  };


  const getScoreColor = (score: number) => {
    if (score >= 80) return '#059669'; // green-600
    if (score >= 65) return '#2563eb'; // blue-600  
    if (score >= 45) return '#d97706'; // amber-600
    return '#dc2626'; // red-600
  };

  // Get feedback sections from API response
  const getFeedbackSections = () => {
    if (!state?.results?.detailed_feedback) {
      return [];
    }

    const feedback = state.results.detailed_feedback;
    
    // Define expected categories for each analysis type
    const standardCategories = [
      'keyword_usage_placement',
      'skills_match_alignment', 
      'formatting_layout_ats',
      'section_organization',
      'achievements_impact_metrics',
      'grammar_spelling_quality',
      'header_consistency',
      'clarity_brevity',
      'repetition_avoidance',
      'contact_information_completeness',
      'resume_length_optimization'
    ];

    const jobSpecificCategories = [
      'keyword_match_skills',
      'experience_relevance',
      'education_certifications', 
      'achievements_impact',
      'formatting_structure',
      'soft_skills_match',
      'repetition_avoidance',
      'contact_information_completeness',
      'resume_length_optimization'
    ];

    // Filter categories based on analysis type
    const expectedCategories = state?.analysisType === 'job-specific' 
      ? jobSpecificCategories 
      : standardCategories;

    const sections = Object.entries(feedback)
      .filter(([key]) => expectedCategories.includes(key))
      .map(([key, section]) => ({
        id: key,
        title: section.title || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        score: section.score || 0,
        description: section.description || '',
        positives: section.positives || [],
        negatives: section.negatives || [],
        suggestions: section.suggestions || [],
        isActive: activeSection === key
      }));

    // Debug logging to help identify missing categories
    console.log('Analysis type:', state?.analysisType);
    console.log('Expected categories:', expectedCategories);
    console.log('Available categories:', Object.keys(feedback));
    console.log('Filtered sections:', sections.map(s => ({ id: s.id, title: s.title, score: s.score })));
    
    return sections;
  };


  const feedbackSections = getFeedbackSections();

  // Generate highlights for the active section
  const getActiveSectionHighlights = () => {
    if (!activeSection || !state?.results?.detailed_feedback) {
      return [];
    }

    const detailedFeedback = state.results.detailed_feedback as Record<string, any>;
    const section = detailedFeedback[activeSection];
    if (!section) return [];

    const highlights: Array<{ text: string; color: string; type: 'positive' | 'negative' | 'suggestion' }> = [];

    // Add negative points (issues) as red highlights
    section.negatives.forEach((negative: string) => {
      // Extract key phrases from negative feedback
      const phrases = negative.split(/[.!?]/).filter((phrase: string) => phrase.trim().length > 3);
      phrases.forEach((phrase: string) => {
        const words = phrase.trim().split(' ').filter((word: string) => word.length > 3);
        words.forEach((word: string) => {
          highlights.push({
            text: word,
            color: '#ef4444', // red-500
            type: 'negative'
          });
        });
      });
    });

    // Add positive points as green highlights
    section.positives.forEach((positive: string) => {
      const phrases = positive.split(/[.!?]/).filter((phrase: string) => phrase.trim().length > 3);
      phrases.forEach((phrase: string) => {
        const words = phrase.trim().split(' ').filter((word: string) => word.length > 3);
        words.forEach((word: string) => {
          highlights.push({
            text: word,
            color: '#10b981', // green-500
            type: 'positive'
          });
        });
      });
    });

    // Add suggestions as blue highlights
    section.suggestions.forEach((suggestion: string) => {
      const phrases = suggestion.split(/[.!?]/).filter((phrase: string) => phrase.trim().length > 3);
      phrases.forEach((phrase: string) => {
        const words = phrase.trim().split(' ').filter((word: string) => word.length > 3);
        words.forEach((word: string) => {
          highlights.push({
            text: word,
            color: '#3b82f6', // blue-500
            type: 'suggestion'
          });
        });
      });
    });

    return highlights;
  };

  const activeSectionHighlights = getActiveSectionHighlights();

  return (
    <div className="min-h-screen bg-white">
      {/* Top Navigation Bar */}
      <div className="border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/resume/ats-score')}
              className="text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="text-sm text-gray-500">Resume Worded</div>
          </div>
          <div className="flex items-center space-x-3">
            <Button 
              variant="default" 
              size="sm" 
              className="text-sm bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed font-semibold"
              onClick={applyATSSuggestions}
              disabled={isApplyingSuggestions || (!state.parsedResumeData && !state.fileContent)}
              title={(!state.parsedResumeData && !state.fileContent) ? 'No resume data available - cannot apply suggestions' : 'Apply AI-powered suggestions to boost ATS score to 90+'}
            >
              {isApplyingSuggestions ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Optimizing Resume...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 mr-2" />
                  🚀 Boost to 90+ Score
                </>
              )}
            </Button>
            <Button variant="outline" size="sm" className="text-sm">
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
            <Button variant="outline" size="sm" className="text-sm">
              <RotateCcw className="w-4 h-4 mr-2" />
              Try another resume
            </Button>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Left Sidebar - Exactly like Resume Worded */}
        <div className="w-80 border-r border-gray-200 bg-gray-50 min-h-screen">
          <div className="p-6">
            {/* Overall Score Circle - Only show for standard ATS analysis */}
            {state?.analysisType === 'standard' && (
              <div className="text-center mb-8">
                <div className="relative inline-flex items-center justify-center w-32 h-32 mb-4">
                  <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="8"
                    />
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      fill="none"
                      stroke={getScoreColor(currentScore)}
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={`${(currentScore / 100) * 314} 314`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-4xl font-bold" style={{ color: getScoreColor(currentScore) }}>
                        {currentScore}
                      </div>
                      <div className="text-sm text-gray-600 uppercase tracking-wide">
                        OVERALL
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  This is your overall score, which is made up of all the checks below.
                </div>
              </div>
            )}

            {/* Job Match Percentage - Only show for job-specific analysis */}
            {state?.analysisType === 'job-specific' && state?.results && 'match_percentage' in state.results && (
              <div className="text-center mb-8">
                <div className="relative inline-flex items-center justify-center w-32 h-32 mb-4">
                  <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="8"
                    />
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      fill="none"
                      stroke={getScoreColor((state.results as JDSpecificATSResult).match_percentage)}
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={`${((state.results as JDSpecificATSResult).match_percentage / 100) * 314} 314`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-4xl font-bold" style={{ color: getScoreColor((state.results as JDSpecificATSResult).match_percentage) }}>
                        {(state.results as JDSpecificATSResult).match_percentage}%
                      </div>
                      <div className="text-sm text-gray-600 uppercase tracking-wide">
                        JOB MATCH
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  How well your resume matches the job requirements.
                </div>
              </div>
            )}

            {/* Top Fixes Section */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">TOP FIXES</h3>
              {feedbackSections.length > 0 ? (
                <div className="space-y-3">
                  {feedbackSections.map((section) => (
                    <div 
                      key={section.id} 
                      className={`flex items-center justify-between py-2 px-3 rounded-lg cursor-pointer transition-colors ${
                        section.isActive 
                          ? 'bg-blue-100 border border-blue-200' 
                          : 'hover:bg-gray-100'
                      }`}
                      onClick={() => selectSection(section.id)}
                    >
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: getScoreColor(section.score) }}
                        />
                        <span className={`text-sm font-medium ${
                          section.isActive ? 'text-blue-800' : 'text-gray-700'
                        }`}>{section.title || section.id.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span 
                          className={`text-sm font-semibold ${
                            section.isActive ? 'text-blue-800' : ''
                          }`}
                          style={{ color: section.isActive ? '' : getScoreColor(section.score) }}
                        >
                          {section.score || 0}
                        </span>
                        <div 
                          className="w-1 h-1 rounded-full"
                          style={{ backgroundColor: section.score === 0 ? '#dc2626' : 'transparent' }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-4">
                  <p className="text-sm">No detailed feedback available</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Center Content - Resume Worded Style */}
        <div className="flex-1 bg-white">
          <div className="max-w-4xl mx-auto p-8">
            {/* Active Section Details */}
            {feedbackSections.length > 0 ? (
              <div>
                {feedbackSections
                  .filter(section => section.isActive)
                  .map((section) => (
                    <div key={section.id} className="border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between p-6 bg-gray-50">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-3">
                            <div 
                              className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                              style={{ backgroundColor: getScoreColor(section.score) }}
                            >
                              {section.score}
                            </div>
                            <div>
                              <h3 className="text-xl font-semibold text-gray-900">{section.title}</h3>
                              <p className="text-sm text-gray-600">
                                {section.negatives.length > 0 
                                  ? `${section.negatives.length} issue${section.negatives.length > 1 ? 's' : ''} found`
                                  : 'No issues found'
                                }
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-500">Score</div>
                          <div 
                            className="text-2xl font-bold"
                            style={{ color: getScoreColor(section.score) }}
                          >
                            {section.score}
                          </div>
                        </div>
                      </div>
                      
                      <div className="px-6 pb-6 bg-white">
                        <div className="pt-6 space-y-6">
                          
                          {/* Description */}
                          <div className="text-sm text-gray-700 bg-blue-50 p-4 rounded-lg border border-blue-200">
                            <p>{section.description}</p>
                          </div>

                          {/* Positive Points */}
                          {section.positives.length > 0 && (
                            <div>
                              <h4 className="font-semibold text-green-800 mb-3 flex items-center">
                                <CheckCircle className="w-4 h-4 mr-2" />
                                What's Working Well
                              </h4>
                              <div className="space-y-2">
                                {section.positives.map((positive, index) => (
                                  <div key={index} className="flex items-start space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                    <span className="text-sm text-green-800">{positive}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Negative Points */}
                          {section.negatives.length > 0 && (
                            <div>
                              <h4 className="font-semibold text-red-800 mb-3 flex items-center">
                                <AlertCircle className="w-4 h-4 mr-2" />
                                Issues to Fix
                              </h4>
                              <div className="space-y-2">
                                {section.negatives.map((negative, index) => (
                                  <div key={index} className="flex items-start space-x-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                                    <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                                    <span className="text-sm text-red-800">{negative}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Suggestions & Recommendations */}
                          <div>
                            <h4 className="font-semibold text-blue-800 mb-3 flex items-center">
                              <div className="w-4 h-4 mr-2 bg-blue-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-xs">💡</span>
                              </div>
                              Actionable Recommendations
                            </h4>
                            <div className="space-y-3">
                              {section.suggestions.map((suggestion, index) => {
                                // Parse suggestion format for better display - handle new specific formats
                                const isSpecificFormat = suggestion.startsWith('ADD_SKILLS:') || suggestion.startsWith('ENHANCE_ACHIEVEMENT:') || 
                                                         suggestion.startsWith('ADD_KEYWORDS:') || suggestion.startsWith('IMPROVE_EXPERIENCE:') ||
                                                         suggestion.startsWith('ENHANCE_PROJECT:') || suggestion.startsWith('REWRITE_SUMMARY:') ||
                                                         suggestion.startsWith('FIX_CONTACT:') || suggestion.startsWith('MISSING:') || 
                                                         suggestion.startsWith('IMPROVE:') || suggestion.startsWith('ADD:') || suggestion.startsWith('FIX:');
                                
                                let suggestionType = 'GENERAL';
                                if (suggestion.startsWith('ADD_SKILLS:')) suggestionType = 'SKILLS';
                                else if (suggestion.startsWith('ENHANCE_ACHIEVEMENT:')) suggestionType = 'ACHIEVEMENT';
                                else if (suggestion.startsWith('ADD_KEYWORDS:')) suggestionType = 'KEYWORDS';
                                else if (suggestion.startsWith('IMPROVE_EXPERIENCE:')) suggestionType = 'EXPERIENCE';
                                else if (suggestion.startsWith('ENHANCE_PROJECT:')) suggestionType = 'PROJECT';
                                else if (suggestion.startsWith('REWRITE_SUMMARY:')) suggestionType = 'SUMMARY';
                                else if (suggestion.startsWith('FIX_CONTACT:')) suggestionType = 'CONTACT';
                                else if (isSpecificFormat) suggestionType = suggestion.split(':')[0];
                                
                                const suggestionContent = isSpecificFormat ? suggestion.substring(suggestion.indexOf(':') + 1).trim() : suggestion;
                                
                                return (
                                  <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg overflow-hidden">
                                    <div className="flex items-center space-x-2 p-2 bg-blue-100 border-b border-blue-200">
                                      <div className={`px-2 py-1 rounded text-xs font-bold text-white ${
                                        suggestionType === 'SKILLS' ? 'bg-green-600' :
                                        suggestionType === 'ACHIEVEMENT' ? 'bg-yellow-600' :
                                        suggestionType === 'KEYWORDS' ? 'bg-purple-600' :
                                        suggestionType === 'EXPERIENCE' ? 'bg-orange-600' :
                                        suggestionType === 'PROJECT' ? 'bg-indigo-600' :
                                        suggestionType === 'SUMMARY' ? 'bg-pink-600' :
                                        suggestionType === 'CONTACT' ? 'bg-red-600' :
                                        suggestionType === 'MISSING' ? 'bg-red-500' :
                                        suggestionType === 'IMPROVE' ? 'bg-orange-500' :
                                        suggestionType === 'ADD' ? 'bg-green-500' :
                                        suggestionType === 'FIX' ? 'bg-purple-500' : 'bg-blue-500'
                                      }`}>
                                        {suggestionType}
                                      </div>
                                      <span className="text-sm font-medium text-blue-800">Action Required #{index + 1}</span>
                                    </div>
                                    <div className="p-3">
                                      <p className="text-sm text-blue-800 leading-relaxed">{suggestionContent}</p>
                                      {(section as any).improvement_examples && (section as any).improvement_examples[index] && (
                                        <div className="mt-2 p-2 bg-white rounded border-l-4 border-blue-400">
                                          <p className="text-xs text-blue-600 font-medium">💡 Example:</p>
                                          <p className="text-xs text-blue-700 mt-1">{(section as any).improvement_examples[index]}</p>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>


                        </div>
                      </div>
                    </div>
                  ))
                }
              </div>
            ) : (
              <div className="text-center py-12">
                <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Detailed Feedback Available</h3>
                <p className="text-gray-600 mb-4">
                  The API response did not include detailed feedback sections. 
                  Please check the backend service configuration.
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/resume/ats-score')}
                >
                  Try Again
                </Button>
              </div>
            )}


          </div>
        </div>

        {/* Right Sidebar - Resume Preview with Highlights */}
        <div className="w-[450px] border-l border-gray-200 bg-white min-h-screen">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Your Resume</h3>
              <FileText className="w-5 h-5 text-gray-400" />
            </div>
            
            {/* Resume Preview - Display actual PDF */}
            <div className="border border-gray-200 rounded-lg bg-white overflow-hidden shadow-sm">
              <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Resume Preview</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-gray-500">Live Preview</span>
                  </div>
                </div>
              </div>
              <div className="p-4 max-h-[70vh] overflow-y-auto">
                {state.originalFile ? (
                  <PDFViewer 
                    file={state.originalFile} 
                    className="w-full h-auto" 
                    highlights={activeSectionHighlights}
                  />
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Resume preview not available.</p>
                    <p className="text-xs mt-2">Original file not found in state.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Highlight Legend */}
            {activeSectionHighlights.length > 0 && (
              <div className="mt-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-semibold text-gray-800">Active Highlights</span>
                  </div>
                  <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-full border">
                    {activeSectionHighlights.length} highlights
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  <div className="flex items-center justify-between p-2 bg-white rounded-md border border-gray-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 rounded bg-red-500 opacity-40 border-2 border-red-300"></div>
                      <span className="text-sm font-medium text-red-700">Issues to Fix</span>
                    </div>
                    <span className="text-xs text-gray-500 bg-red-50 px-2 py-1 rounded">
                      {activeSectionHighlights.filter(h => h.type === 'negative').length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-white rounded-md border border-gray-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 rounded bg-green-500 opacity-40 border-2 border-green-300"></div>
                      <span className="text-sm font-medium text-green-700">What's Working Well</span>
                    </div>
                    <span className="text-xs text-gray-500 bg-green-50 px-2 py-1 rounded">
                      {activeSectionHighlights.filter(h => h.type === 'positive').length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-white rounded-md border border-gray-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 rounded bg-blue-500 opacity-40 border-2 border-blue-300"></div>
                      <span className="text-sm font-medium text-blue-700">Recommendations</span>
                    </div>
                    <span className="text-xs text-gray-500 bg-blue-50 px-2 py-1 rounded">
                      {activeSectionHighlights.filter(h => h.type === 'suggestion').length}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Feedback Summary */}
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-xs font-semibold text-blue-800 mb-2">Quick Stats:</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="text-green-700">
                  <span className="font-semibold">{results.strengths.length}</span> strengths
                </div>
                <div className="text-red-700">
                  <span className="font-semibold">{results.weaknesses.length}</span> issues
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="text-sm text-gray-600 mb-4">
                Want to improve your resume even more?
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full mb-3"
                onClick={() => navigate('/resume/ats-score')}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Analyze Another Resume
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ATSResultsPage;
