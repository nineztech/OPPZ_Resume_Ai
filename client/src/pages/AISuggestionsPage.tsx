import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft,
  Sparkles, 
  Target, 
  AlertTriangle, 
  CheckCircle, 
  Briefcase,
  Settings,
  Eye,
  Star,
  ArrowRight,
  GraduationCap,
  Award,
  Code,
  Database,
  Cloud,
  GitBranch
} from 'lucide-react';
import type { AISuggestions, AIJobDescription } from '@/services/geminiParserService';

interface LocationState {
  suggestions: AISuggestions;
  jobDescription: AIJobDescription;
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
  const [showJobDescription, setShowJobDescription] = useState(false);

  useEffect(() => {
    // Redirect back if no state data
    if (!state || !state.suggestions || !state.jobDescription) {
      navigate('/resume/templates');
    }
  }, [state, navigate]);

  if (!state || !state.suggestions || !state.jobDescription) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mb-4"></div>
          <p className="text-gray-600">Loading AI suggestions...</p>
        </div>
      </div>
    );
  }

  const { suggestions, jobDescription } = state;

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

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Target },
    { id: 'sections', label: 'Section Analysis', icon: Settings },
    { id: 'experience', label: 'Experience', icon: Briefcase },
    { id: 'skills', label: 'Skills Analysis', icon: Code },
    { id: 'action-plan', label: 'Action Plan', icon: CheckCircle }
  ];

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
        certifications: (state.suggestions as any).sectionSuggestions?.certifications?.rewrite || null
      }
        };
    
    // Check if we came from UseTemplatePage (has templateId and extractedData)
    if (state.templateId && state.extractedData) {
      // Navigate back to resume builder with AI suggestions and parsed data
      navigate('/resume/builder', {
        state: {
          templateId: state.templateId,
          selectedColor: state.selectedColor,
          mode: 'ai-enhanced',
          extractedData: state.aiResults?.resumeData || state.extractedData,
          aiSuggestions: processedSuggestions,
          jobDescription: state.jobDescription,
          aiParams: state.aiResults?.parameters || {
            sector: state.sector,
            country: state.country,
            designation: state.designation
          },
          appliedSuggestions: {
            timestamp: new Date().toISOString(),
            suggestions: processedSuggestions,
            jobDescription: state.jobDescription,
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
            jobDescription: state.jobDescription,
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
                  <p className="text-sm text-gray-600">Personalized suggestions for {jobDescription.jobTitle}</p>
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
                                No specific recommendations available at this time.
                              </li>
                            );
                          }
                          
                          return recommendations.slice(0, 3).map((rec, index) => (
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
                        Critical Issues
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="text-sm text-red-600 p-2 bg-red-50 rounded border-l-4 border-red-500">
                          Missing MERN Stack Projects
                        </div>
                        <div className="text-sm text-red-600 p-2 bg-red-50 rounded border-l-4 border-red-500">
                          Incomplete Work Experience Dates
                        </div>
                        <div className="text-sm text-red-600 p-2 bg-red-50 rounded border-l-4 border-red-500">
                          Missing Skills Section
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>


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
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Suggested Certifications</h4>
                          <div className="space-y-2">
                            {getSafeArray((suggestions as any).sectionSuggestions.certifications.rewrite).map((cert, index) => (
                              <div key={index} className="text-sm text-gray-700 p-3 bg-yellow-50 rounded border-l-4 border-yellow-500">
                                {cert}
                            </div>
                          ))}
                        </div>
                      </div>
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Recommendations</h4>
                          <ul className="space-y-1">
                            {getSafeArray((suggestions as any).sectionSuggestions.certifications.recommendations).map((rec, index) => (
                              <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                                <ArrowRight className="w-3 h-3 text-yellow-500 mt-1 flex-shrink-0" />
                                {rec}
                              </li>
                            ))}
                          </ul>
                        </div>
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                      <CardTitle className="text-green-700">MERN Stack Skills</CardTitle>
                      <CardDescription>Core technologies for the role</CardDescription>
                  </CardHeader>
                  <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Database className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-medium">MongoDB</span>
                          <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                            Experience Available
                            </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Code className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-medium">Express.js</span>
                          <Badge variant="outline" className="text-xs">
                            To Learn
                          </Badge>
                      </div>
                        <div className="flex items-center gap-2">
                          <Code className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-medium">React.js</span>
                          <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                            Experience Available
                          </Badge>
                            </div>
                        <div className="flex items-center gap-2">
                          <Code className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-medium">Node.js</span>
                          <Badge variant="outline" className="text-xs">
                            To Learn
                          </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                      <CardTitle className="text-blue-700">Transferable Skills</CardTitle>
                      <CardDescription>Skills that apply to the role</CardDescription>
                  </CardHeader>
                  <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Cloud className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-medium">AWS Experience</span>
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                            Strong
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <GitBranch className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-medium">Git & CI/CD</span>
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                            Strong
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Database className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-medium">Database Design</span>
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                            Strong
                          </Badge>
                      </div>
                        <div className="flex items-center gap-2">
                          <Code className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-medium">RESTful APIs</span>
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                            Strong
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Skills Gap Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-red-50 rounded-lg border-l-4 border-red-500">
                          <div className="text-2xl font-bold text-red-600">Critical</div>
                          <div className="text-sm text-gray-600">MERN Projects</div>
                        </div>
                        <div className="text-center p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
                          <div className="text-2xl font-bold text-yellow-600">High</div>
                          <div className="text-sm text-gray-600">Express.js & Node.js</div>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                          <div className="text-2xl font-bold text-green-600">Low</div>
                          <div className="text-sm text-gray-600">React.js & MongoDB</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'action-plan' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-blue-600" />
                      Priority Improvement Actions
                    </CardTitle>
                    <CardDescription>Recommended actions based on analysis</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {(() => {
                        const actions = getSafeArray((suggestions as any).topRecommendations);
                        console.log('Action plan recommendations:', (suggestions as any).topRecommendations);
                        console.log('Processed actions:', actions);
                        
                        if (actions.length === 0) {
                          return (
                            <div className="text-center p-6 text-gray-500">
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                    <CardHeader>
                      <CardTitle className="text-green-700 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5" />
                        Overall Score
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center">
                        <div className={`text-5xl font-bold mb-2 ${getScoreColor(suggestions.overallScore)}`}>
                          {suggestions.overallScore || 0}%
                        </div>
                        <p className="text-sm text-gray-600">Your resume compatibility score</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
                    <CardHeader>
                      <CardTitle className="text-purple-700 flex items-center gap-2">
                        <Star className="w-5 h-5" />
                        Next Steps
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                          Develop MERN stack projects
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                          Add missing work experience dates
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                          Create comprehensive skills section
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                          Apply changes to resume template
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center">
            <Button variant="outline" onClick={handleGoBack}>
              Review Later
            </Button>
            <div className="flex gap-3">
              <Button 
                variant="outline"
                onClick={() => setShowJobDescription(!showJobDescription)}
              >
                <Eye className="w-4 h-4 mr-2" />
                {showJobDescription ? 'Hide' : 'View'} Job Description
              </Button>
              <Button 
                onClick={handleApplyChanges}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Apply Suggestions
              </Button>
            </div>
          </div>
        </div>

        {/* Job Description Modal/Section */}
        {showJobDescription && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Job Description Details</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowJobDescription(false)}
              >
                ✕
              </Button>
            </div>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Job Title</h4>
                <p className="text-sm text-gray-700">{jobDescription.jobTitle}</p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Experience Level</h4>
                <p className="text-sm text-gray-700">{jobDescription.experienceLevel}</p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Job Summary</h4>
                <p className="text-sm text-gray-700 whitespace-pre-line">{jobDescription.jobSummary}</p>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Key Responsibilities</h4>
                <ul className="list-disc list-inside space-y-1">
                  {getSafeArray(jobDescription.keyResponsibilities).map((responsibility, index) => (
                    <li key={index} className="text-sm text-gray-700">{responsibility}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Required Skills</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="font-medium text-gray-800 mb-1">Technical Skills</h5>
                    <ul className="list-disc list-inside space-y-1">
                      {getSafeArray(jobDescription.requiredSkills?.technical).map((skill, index) => (
                        <li key={index} className="text-sm text-gray-600">{skill}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-800 mb-1">Programming Languages</h5>
                    <ul className="list-disc list-inside space-y-1">
                      {getSafeArray(jobDescription.requiredSkills?.programming).map((skill, index) => (
                        <li key={index} className="text-sm text-gray-600">{skill}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Tools & Technologies</h4>
                <div className="flex flex-wrap gap-2">
                  {getSafeArray(jobDescription.requiredSkills?.tools).map((tool, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tool}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Salary Range</h4>
                <p className="text-sm text-gray-700">{jobDescription.salaryRange}</p>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Educational Requirements</h4>
                <ul className="list-disc list-inside space-y-1">
                  {getSafeArray(jobDescription.educationalRequirements).map((requirement, index) => (
                    <li key={index} className="text-sm text-gray-700">{requirement}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Benefits</h4>
                <ul className="list-disc list-inside space-y-1">
                  {getSafeArray(jobDescription.benefits).map((benefit, index) => (
                    <li key={index} className="text-sm text-gray-700">{benefit}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AISuggestionsPage;
