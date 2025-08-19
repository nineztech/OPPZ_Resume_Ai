import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  X, 
  Sparkles, 
  Target, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  BookOpen,
  Briefcase,
  Award,
  Settings,
  Eye,
  ChevronDown,
  ChevronUp,
  Star,
  Lightbulb,
  ArrowRight
} from 'lucide-react';
import type { AISuggestions, AIJobDescription } from '@/services/geminiParserService';

interface AISuggestionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  suggestions: AISuggestions;
  jobDescription: AIJobDescription;
  onApplyChanges: () => void;
}

const AISuggestionsModal: React.FC<AISuggestionsModalProps> = ({
  isOpen,
  onClose,
  suggestions,
  jobDescription,
  onApplyChanges
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    skills: true,
    experience: false,
    suggestions: false,
    jobDesc: false
  });

  if (!isOpen) return null;

  // Helper function to safely get arrays from suggestions
  const getSafeArray = (array: any[] | undefined): any[] => {
    return Array.isArray(array) ? array : [];
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">AI Resume Analysis</h2>
              <p className="text-sm text-gray-600">Personalized suggestions for {jobDescription.jobTitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Score Overview */}
        <div className="p-6 border-b border-gray-100 flex-shrink-0">
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
            {/* <Button
              onClick={onApplyChanges}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              <Star className="w-4 h-4 mr-2" />
              Apply to Resume
            </Button> */}
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-100 flex-shrink-0">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
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
        <div className="flex-1 overflow-y-auto p-6">
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
                    Top Industry-Specific Tips
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3">
                    {getSafeArray(suggestions.industrySpecificTips).slice(0, 4).map((tip, index) => (
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
                  <CardTitle>Skills to Add/Highlight</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Skills to Add</h4>
                      <div className="space-y-1">
                        {getSafeArray(suggestions.skillsAnalysis?.skillsToAdd).map((skill, index) => (
                          <div key={index} className="text-sm text-gray-700 flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            {skill}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Skills to Highlight</h4>
                      <div className="space-y-1">
                        {getSafeArray(suggestions.skillsAnalysis?.skillsToHighlight).map((skill, index) => (
                          <div key={index} className="text-sm text-gray-700 flex items-center gap-2">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                            {skill}
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
                  <CardTitle className="text-green-700">Relevant Experience</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {getSafeArray(suggestions.experienceAnalysis?.relevantExperience).map((exp, index) => (
                      <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        {exp}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-amber-700">Experience Gaps & Enhancements</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Experience Gaps</h4>
                      <ul className="space-y-1">
                        {getSafeArray(suggestions.experienceAnalysis?.experienceGaps).map((gap, index) => (
                          <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                            {gap}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Enhancement Suggestions</h4>
                      <ul className="space-y-1">
                        {getSafeArray(suggestions.experienceAnalysis?.experienceEnhancements).map((enhancement, index) => (
                          <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                            <Lightbulb className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                            {enhancement}
                          </li>
                        ))}
                      </ul>
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
                  <CardTitle>Keyword Optimization</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Present Keywords</h4>
                      <div className="flex flex-wrap gap-1">
                        {getSafeArray(suggestions.keywordOptimization?.presentKeywords).map((keyword, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Missing Keywords</h4>
                      <div className="flex flex-wrap gap-1">
                        {getSafeArray(suggestions.keywordOptimization?.missingKeywords).map((keyword, index) => (
                          <Badge key={index} variant="outline" className="text-xs border-red-300 text-red-700">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <h4 className="font-medium text-gray-900 mb-2">Keyword Density Tips</h4>
                    <ul className="space-y-1">
                      {getSafeArray(suggestions.keywordOptimization?.keywordDensityTips).map((tip, index) => (
                        <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                          <Lightbulb className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Format Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Structure</h4>
                      <ul className="space-y-1">
                        {getSafeArray(suggestions.formatRecommendations?.structure).map((item, index) => (
                          <li key={index} className="text-sm text-gray-700">• {item}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Design</h4>
                      <ul className="space-y-1">
                        {getSafeArray(suggestions.formatRecommendations?.design).map((item, index) => (
                          <li key={index} className="text-sm text-gray-700">• {item}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">ATS Optimization</h4>
                      <ul className="space-y-1">
                        {getSafeArray(suggestions.formatRecommendations?.atsOptimization).map((item, index) => (
                          <li key={index} className="text-sm text-gray-700">• {item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'action-plan' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-red-200">
                  <CardHeader>
                    <CardTitle className="text-red-700 flex items-center gap-2">
                      <Target className="w-5 h-5" />
                      Immediate Actions
                    </CardTitle>
                    <CardDescription>Do these now</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {getSafeArray(suggestions.actionPlan?.immediate).map((action, index) => (
                        <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                          {action}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-yellow-200">
                  <CardHeader>
                    <CardTitle className="text-yellow-700 flex items-center gap-2">
                      <BookOpen className="w-5 h-5" />
                      Short-term Goals
                    </CardTitle>
                    <CardDescription>Next 1-2 weeks</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {getSafeArray(suggestions.actionPlan?.shortTerm).map((action, index) => (
                        <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                          {action}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-green-200">
                  <CardHeader>
                    <CardTitle className="text-green-700 flex items-center gap-2">
                      <Award className="w-5 h-5" />
                      Long-term Development
                    </CardTitle>
                    <CardDescription>Next 1-3 months</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {getSafeArray(suggestions.actionPlan?.longTerm).map((action, index) => (
                        <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                          {action}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
                <CardHeader>
                  <CardTitle className="text-purple-700 flex items-center gap-2">
                    <Star className="w-5 h-5" />
                    Your Unique Strengths
                  </CardTitle>
                  <CardDescription>Build confidence with these points</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Key Strengths</h4>
                      <ul className="space-y-1">
                        {getSafeArray(suggestions.confidenceBoost?.strengths).map((strength, index) => (
                          <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                            <Star className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                            {strength}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Unique Value</h4>
                      <ul className="space-y-1">
                        {getSafeArray(suggestions.confidenceBoost?.uniqueValue).map((value, index) => (
                          <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                            <Sparkles className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                            {value}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 flex justify-between flex-shrink-0">
          <Button variant="outline" onClick={onClose}>
            Review Later
          </Button>
          <div className="flex gap-3">
            <Button variant="outline">
              <Eye className="w-4 h-4 mr-2" />
              View Job Description
            </Button>
            <Button 
              onClick={onApplyChanges}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Apply Suggestions
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AISuggestionsModal;
