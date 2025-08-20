import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft,
  Sparkles, 
  Target, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Briefcase,
  Settings,
  Eye,
  Star,
  Lightbulb,
  ArrowRight
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

  // Helper function to safely get arrays from suggestions
  const getSafeArray = (array: any[] | undefined): any[] => {
    return Array.isArray(array) ? array : [];
  };

  const getScoreColor = (score?: number) => {
    if (!score) return 'text-gray-600 bg-gray-100';
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Target },
    { id: 'skills', label: 'Skills Analysis', icon: Settings },
    { id: 'experience', label: 'Experience', icon: Briefcase },
    { id: 'optimization', label: 'Optimization', icon: TrendingUp },
    { id: 'action-plan', label: 'Action Plan', icon: CheckCircle }
  ];

  const handleApplyChanges = () => {
    // Check if we came from UseTemplatePage (has templateId and extractedData)
    if (state.templateId && state.extractedData) {
      // Navigate back to resume builder with AI suggestions and parsed data
      navigate('/resume/builder', {
        state: {
          templateId: state.templateId,
          selectedColor: state.selectedColor,
          mode: 'ai-enhanced',
          extractedData: state.aiResults?.resumeData || state.extractedData,
          aiSuggestions: state.suggestions,
          jobDescription: state.jobDescription,
          aiParams: state.aiResults?.parameters || {
            sector: state.sector,
            country: state.country,
            designation: state.designation
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
          resumeFile: state.resumeFile
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
                <div className={`text-3xl font-bold px-4 py-2 rounded-lg ${getScoreColor(suggestions.atsCompatibility?.score)}`}>
                  {suggestions.atsCompatibility?.score || 0}%
                </div>
                <p className="text-sm text-gray-600 mt-1">ATS Compatible</p>
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
                        Strengths ({getSafeArray(suggestions.atsCompatibility?.strengths).length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-1">
                        {getSafeArray(suggestions.atsCompatibility?.strengths).slice(0, 3).map((strength, index) => (
                          <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                            {strength}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-amber-700">
                        <AlertTriangle className="w-5 h-5" />
                        Areas to Improve ({getSafeArray(suggestions.atsCompatibility?.improvements).length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-1">
                        {getSafeArray(suggestions.atsCompatibility?.improvements).slice(0, 3).map((improvement, index) => (
                          <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                            {improvement}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="w-5 h-5 text-blue-600" />
                      Top Improvement Suggestions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3">
                      {getSafeArray((suggestions as any).improvementPriority || (suggestions as any).suggestions).slice(0, 4).map((tip, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                          <ArrowRight className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{tip}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'skills' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-green-700">Matching Skills</CardTitle>
                      <CardDescription>Skills you have that match the job requirements</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {getSafeArray(suggestions.skillsAnalysis?.matchingSkills).map((skill, index) => (
                          <Badge key={index} variant="secondary" className="bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-red-700">Missing Skills</CardTitle>
                      <CardDescription>Important skills missing from your resume</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {getSafeArray(suggestions.skillsAnalysis?.missingSkills).map((skill, index) => (
                          <Badge key={index} variant="destructive" className="bg-red-100 text-red-800">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Keyword Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Matched Keywords</h4>
                        <div className="space-y-1">
                          {getSafeArray((suggestions as any).keywordAnalysis?.matchedKeywords).map((keyword, index) => (
                            <div key={index} className="text-sm text-gray-700 flex items-center gap-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              {keyword}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Missing Keywords</h4>
                        <div className="space-y-1">
                          {getSafeArray((suggestions as any).keywordAnalysis?.missingKeywords).map((keyword, index) => (
                            <div key={index} className="text-sm text-gray-700 flex items-center gap-2">
                              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                              {keyword}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'experience' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-green-700">Experience Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Relevant Experience</h4>
                        <div className="text-sm text-gray-700 p-3 bg-green-50 rounded-lg">
                          {suggestions.experienceAnalysis?.relevantExperience || "Experience section available for review"}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Experience Gaps</h4>
                        <div className="text-sm text-gray-700 p-3 bg-amber-50 rounded-lg">
                          {suggestions.experienceAnalysis?.experienceGaps || "Enhance experience descriptions with quantifiable achievements and specific technologies used"}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'optimization' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Keyword Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Matched Keywords</h4>
                        <div className="flex flex-wrap gap-1">
                          {getSafeArray((suggestions as any).keywordAnalysis?.matchedKeywords).map((keyword, index) => (
                            <Badge key={index} variant="secondary" className="text-xs bg-green-100 text-green-800">
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Missing Keywords</h4>
                        <div className="space-y-1">
                          {getSafeArray((suggestions as any).keywordAnalysis?.missingKeywords).map((keyword, index) => (
                            <div key={index} className="text-sm text-gray-700 p-2 bg-red-50 rounded">
                              {keyword}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>ATS Compatibility Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-center">
                        <div className={`text-4xl font-bold px-6 py-4 rounded-lg ${getScoreColor(suggestions.atsCompatibility?.score)}`}>
                          {suggestions.atsCompatibility?.score || 0}%
                        </div>
                      </div>
                      <div className="text-center text-gray-600">
                        ATS Compatibility Score
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
                      {getSafeArray((suggestions as any).improvementPriority || (suggestions as any).suggestions).map((action, index) => (
                        <div key={index} className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                          <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                            {index + 1}
                          </div>
                          <span className="text-sm text-gray-700 flex-1">{action}</span>
                        </div>
                      ))}
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
                          Review and implement priority suggestions
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                          Update resume with missing keywords
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                          Enhance experience descriptions
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
                <p className="text-sm text-gray-700">{state.aiResults?.jobDescription?.jobTitle || jobDescription.jobTitle}</p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Job Summary</h4>
                <p className="text-sm text-gray-700 whitespace-pre-line">{state.aiResults?.jobDescription?.jobSummary}</p>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Key Responsibilities</h4>
                <ul className="list-disc list-inside space-y-1">
                  {getSafeArray(state.aiResults?.jobDescription?.keyResponsibilities).map((responsibility, index) => (
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
                      {getSafeArray(state.aiResults?.jobDescription?.requiredSkills?.technical).map((skill, index) => (
                        <li key={index} className="text-sm text-gray-600">{skill}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-800 mb-1">Programming Languages</h5>
                    <ul className="list-disc list-inside space-y-1">
                      {getSafeArray(state.aiResults?.jobDescription?.requiredSkills?.programming).map((skill, index) => (
                        <li key={index} className="text-sm text-gray-600">{skill}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Tools & Technologies</h4>
                <div className="flex flex-wrap gap-2">
                  {getSafeArray(state.aiResults?.jobDescription?.requiredSkills?.tools).map((tool, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tool}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Experience Level</h4>
                <p className="text-sm text-gray-700">{state.aiResults?.jobDescription?.experienceLevel}</p>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Salary Range</h4>
                <p className="text-sm text-gray-700">{state.aiResults?.jobDescription?.salaryRange}</p>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Educational Requirements</h4>
                <ul className="list-disc list-inside space-y-1">
                  {getSafeArray(state.aiResults?.jobDescription?.educationalRequirements).map((requirement, index) => (
                    <li key={index} className="text-sm text-gray-700">{requirement}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Benefits</h4>
                <ul className="list-disc list-inside space-y-1">
                  {getSafeArray(state.aiResults?.jobDescription?.benefits).map((benefit, index) => (
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
