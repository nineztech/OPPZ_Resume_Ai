import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ArrowLeft,
  Sparkles, 
  Target, 
  AlertTriangle, 
  CheckCircle, 
  Briefcase,
  Settings,
  Star,
  ArrowRight,
  GraduationCap,
  Award,
  Code,
  Database,
  Cloud,
  GitBranch,
  Plus,
} from 'lucide-react';
import type { AISuggestions } from '@/services/geminiParserService';

interface LocationState {
  suggestions: AISuggestions;
  sector: string;
  country: string;
  designation: string;
  aiResults?: any;
  resumeFile?: File;
  // Additional properties when coming from UseTemplatePage
  templateId?: string;
  selectedColor?: string;
  extractedData?: any;
}

const AISuggestionsPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;

  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    // Redirect back if no state data
    if (!state || !state.suggestions) {
      navigate('/resume/templates');
    }
  }, [state, navigate]);

  if (!state || !state.suggestions) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mb-4"></div>
          <p className="text-gray-600">Loading AI suggestions...</p>
        </div>
      </div>
    );
  }

  const { suggestions } = state;

  // Add fallback for empty suggestions
  if (!suggestions || Object.keys(suggestions).length === 0) {
    console.warn('Suggestions object is empty or undefined:', suggestions);
  }

  // Helper function to safely get arrays from suggestions
  const getSafeArray = (array: any[] | undefined): any[] => {
    if (Array.isArray(array)) {
      return array;
    }
    if (array && typeof array === 'object') {
      // Handle case where it might be an object with array properties
      const values = Object.values(array);
      if (values.length > 0 && Array.isArray(values[0])) {
        return values[0];
      }
    }
    if (array && typeof array === 'string') {
      // Handle case where it might be a string that should be split
      return [array];
    }
    return [];
  };



  const getScoreColor = (score?: number) => {
    if (!score) return 'text-gray-600 bg-gray-100';
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const tabs = (() => {
    const tabConfigs = {
      overview: { id: 'overview', label: 'Overview', icon: Target },
      sections: { id: 'sections', label: 'Section Analysis', icon: Settings },
      experience: { id: 'experience', label: 'Experience', icon: Briefcase },
      skills: { id: 'skills', label: 'Skills Analysis', icon: Code },
      actionPlan: { id: 'action-plan', label: 'Action Plan', icon: CheckCircle }
    };
    return Object.values(tabConfigs);
  })();

  const handleApplyChanges = () => {
    // Process all section rewrites from AI suggestions
    const processedSuggestions = {
      ...state.suggestions,
      appliedRewrites: {
        professionalSummary: (state.suggestions as any).sectionSuggestions?.professionalSummary?.rewrite || null,
        skills: (state.suggestions as any).sectionSuggestions?.skills?.rewrite || [],
        workExperience: (state.suggestions as any).sectionSuggestions?.workExperience?.rewrite || null,
        education: (state.suggestions as any).sectionSuggestions?.education?.rewrite || null,
        // Pass the full projects array with name, existing, rewrite, recommendations
        projects: (state.suggestions as any).sectionSuggestions?.projects || null,
        certifications: (state.suggestions as any).sectionSuggestions?.certifications || null
      }
        };
    
    // Check if we came from UseTemplatePage (has templateId and selectedColor)
    if (state.templateId && state.selectedColor) {
      // Navigate back to resume builder with AI suggestions and parsed data
      navigate('/resume/builder', {
        state: {
          templateId: state.templateId,
          selectedColor: state.selectedColor,
          mode: 'ai-enhanced',
          extractedData: state.aiResults?.resumeData || state.extractedData,
          aiSuggestions: processedSuggestions,
          aiParams: state.aiResults?.parameters || {
            sector: state.sector,
            country: state.country,
            designation: state.designation
          },
          appliedSuggestions: {
            timestamp: new Date().toISOString(),
            suggestions: processedSuggestions,
            sectionsModified: Object.keys(processedSuggestions.appliedRewrites).filter(
              key => (processedSuggestions.appliedRewrites as any)[key] && 
              (Array.isArray((processedSuggestions.appliedRewrites as any)[key]) ? 
               (processedSuggestions.appliedRewrites as any)[key].length > 0 : 
               (processedSuggestions.appliedRewrites as any)[key] !== null)
            )
          }
        }
      });
    } else {
      // Navigate to template selection or resume builder with the AI results
      navigate('/resume/templates/use-template', {
        state: {
          sector: state.sector,
          country: state.country,
          designation: state.designation,
          aiResults: state.aiResults,
          resumeFile: state.resumeFile,
          appliedSuggestions: {
            timestamp: new Date().toISOString(),
            suggestions: processedSuggestions,
            sectionsModified: Object.keys(processedSuggestions.appliedRewrites).filter(
              key => (processedSuggestions.appliedRewrites as any)[key] && 
              (Array.isArray((processedSuggestions.appliedRewrites as any)[key]) ? 
               (processedSuggestions.appliedRewrites as any)[key].length > 0 : 
               (processedSuggestions.appliedRewrites as any)[key] !== null)
            )
          }
        }
      });
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={handleGoBack}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">AI Resume Analysis</h1>
                  <p className="text-sm text-gray-600">Personalized suggestions for {state.designation}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Debug Information - Remove in production */}
        {process.env.NODE_ENV === 'development' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-medium text-yellow-800 mb-2">Debug Info (Development Only)</h3>
            <div className="text-xs text-yellow-700 space-y-1">
              <div><strong>Suggestions structure:</strong> {JSON.stringify(Object.keys(suggestions || {}))}</div>
              <div><strong>Top recommendations:</strong> {JSON.stringify((suggestions as any)?.topRecommendations)}</div>
              <div><strong>Section suggestions:</strong> {JSON.stringify(Object.keys((suggestions as any)?.sectionSuggestions || {}))}</div>
            </div>
          </div>
        )}
        
        {/* Role Mismatch Warning */}
        {(suggestions as any).roleMismatchWarning && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-red-800 mb-1">Role Mismatch Detected</h3>
                <p className="text-sm text-red-700">
                  {(suggestions as any).roleMismatchWarning}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Score Overview */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className={`text-3xl font-bold px-4 py-2 rounded-lg ${getScoreColor(suggestions.overallScore)}`}>
                  {suggestions.overallScore || 0}%
                </div>
                <p className="text-sm text-gray-600 mt-1">Overall Score</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold px-4 py-2 rounded-lg bg-blue-100 text-blue-600">
                  {state.aiResults?.parameters?.sector || 'N/A'}
                </div>
                <p className="text-sm text-gray-600 mt-1">Sector</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold px-4 py-2 rounded-lg bg-green-100 text-green-600">
                  {state.aiResults?.parameters?.country || 'N/A'}
                </div>
                <p className="text-sm text-gray-600 mt-1">Country</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="border-b border-gray-200">
            <div className="flex overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'border-purple-500 text-purple-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-green-700">
                        <CheckCircle className="w-5 h-5" />
                        Top Recommendations
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {(() => {
                          const recommendations = getSafeArray((suggestions as any).topRecommendations);
                          console.log('Top recommendations data:', (suggestions as any).topRecommendations);
                          console.log('Processed recommendations:', recommendations);
                          
                          if (recommendations.length === 0) {
                            return (
                              <li className="text-sm text-gray-500 italic">
                                {(() => {
                                  const fallbackMessages = {
                                    noRecommendations: 'No specific recommendations available at this time.',
                                    noData: 'No data available',
                                    loading: 'Loading recommendations...'
                                  };
                                  return fallbackMessages.noRecommendations;
                                })()}
                              </li>
                            );
                          }
                          
                          return recommendations.slice(0, 5).map((rec, index) => (
                            <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                              <div className="w-5 h-5 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5 flex-shrink-0">
                                {index + 1}
                              </div>
                              <span className="leading-relaxed">{rec}</span>
                            </li>
                          ));
                        })()}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-amber-700">
                        <AlertTriangle className="w-5 h-5" />
                        Section Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {(() => {
                          const sectionSuggestions = (suggestions as any).sectionSuggestions || {};
                          const sections = Object.keys(sectionSuggestions);
                          
                          if (sections.length === 0) {
                            return (
                              <div className="text-sm text-gray-500 italic">
                                {(() => {
                                  const emptyStateMessages = {
                                    noSectionAnalysis: 'No section analysis available at this time.',
                                    noData: 'No data available',
                                    loading: 'Loading analysis...'
                                  };
                                  return emptyStateMessages.noSectionAnalysis;
                                })()}
                              </div>
                            );
                          }
                          
                          // Create a priority order for sections
                          const sectionPriority = [
                            'professionalSummary',
                            'workExperience', 
                            'skills',
                            'projects',
                            'education',
                            'certifications'
                          ];
                          
                          const orderedSections = sectionPriority.filter(section => 
                            sections.includes(section) && sectionSuggestions[section]
                          );
                          
                          return orderedSections.slice(0, 4).map((sectionKey) => {
                            const section = sectionSuggestions[sectionKey];
                            const sectionName = sectionKey.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                            
                            // Determine if section needs attention based on content
                            const hasIssues = !section.existing || 
                              (Array.isArray(section.existing) && section.existing.length === 0) ||
                              (typeof section.existing === 'string' && section.existing.trim() === '') ||
                              (typeof section.existing === 'object' && Object.keys(section.existing).length === 0);
                            
                            const hasRecommendations = section.recommendations && 
                              Array.isArray(section.recommendations) && 
                              section.recommendations.length > 0;
                            
                            return (
                              <div key={sectionKey} className={`p-3 rounded border-l-4 ${
                                hasIssues 
                                  ? 'bg-red-50 border-red-500' 
                                  : hasRecommendations 
                                    ? 'bg-yellow-50 border-yellow-500'
                                    : 'bg-green-50 border-green-500'
                              }`}>
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium text-gray-800">
                                    {sectionName}
                                  </span>
                                  <div className="flex items-center gap-1">
                                    {hasIssues ? (
                                      <AlertTriangle className="w-4 h-4 text-red-500" />
                                    ) : hasRecommendations ? (
                                      <AlertTriangle className="w-4 h-4 text-yellow-500" />
                                    ) : (
                                      <CheckCircle className="w-4 h-4 text-green-500" />
                                    )}
                                  </div>
                                </div>
                                <div className="text-xs text-gray-600 mt-1">
                                  {(() => {
                                    const statusMessages = {
                                      needsContent: 'Needs content',
                                      canBeImproved: 'Can be improved', 
                                      wellStructured: 'Well structured'
                                    };
                                    return hasIssues 
                                      ? statusMessages.needsContent
                                      : hasRecommendations 
                                        ? statusMessages.canBeImproved
                                        : statusMessages.wellStructured;
                                  })()}
                                </div>
                              </div>
                            );
                          });
                        })()}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Dynamic Score Breakdown */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-blue-600" />
                      Resume Analysis Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600 mb-1">
                          {suggestions.overallScore || 0}%
                        </div>
                        <div className="text-sm text-gray-600">Overall Score</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {(() => {
                            const scoreLevels = {
                              excellent: 'Excellent',
                              good: 'Good',
                              needsImprovement: 'Needs Improvement',
                              poor: 'Poor'
                            };
                            const score = suggestions.overallScore || 0;
                            return score >= 80 ? scoreLevels.excellent :
                                   score >= 60 ? scoreLevels.good :
                                   score >= 40 ? scoreLevels.needsImprovement : scoreLevels.poor;
                          })()}
                        </div>
                      </div>
                      
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600 mb-1">
                          {(() => {
                            const sectionSuggestions = (suggestions as any).sectionSuggestions || {};
                            const sections = Object.keys(sectionSuggestions);
                            return sections.length;
                          })()}
                        </div>
                        <div className="text-sm text-gray-600">Sections Analyzed</div>
                        <div className="text-xs text-gray-500 mt-1">AI reviewed sections</div>
                      </div>
                      
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600 mb-1">
                          {getSafeArray((suggestions as any).topRecommendations).length}
                        </div>
                        <div className="text-sm text-gray-600">Recommendations</div>
                        <div className="text-xs text-gray-500 mt-1">Action items provided</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Dynamic Key Insights */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="w-5 h-5 text-purple-600" />
                      Key Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {(() => {
                        const sectionSuggestions = (suggestions as any).sectionSuggestions || {};
                        const insights = [];
                        
                        const insightMessages = {
                          professionalSummary: {
                            title: 'Professional Summary',
                            description: 'AI has provided an enhanced version of your professional summary'
                          },
                          skillsEnhancement: {
                            title: 'Skills Enhancement', 
                            description: 'New skills have been suggested to better match the job requirements'
                          },
                          projectRecommendations: {
                            title: 'Project Recommendations',
                            description: (count: number) => `${count} project suggestions provided`
                          },
                          experienceEnhancement: {
                            title: 'Experience Enhancement',
                            description: 'Work experience descriptions have been optimized'
                          },
                          missingSections: {
                            title: 'Missing Sections',
                            description: (sections: string[]) => `Consider adding: ${sections.join(', ')}`
                          }
                        };
                        
                        // Check for professional summary insights
                        if (sectionSuggestions.professionalSummary?.rewrite) {
                          insights.push({
                            type: 'positive',
                            title: insightMessages.professionalSummary.title,
                            description: insightMessages.professionalSummary.description
                          });
                        }
                        
                        // Check for skills insights
                        if (sectionSuggestions.skills?.rewrite) {
                          insights.push({
                            type: 'positive',
                            title: insightMessages.skillsEnhancement.title,
                            description: insightMessages.skillsEnhancement.description
                          });
                        }
                        
                        // Check for project insights
                        if (sectionSuggestions.projects && Array.isArray(sectionSuggestions.projects) && sectionSuggestions.projects.length > 0) {
                          insights.push({
                            type: 'positive',
                            title: insightMessages.projectRecommendations.title,
                            description: insightMessages.projectRecommendations.description(sectionSuggestions.projects.length)
                          });
                        }
                        
                        // Check for work experience insights
                        if (sectionSuggestions.workExperience?.rewrite) {
                          insights.push({
                            type: 'positive',
                            title: insightMessages.experienceEnhancement.title,
                            description: insightMessages.experienceEnhancement.description
                          });
                        }
                        
                        // Check for missing sections
                        const missingSections = [];
                        if (!sectionSuggestions.projects || (Array.isArray(sectionSuggestions.projects) && sectionSuggestions.projects.length === 0)) {
                          missingSections.push('Projects');
                        }
                        if (!sectionSuggestions.certifications || (Array.isArray(sectionSuggestions.certifications) && sectionSuggestions.certifications.length === 0)) {
                          missingSections.push('Certifications');
                        }
                        
                        if (missingSections.length > 0) {
                          insights.push({
                            type: 'warning',
                            title: insightMessages.missingSections.title,
                            description: insightMessages.missingSections.description(missingSections)
                          });
                        }
                        
                        return insights.slice(0, 4).map((insight, index) => (
                          <div key={index} className={`p-3 rounded-lg border-l-4 ${
                            insight.type === 'positive' 
                              ? 'bg-green-50 border-green-500' 
                              : insight.type === 'warning'
                                ? 'bg-yellow-50 border-yellow-500'
                                : 'bg-blue-50 border-blue-500'
                          }`}>
                            <div className="flex items-center gap-2 mb-1">
                              {insight.type === 'positive' ? (
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              ) : insight.type === 'warning' ? (
                                <AlertTriangle className="w-4 h-4 text-yellow-600" />
                              ) : (
                                <Star className="w-4 h-4 text-blue-600" />
                              )}
                              <span className="text-sm font-medium text-gray-800">
                                {insight.title}
                              </span>
                            </div>
                            <div className="text-xs text-gray-600">
                              {insight.description}
                            </div>
                          </div>
                        ));
                      })()}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'sections' && (
              <div className="space-y-6">
                {/* Professional Summary */}
                {(suggestions as any).sectionSuggestions?.professionalSummary && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Code className="w-5 h-5 text-blue-600" />
                        Professional Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Current Summary</h4>
                          <div className="text-sm text-gray-700 p-3 bg-gray-50 rounded border">
                            {(suggestions as any).sectionSuggestions.professionalSummary.existing}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Suggested Rewrite</h4>
                          <div className="text-sm text-gray-700 p-3 bg-blue-50 rounded border-l-4 border-blue-500">
                            {(suggestions as any).sectionSuggestions.professionalSummary.rewrite}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Key Recommendations</h4>
                          <ul className="space-y-1">
                            {(() => {
                              const recommendations = getSafeArray((suggestions as any).sectionSuggestions.professionalSummary.recommendations);
                              console.log('Professional summary recommendations:', (suggestions as any).sectionSuggestions.professionalSummary.recommendations);
                              console.log('Processed recommendations:', recommendations);
                              
                              if (recommendations.length === 0) {
                                return (
                                  <li className="text-sm text-gray-500 italic">
                                    No specific recommendations for this section.
                                  </li>
                                );
                              }
                              
                              return recommendations.map((rec, index) => (
                                <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                                  <ArrowRight className="w-3 h-3 text-blue-500 mt-1 flex-shrink-0" />
                                  {rec}
                                </li>
                              ));
                            })()}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Skills Section */}
                {(suggestions as any).sectionSuggestions?.skills && (
                  (suggestions as any).sectionSuggestions.skills.rewrite || 
                  (suggestions as any).sectionSuggestions.skills.recommendations
                ) && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Settings className="w-5 h-5 text-green-600" />
                        Skills Section
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Suggested Skills</h4>
                          <div className="space-y-2">
                            {(() => {
                              const skills = getSafeArray((suggestions as any).sectionSuggestions.skills.rewrite);
                              console.log('Skills rewrite data:', (suggestions as any).sectionSuggestions.skills.rewrite);
                              console.log('Processed skills:', skills);
                              
                              if (skills.length === 0) {
                                return (
                                  <div className="text-sm text-gray-500 italic p-2">
                                    No specific skill suggestions available.
                                  </div>
                                );
                              }
                              
                              return skills.map((skill, index) => (
                                <div key={index} className="text-sm text-gray-700 p-2 bg-green-50 rounded border-l-4 border-green-500">
                                  {skill}
                                </div>
                              ));
                            })()}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Recommendations</h4>
                          <ul className="space-y-1">
                            {(() => {
                              const recommendations = getSafeArray((suggestions as any).sectionSuggestions.skills.recommendations);
                              console.log('Skills recommendations:', (suggestions as any).sectionSuggestions.skills.recommendations);
                              console.log('Processed recommendations:', recommendations);
                              
                              if (recommendations.length === 0) {
                                return (
                                  <li className="text-sm text-gray-500 italic">
                                    No specific recommendations for skills section.
                                  </li>
                                );
                              }
                              
                              return recommendations.map((rec, index) => (
                                <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                                  <ArrowRight className="w-3 h-3 text-green-500 mt-1 flex-shrink-0" />
                                  {rec}
                                </li>
                              ));
                            })()}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Projects Section */}
                {(suggestions as any).sectionSuggestions?.projects && (
                  (suggestions as any).sectionSuggestions.projects.rewrite || 
                  (suggestions as any).sectionSuggestions.projects.recommendations ||
                  (suggestions as any).sectionSuggestions.projects.existing ||
                  (Array.isArray((suggestions as any).sectionSuggestions.projects) && (suggestions as any).sectionSuggestions.projects.length > 0)
                ) && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <GitBranch className="w-5 h-5 text-purple-600" />
                        Projects Section
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {(() => {
                          const projects = (suggestions as any).sectionSuggestions.projects;
                          
                          // Handle projects as array (future compatibility)
                          if (Array.isArray(projects) && projects.length > 0) {
                            return (
                              <div className="space-y-4">
                                {projects.map((project: any, index: number) => (
                                  <div key={index} className="border rounded-lg p-4">
                                    <h4 className="font-medium text-gray-900 mb-2">Project {index + 1}</h4>
                                    <div className="space-y-3">
                                      <div>
                                        <h5 className="font-medium text-gray-800 mb-1">Current Project</h5>
                                        <div className="text-sm text-gray-700 p-3 bg-gray-50 rounded border">
                                          {project.existing || 'No project details available'}
                                        </div>
                                      </div>
                                      <div>
                                        <h5 className="font-medium text-gray-800 mb-1">Suggested Enhancement</h5>
                                        <div className="text-sm text-gray-700 p-3 bg-purple-50 rounded border-l-4 border-purple-500 whitespace-pre-line">
                                          {project.rewrite || 'No specific project suggestions available at this time.'}
                                        </div>
                                      </div>
                                      <div>
                                        <h5 className="font-medium text-gray-800 mb-1">Recommendations</h5>
                                        <ul className="space-y-1">
                                          {getSafeArray(project.recommendations).map((rec, recIndex) => (
                                            <li key={recIndex} className="text-sm text-gray-700 flex items-start gap-2">
                                              <ArrowRight className="w-3 h-3 text-purple-500 mt-1 flex-shrink-0" />
                                              {rec}
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            );
                          }
                          
                          // Handle projects as object (current structure)
                          return (
                            <>
                              <div>
                                <h4 className="font-medium text-gray-900 mb-2">Current Projects</h4>
                                <div className="text-sm text-gray-700 p-3 bg-gray-50 rounded border">
                                  {projects.existing || 'No projects currently listed in resume'}
                                </div>
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900 mb-2">Suggested Project Enhancements</h4>
                                <div className="text-sm text-gray-700 p-3 bg-purple-50 rounded border-l-4 border-purple-500">
                                  {projects.rewrite || 'No specific project suggestions available at this time.'}
                                </div>
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900 mb-2">Recommendations</h4>
                                <ul className="space-y-1">
                                  {(() => {
                                    const recommendations = getSafeArray(projects.recommendations);
                                    console.log('Projects recommendations:', projects.recommendations);
                                    console.log('Processed recommendations:', recommendations);
                                    
                                    if (recommendations.length === 0 || (recommendations.length === 1 && recommendations[0] === '')) {
                                      return (
                                        <li className="text-sm text-gray-500 italic">
                                          No specific recommendations for projects section.
                                        </li>
                                      );
                                    }
                                    
                                    return recommendations.map((rec, index) => (
                                      <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                                        <ArrowRight className="w-3 h-3 text-purple-500 mt-1 flex-shrink-0" />
                                        {rec}
                                      </li>
                                    ));
                                  })()}
                                </ul>
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Education Section */}
                {(suggestions as any).sectionSuggestions?.education && (
                <Card>
                  <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <GraduationCap className="w-5 h-5 text-indigo-600" />
                        Education Section
                      </CardTitle>
                  </CardHeader>
                  <CardContent>
                      <div className="space-y-4">
                      <div>
                          <h4 className="font-medium text-gray-900 mb-2">Suggested Updates</h4>
                          <div className="space-y-2">
                            {getSafeArray((suggestions as any).sectionSuggestions.education.rewrite).map((edu, index) => (
                              <div key={index} className="text-sm text-gray-700 p-3 bg-indigo-50 rounded border-l-4 border-indigo-500">
                                {edu}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                          <h4 className="font-medium text-gray-900 mb-2">Recommendations</h4>
                          <ul className="space-y-1">
                            {getSafeArray((suggestions as any).sectionSuggestions.education.recommendations).map((rec, index) => (
                              <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                                <ArrowRight className="w-3 h-3 text-indigo-500 mt-1 flex-shrink-0" />
                                {rec}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Certifications Section */}
                {(suggestions as any).sectionSuggestions?.certifications && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Award className="w-5 h-5 text-yellow-600" />
                        Certifications Section
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {(() => {
                          const certifications = (suggestions as any).sectionSuggestions?.certifications;
                          
                          // Check if certifications exist and is valid
                          if (!certifications) {
                            return (
                              <div className="text-sm text-gray-500 italic">
                                No certification suggestions available.
                              </div>
                            );
                          }
                          
                          // Handle certifications as array of objects (new structure)
                          if (Array.isArray(certifications) && certifications.length > 0) {
                            return (
                              <div className="space-y-4">
                                {certifications.map((cert, index) => {
                                  // Ensure cert is an object and has the expected structure
                                  if (!cert || typeof cert !== 'object') {
                                    return null;
                                  }
                                  
                                  return (
                                    <div key={index} className="border rounded-lg p-4 bg-yellow-50">
                                      <div className="space-y-3">
                                        <div>
                                          <h5 className="font-medium text-gray-800 mb-1">Certificate Name</h5>
                                          <div className="text-sm text-gray-700 p-2 bg-white rounded border">
                                            {String(cert.certificateName || cert.name || 'Certificate name not specified')}
                                          </div>
                                        </div>
                                        <div>
                                          <h5 className="font-medium text-gray-800 mb-1">Issuing Organization</h5>
                                          <div className="text-sm text-gray-700 p-2 bg-white rounded border">
                                            {String(cert.instituteName || cert.issuer || cert.organization || 'Organization not specified')}
                                          </div>
                                        </div>
                                        <div>
                                          <h5 className="font-medium text-gray-800 mb-1">Issue Date</h5>
                                          <div className="text-sm text-gray-700 p-2 bg-white rounded border">
                                            {String(cert.issueDate || cert.startDate || cert.endDate || 'Date not specified')}
                                          </div>
                                        </div>
                                        <div>
                                          <h5 className="font-medium text-gray-800 mb-1">Description</h5>
                                          <div className="text-sm text-gray-700 p-2 bg-white rounded border">
                                            {String(cert.rewrite || cert.existing || 'No description available')}
                                          </div>
                                        </div>
                                        <div>
                                          <h5 className="font-medium text-gray-800 mb-1">Recommendations</h5>
                                          <ul className="space-y-1">
                                            {getSafeArray(cert.recommendations || []).map((rec, recIndex) => (
                                              <li key={recIndex} className="text-sm text-gray-700 flex items-start gap-2">
                                                <ArrowRight className="w-3 h-3 text-yellow-500 mt-1 flex-shrink-0" />
                                                {String(rec)}
                                              </li>
                                            ))}
                                          </ul>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            );
                          }
                          
                          // Handle certifications as object (fallback)
                          if (certifications && typeof certifications === 'object' && !Array.isArray(certifications)) {
                            return (
                              <>
                                <div>
                                  <h4 className="font-medium text-gray-900 mb-2">Current Certifications</h4>
                                  <div className="text-sm text-gray-700 p-3 bg-gray-50 rounded border">
                                    {String(certifications.existing || 'No certifications currently listed in resume')}
                                  </div>
                                </div>
                                <div>
                                  <h4 className="font-medium text-gray-900 mb-2">Suggested Certification Enhancements</h4>
                                  <div className="text-sm text-gray-700 p-3 bg-yellow-50 rounded border-l-4 border-yellow-500">
                                    {String(certifications.rewrite || 'No specific certification suggestions available at this time.')}
                                  </div>
                                </div>
                                <div>
                                  <h4 className="font-medium text-gray-900 mb-2">Recommendations</h4>
                                  <ul className="space-y-1">
                                    {getSafeArray(certifications.recommendations || []).map((rec, index) => (
                                      <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                                        <ArrowRight className="w-3 h-3 text-yellow-500 mt-1 flex-shrink-0" />
                                        {String(rec)}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </>
                            );
                          }
                          
                          // Fallback for unexpected data structure
                          return (
                            <div className="text-sm text-gray-500 italic">
                              No certification suggestions available.
                            </div>
                          );
                        })()}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {activeTab === 'experience' && (
              <div className="space-y-6">
                {(suggestions as any).sectionSuggestions?.workExperience && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Briefcase className="w-5 h-5 text-blue-600" />
                        Work Experience Enhancement
                        {(suggestions as any).sectionSuggestions.workExperience.role && (
                          <span className="text-sm font-normal text-gray-600 ml-2">
                            - {(suggestions as any).sectionSuggestions.workExperience.role}
                          </span>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Current Experience Description</h4>
                          <div className="text-sm text-gray-700 p-3 bg-gray-50 rounded border max-h-40 overflow-y-auto whitespace-pre-line">
                            {(suggestions as any).sectionSuggestions.workExperience.existing || 'No work experience data available'}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Suggested Rewrite</h4>
                          <div className="text-sm text-gray-700 p-3 bg-blue-50 rounded border-l-4 border-blue-500 max-h-40 overflow-y-auto whitespace-pre-line">
                            {(suggestions as any).sectionSuggestions.workExperience.rewrite || 'No specific rewrite suggestions available at this time.'}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Key Recommendations</h4>
                          <ul className="space-y-1">
                            {(() => {
                              const recommendations = getSafeArray((suggestions as any).sectionSuggestions.workExperience.recommendations);
                              console.log('Work experience recommendations:', (suggestions as any).sectionSuggestions.workExperience.recommendations);
                              console.log('Processed recommendations:', recommendations);
                              
                              if (recommendations.length === 0 || (recommendations.length === 1 && recommendations[0] === '')) {
                                return (
                                  <li className="text-sm text-gray-500 italic">
                                    No specific recommendations for work experience section.
                                  </li>
                                );
                              }
                              
                              return recommendations.map((rec, recIndex) => (
                                <li key={recIndex} className="text-sm text-gray-700 flex items-start gap-2">
                                  <ArrowRight className="w-3 h-3 text-blue-500 mt-1 flex-shrink-0" />
                                  {rec}
                                </li>
                              ));
                            })()}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {activeTab === 'skills' && (
              <div className="space-y-6">
                {/* Current Skills Analysis */}
                {(suggestions as any).sectionSuggestions?.skills && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Settings className="w-5 h-5 text-green-600" />
                        Current Skills Analysis
                      </CardTitle>
                      <CardDescription>Your existing skills organized by category</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {(() => {
                          const existingSkills = (suggestions as any).sectionSuggestions.skills.existing || {};
                          const skillCategories = Object.keys(existingSkills);
                          
                          if (skillCategories.length === 0) {
                            return (
                              <div className="text-center p-6 text-gray-500">
                                <Code className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                <p className="text-sm italic">No skills data available</p>
                              </div>
                            );
                          }
                          
                          return (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {skillCategories.map((category) => (
                                <div key={category} className="bg-gray-50 rounded-lg p-4 border">
                                  <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                                    {category === 'Languages' && <Code className="w-4 h-4 text-blue-600" />}
                                    {category === 'Frameworks' && <GitBranch className="w-4 h-4 text-purple-600" />}
                                    {category === 'Cloud' && <Cloud className="w-4 h-4 text-blue-600" />}
                                    {category === 'Databases' && <Database className="w-4 h-4 text-green-600" />}
                                    {category === 'DevOps' && <Settings className="w-4 h-4 text-orange-600" />}
                                    {category === 'Testing' && <CheckCircle className="w-4 h-4 text-green-600" />}
                                    {category === 'Tools' && <Settings className="w-4 h-4 text-gray-600" />}
                                    {category === 'Frontend' && <Code className="w-4 h-4 text-pink-600" />}
                                    {category === 'Messaging/Event-Driven' && <GitBranch className="w-4 h-4 text-indigo-600" />}
                                    {!['Languages', 'Frameworks', 'Cloud', 'Databases', 'DevOps', 'Testing', 'Tools', 'Frontend', 'Messaging/Event-Driven'].includes(category) && <Code className="w-4 h-4 text-gray-600" />}
                                    {category}
                                  </h4>
                                  <div className="text-sm text-gray-700 whitespace-pre-line">
                                    {existingSkills[category]}
                                  </div>
                                </div>
                              ))}
                            </div>
                          );
                        })()}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Suggested Skills */}
                {(suggestions as any).sectionSuggestions?.skills?.rewrite && Object.keys((suggestions as any).sectionSuggestions.skills.rewrite).length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Star className="w-5 h-5 text-purple-600" />
                        Suggested Skills to Add
                      </CardTitle>
                      <CardDescription>New skills recommended to better match the job requirements</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {Object.entries((suggestions as any).sectionSuggestions.skills.rewrite).map(([category, skills]) => (
                          <div key={category} className="bg-purple-50 rounded-lg p-4 border-l-4 border-purple-500">
                            <h4 className="font-medium text-purple-900 mb-2 flex items-center gap-2">
                              <Plus className="w-4 h-4" />
                              Add to {category}
                            </h4>
                            <div className="text-sm text-purple-800">
                              {String(skills)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Skills Recommendations */}
                {(suggestions as any).sectionSuggestions?.skills?.recommendations && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="w-5 h-5 text-blue-600" />
                        Skills Enhancement Recommendations
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {getSafeArray((suggestions as any).sectionSuggestions.skills.recommendations).map((rec, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                            <ArrowRight className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {activeTab === 'action-plan' && (
              <div className="space-y-6">
                {/* Priority Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-blue-600" />
                      Priority Improvement Actions
                    </CardTitle>
                    <CardDescription>Recommended actions based on AI analysis</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {(() => {
                        const actions = getSafeArray((suggestions as any).topRecommendations);
                        
                        if (actions.length === 0) {
                          return (
                            <div className="text-center p-6 text-gray-500">
                              <Target className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                              <p className="text-sm italic">No specific action items available at this time.</p>
                              <p className="text-xs mt-2">The AI analysis may not have generated specific recommendations yet.</p>
                            </div>
                          );
                        }
                        
                        return actions.map((action, index) => (
                          <div key={index} className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                            <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                              {index + 1}
                            </div>
                            <span className="text-sm text-gray-700 flex-1 leading-relaxed">
                              {action}
                            </span>
                          </div>
                        ));
                      })()}
                    </div>
                  </CardContent>
                </Card>

                {/* Section-Specific Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="w-5 h-5 text-purple-600" />
                      Section-Specific Improvements
                    </CardTitle>
                    <CardDescription>Detailed recommendations for each resume section</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {(() => {
                        const sectionSuggestions = (suggestions as any).sectionSuggestions || {};
                        const sections = Object.keys(sectionSuggestions);
                        
                        if (sections.length === 0) {
                          return (
                            <div className="text-center p-6 text-gray-500">
                              <Settings className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                              <p className="text-sm italic">No section-specific recommendations available.</p>
                            </div>
                          );
                        }
                        
                        return sections.map((sectionKey) => {
                          const section = sectionSuggestions[sectionKey];
                          const sectionName = sectionKey.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                          const hasRecommendations = section.recommendations && Array.isArray(section.recommendations) && section.recommendations.length > 0;
                          
                          if (!hasRecommendations) return null;
                          
                          return (
                            <div key={sectionKey} className="bg-gray-50 rounded-lg p-4 border">
                              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                                {sectionKey === 'professionalSummary' && <Code className="w-4 h-4 text-blue-600" />}
                                {sectionKey === 'workExperience' && <Briefcase className="w-4 h-4 text-green-600" />}
                                {sectionKey === 'skills' && <Settings className="w-4 h-4 text-purple-600" />}
                                {sectionKey === 'projects' && <GitBranch className="w-4 h-4 text-orange-600" />}
                                {sectionKey === 'education' && <GraduationCap className="w-4 h-4 text-indigo-600" />}
                                {sectionKey === 'certifications' && <Award className="w-4 h-4 text-yellow-600" />}
                                {!['professionalSummary', 'workExperience', 'skills', 'projects', 'education', 'certifications'].includes(sectionKey) && <Settings className="w-4 h-4 text-gray-600" />}
                                {sectionName}
                              </h4>
                              <ul className="space-y-2">
                                {getSafeArray(section.recommendations).map((rec, index) => (
                                  <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                                    <ArrowRight className="w-3 h-3 text-gray-500 mt-1 flex-shrink-0" />
                                    {rec}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </CardContent>
                </Card>

                {/* Score and Progress
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                    <CardHeader>
                      <CardTitle className="text-green-700 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5" />
                        Current Score
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center">
                        <div className={`text-5xl font-bold mb-2 ${getScoreColor(suggestions.overallScore)}`}>
                          {suggestions.overallScore || 0}%
                        </div>
                        <p className="text-sm text-gray-600 mb-3">Resume compatibility score</p>
                        <div className="text-xs text-gray-500">
                          {(() => {
                            const score = suggestions.overallScore || 0;
                            const feedbackMessages = [
                              { min: 80, message: 'Excellent match!' },
                              { min: 60, message: 'Good match, room for improvement' },
                              { min: 40, message: 'Needs significant improvement' },
                              { min: 0, message: 'Poor match - major changes needed' }
                            ];
                            
                            const feedback = feedbackMessages.find(f => score >= f.min);
                            return feedback?.message || 'Score analysis unavailable';
                          })()}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
                    <CardHeader>
                      <CardTitle className="text-purple-700 flex items-center gap-2">
                        <Clock className="w-5 h-5" />
                        Implementation Timeline
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {(() => {
                          const timelineItems = [
                            {
                              priority: 'immediate',
                              color: 'red',
                              timeframe: 'Immediate (1-2 days)',
                              description: 'Update professional summary and key skills'
                            },
                            {
                              priority: 'short',
                              color: 'yellow', 
                              timeframe: 'Short-term (1-2 weeks)',
                              description: 'Enhance work experience descriptions and add projects'
                            },
                            {
                              priority: 'long',
                              color: 'green',
                              timeframe: 'Long-term (1-2 months)', 
                              description: 'Gain additional certifications and skills'
                            }
                          ];
                          
                          return timelineItems.map((item, index) => (
                            <div key={index}>
                              <div className="flex items-center gap-2 text-sm text-gray-700">
                                <div className={`w-2 h-2 bg-${item.color}-500 rounded-full`}></div>
                                <span className="font-medium">{item.timeframe}</span>
                              </div>
                              <div className="text-xs text-gray-600 ml-4">{item.description}</div>
                            </div>
                          ));
                        })()}
                      </div>
                    </CardContent>
                  </Card>
                </div> */}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center">
            <Button variant="outline" onClick={handleGoBack}>
              {(() => {
                const buttonTexts = {
                  reviewLater: 'Review Later',
                  back: 'Back',
                  cancel: 'Cancel'
                };
                return buttonTexts.reviewLater;
              })()}
            </Button>
            <div className="flex gap-3">
              <Button 
                onClick={handleApplyChanges}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                {(() => {
                  const actionTexts = {
                    applySuggestions: 'Apply Suggestions',
                    applyChanges: 'Apply Changes',
                    updateResume: 'Update Resume'
                  };
                  return actionTexts.applySuggestions;
                })()}
              </Button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AISuggestionsPage;
