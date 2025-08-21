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
  Star,
  Lightbulb
} from 'lucide-react';
import type { AISuggestions, AIJobDescription } from '@/services/geminiParserService';

// Extended interface for the new comprehensive AI suggestions structure
interface ExtendedAISuggestions extends Omit<AISuggestions, 'actionPlan' | 'atsCompatibility'> {
  jobMatchAnalysis?: {
    alignmentScore?: number;
    roleCompatibility?: string;
    experienceLevelMatch?: string;
  };
  sectionAnalysis?: {
    professionalSummary?: {
      score?: number;
      status?: string;
      strengths?: string[];
      improvements?: string[];
      suggestedRewrite?: string;
    };
    skillsSection?: {
      score?: number;
      status?: string;
      missingCriticalSkills?: string[];
      skillGapAnalysis?: {
        technical?: { score?: number };
        soft?: { score?: number };
        leadership?: { score?: number };
      };
    };
    workExperience?: {
      score?: number;
      status?: string;
      achievementAnalysis?: {
        quantified?: number;
        qualitative?: number;
        recommendation?: string;
      };
      careerProgression?: {
        trend?: string;
        recommendations?: string;
      };
    };
    educationSection?: {
      score?: number;
      relevanceScore?: number;
      recommendations?: string[];
    };
    certifications?: {
      score?: number;
      priorityLevel?: string;
      suggestedCertifications?: string[];
    };
  };
  keywordAnalysis?: {
    overallDensity?: number;
    matchedKeywords?: string[];
    missingKeywords?: string[];
    keywordImportance?: {
      critical?: string[];
      important?: string[];
      niceToHave?: string[];
    };
    keywordPlacement?: {
      summary?: { count?: number; density?: string; recommendations?: string };
      skills?: { count?: number; density?: string; recommendations?: string };
      experience?: { count?: number; density?: string; recommendations?: string };
    };
  };
  competitiveAnalysis?: {
    percentileRanking?: number;
    marketPosition?: string;
    marketDemandAlignment?: number;
    strengthsVsCompetition?: string[];
    areasToOutperform?: string[];
    competitiveAdvantage?: string[];
  };
  industryBenchmarks?: {
    averageScore?: number;
    topPerformerScore?: number;
    targetScore?: number;
    yourPosition?: string;
    improvementPotential?: string;
  };
  recommendedResources?: {
    skillDevelopment?: string[];
    resumeTools?: string[];
    careerAdvancement?: string[];
  };
  improvementPriority?: Array<{
    priority?: number;
    section?: string;
    action?: string;
    estimatedImpact?: string;
    timeToComplete?: string;
    difficultyLevel?: string;
    expectedScoreIncrease?: number;
  }>;
  resumeStrengths?: {
    topStrengths?: string[];
    uniqueSellingPoints?: string[];
    standoutQualities?: string[];
  };
  resumeWeaknesses?: {
    criticalIssues?: string[];
  };
  atsCompatibility?: {
    score?: number;
    passRate?: string;
    strengths?: string[];
    improvements?: string[];
    keywordDensity?: {
      matchPercentage?: number;
      criticalMissing?: number;
    };
  };
  actionPlan?: {
    immediateActions?: string[];
    shortTermGoals?: string[];
    longTermGoals?: string[];
  };
}

interface AISuggestionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  suggestions: ExtendedAISuggestions;
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

  if (!isOpen) return null;

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
    { id: 'sections', label: 'Section Analysis', icon: Settings },
    { id: 'keywords', label: 'Keywords & ATS', icon: TrendingUp },
    { id: 'competitive', label: 'Market Analysis', icon: Briefcase },
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
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className={`text-3xl font-bold px-4 py-2 rounded-lg ${getScoreColor(suggestions.overallScore)}`}>
                  {suggestions.overallScore || 0}%
                </div>
                <p className="text-sm text-gray-600 mt-1">Overall Score</p>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold px-3 py-2 rounded-lg ${getScoreColor(suggestions.atsCompatibility?.score)}`}>
                  {suggestions.atsCompatibility?.score || 0}%
                </div>
                <p className="text-sm text-gray-600 mt-1">ATS Score</p>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold px-3 py-2 rounded-lg ${getScoreColor(suggestions.jobMatchAnalysis?.alignmentScore)}`}>
                  {suggestions.jobMatchAnalysis?.alignmentScore || 0}%
                </div>
                <p className="text-sm text-gray-600 mt-1">Job Match</p>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold px-3 py-2 rounded-lg bg-blue-100 text-blue-600">
                  {suggestions.jobMatchAnalysis?.roleCompatibility || 'N/A'}
                </div>
                <p className="text-sm text-gray-600 mt-1">Compatibility</p>
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
                      Resume Strengths ({getSafeArray(suggestions.resumeStrengths?.topStrengths).length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1">
                      {getSafeArray(suggestions.resumeStrengths?.topStrengths).slice(0, 4).map((strength, index) => (
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
                      Critical Issues ({getSafeArray(suggestions.resumeWeaknesses?.criticalIssues).length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1">
                      {getSafeArray(suggestions.resumeWeaknesses?.criticalIssues).slice(0, 4).map((issue, index) => (
                        <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                          {issue}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-purple-600" />
                    Unique Selling Points
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3">
                    {getSafeArray(suggestions.resumeStrengths?.uniqueSellingPoints).slice(0, 4).map((point, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                        <Star className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{point}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    Market Position
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {suggestions.competitiveAnalysis?.percentileRanking || 0}
                      </div>
                      <p className="text-sm text-gray-600">Percentile Ranking</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-lg font-bold text-green-600">
                        {suggestions.competitiveAnalysis?.marketPosition || 'N/A'}
                      </div>
                      <p className="text-sm text-gray-600">Market Position</p>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">
                        {suggestions.competitiveAnalysis?.marketDemandAlignment || 0}%
                      </div>
                      <p className="text-sm text-gray-600">Market Alignment</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'sections' && (
            <div className="space-y-6">
              {/* Professional Summary */}
              {suggestions.sectionAnalysis?.professionalSummary && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-blue-600" />
                        Professional Summary
                      </div>
                      <Badge className={getScoreColor(suggestions.sectionAnalysis.professionalSummary.score)}>
                        {suggestions.sectionAnalysis.professionalSummary.score || 0}/100
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      Status: {suggestions.sectionAnalysis.professionalSummary.status || 'N/A'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-green-700 mb-2">Strengths</h4>
                        <ul className="space-y-1">
                          {getSafeArray(suggestions.sectionAnalysis.professionalSummary.strengths).map((strength, index) => (
                            <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                              {strength}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium text-amber-700 mb-2">Improvements</h4>
                        <ul className="space-y-1">
                          {getSafeArray(suggestions.sectionAnalysis.professionalSummary.improvements).map((improvement, index) => (
                            <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                              <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                              {improvement}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    {suggestions.sectionAnalysis.professionalSummary.suggestedRewrite && (
                      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-medium text-blue-700 mb-2">Suggested Rewrite</h4>
                        <p className="text-sm text-gray-700 italic">
                          {suggestions.sectionAnalysis.professionalSummary.suggestedRewrite}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Skills Section */}
              {suggestions.sectionAnalysis?.skillsSection && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Settings className="w-5 h-5 text-green-600" />
                        Skills Section
                      </div>
                      <Badge className={getScoreColor(suggestions.sectionAnalysis.skillsSection.score)}>
                        {suggestions.sectionAnalysis.skillsSection.score || 0}/100
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      Status: {suggestions.sectionAnalysis.skillsSection.status || 'N/A'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {suggestions.sectionAnalysis.skillsSection.missingCriticalSkills && (
                        <div>
                          <h4 className="font-medium text-red-700 mb-2">Missing Critical Skills</h4>
                          <div className="flex flex-wrap gap-2">
                            {getSafeArray(suggestions.sectionAnalysis.skillsSection.missingCriticalSkills).map((skill, index) => (
                              <Badge key={index} variant="destructive" className="bg-red-100 text-red-800">
                                <AlertTriangle className="w-3 h-3 mr-1" />
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {suggestions.sectionAnalysis.skillsSection.skillGapAnalysis && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="text-center p-4 bg-blue-50 rounded-lg">
                            <div className="text-2xl font-bold text-blue-600">
                              {suggestions.sectionAnalysis.skillsSection.skillGapAnalysis.technical?.score || 0}
                            </div>
                            <p className="text-sm text-gray-600">Technical Skills</p>
                          </div>
                          <div className="text-center p-4 bg-green-50 rounded-lg">
                            <div className="text-2xl font-bold text-green-600">
                              {suggestions.sectionAnalysis.skillsSection.skillGapAnalysis.soft?.score || 0}
                            </div>
                            <p className="text-sm text-gray-600">Soft Skills</p>
                          </div>
                          <div className="text-center p-4 bg-purple-50 rounded-lg">
                            <div className="text-2xl font-bold text-purple-600">
                              {suggestions.sectionAnalysis.skillsSection.skillGapAnalysis.leadership?.score || 0}
                            </div>
                            <p className="text-sm text-gray-600">Leadership</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Work Experience */}
              {suggestions.sectionAnalysis?.workExperience && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-5 h-5 text-purple-600" />
                        Work Experience
                      </div>
                      <Badge className={getScoreColor(suggestions.sectionAnalysis.workExperience.score)}>
                        {suggestions.sectionAnalysis.workExperience.score || 0}/100
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      Status: {suggestions.sectionAnalysis.workExperience.status || 'N/A'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {suggestions.sectionAnalysis.workExperience.achievementAnalysis && (
                        <div className="space-y-3">
                          <h4 className="font-medium text-gray-900">Achievement Analysis</h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="text-center p-3 bg-green-50 rounded-lg">
                              <div className="text-xl font-bold text-green-600">
                                {suggestions.sectionAnalysis.workExperience.achievementAnalysis.quantified || 0}
                              </div>
                              <p className="text-xs text-gray-600">Quantified</p>
                            </div>
                            <div className="text-center p-3 bg-yellow-50 rounded-lg">
                              <div className="text-xl font-bold text-yellow-600">
                                {suggestions.sectionAnalysis.workExperience.achievementAnalysis.qualitative || 0}
                              </div>
                              <p className="text-xs text-gray-600">Qualitative</p>
                            </div>
                          </div>
                          <div className="p-3 bg-blue-50 rounded-lg">
                            <p className="text-sm text-gray-700">
                              {suggestions.sectionAnalysis.workExperience.achievementAnalysis.recommendation}
                            </p>
                          </div>
                        </div>
                      )}
                      
                      {suggestions.sectionAnalysis.workExperience.careerProgression && (
                        <div className="space-y-3">
                          <h4 className="font-medium text-gray-900">Career Progression</h4>
                          <div className="text-center p-3 bg-gray-50 rounded-lg">
                            <div className={`text-xl font-bold ${
                              suggestions.sectionAnalysis.workExperience.careerProgression.trend === 'Positive' ? 'text-green-600' :
                              suggestions.sectionAnalysis.workExperience.careerProgression.trend === 'Negative' ? 'text-red-600' :
                              'text-yellow-600'
                            }`}>
                              {suggestions.sectionAnalysis.workExperience.careerProgression.trend || 'N/A'}
                            </div>
                            <p className="text-xs text-gray-600">Trend</p>
                          </div>
                          <div className="p-3 bg-blue-50 rounded-lg">
                            <p className="text-sm text-gray-700">
                              {suggestions.sectionAnalysis.workExperience.careerProgression.recommendations}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Education & Certifications */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {suggestions.sectionAnalysis?.educationSection && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Award className="w-5 h-5 text-blue-600" />
                          Education
                        </div>
                        <Badge className={getScoreColor(suggestions.sectionAnalysis.educationSection.score)}>
                          {suggestions.sectionAnalysis.educationSection.score || 0}/100
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                          <div className="text-lg font-bold text-blue-600">
                            {suggestions.sectionAnalysis.educationSection.relevanceScore || 0}%
                          </div>
                          <p className="text-xs text-gray-600">Relevance Score</p>
                        </div>
                        <div className="space-y-1">
                          {getSafeArray(suggestions.sectionAnalysis.educationSection.recommendations).slice(0, 3).map((rec, index) => (
                            <div key={index} className="text-sm text-gray-700 flex items-start gap-2">
                              <Lightbulb className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                              {rec}
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {suggestions.sectionAnalysis?.certifications && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Award className="w-5 h-5 text-green-600" />
                          Certifications
                        </div>
                        <Badge className={getScoreColor(suggestions.sectionAnalysis.certifications.score)}>
                          {suggestions.sectionAnalysis.certifications.score || 0}/100
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                          <div className="text-lg font-bold text-green-600">
                            {suggestions.sectionAnalysis.certifications.priorityLevel || 'N/A'}
                          </div>
                          <p className="text-xs text-gray-600">Priority Level</p>
                        </div>
                        {suggestions.sectionAnalysis.certifications.suggestedCertifications && (
                          <div className="space-y-1">
                            <h5 className="font-medium text-sm text-gray-900">Suggested Certifications:</h5>
                            {getSafeArray(suggestions.sectionAnalysis.certifications.suggestedCertifications).slice(0, 3).map((cert, index) => (
                              <div key={index} className="text-sm text-gray-700 flex items-start gap-2">
                                <Star className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                {cert}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}

          {activeTab === 'keywords' && (
            <div className="space-y-6">
              {/* ATS Compatibility Enhanced */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    ATS Compatibility Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {suggestions.atsCompatibility?.score || 0}%
                      </div>
                      <p className="text-sm text-gray-600">ATS Score</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-lg font-bold text-green-600">
                        {suggestions.atsCompatibility?.passRate || 'N/A'}
                      </div>
                      <p className="text-sm text-gray-600">Pass Rate</p>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">
                        {suggestions.atsCompatibility?.keywordDensity?.matchPercentage || 0}%
                      </div>
                      <p className="text-sm text-gray-600">Keyword Match</p>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">
                        {suggestions.atsCompatibility?.keywordDensity?.criticalMissing || 0}
                      </div>
                      <p className="text-sm text-gray-600">Critical Missing</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-green-700 mb-2">ATS Strengths</h4>
                      <ul className="space-y-1">
                        {getSafeArray(suggestions.atsCompatibility?.strengths).slice(0, 4).map((strength, index) => (
                          <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                            {strength}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-amber-700 mb-2">ATS Improvements</h4>
                      <ul className="space-y-1">
                        {getSafeArray(suggestions.atsCompatibility?.improvements).slice(0, 4).map((improvement, index) => (
                          <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                            {improvement}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Keyword Analysis */}
              {suggestions.keywordAnalysis && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="w-5 h-5 text-purple-600" />
                      Keyword Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="text-3xl font-bold text-gray-700">
                          {suggestions.keywordAnalysis.overallDensity || 0}%
                        </div>
                        <p className="text-sm text-gray-600">Overall Keyword Density</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium text-green-700 mb-3">Matched Keywords</h4>
                          <div className="flex flex-wrap gap-2">
                            {getSafeArray(suggestions.keywordAnalysis.matchedKeywords).map((keyword, index) => (
                              <Badge key={index} variant="secondary" className="bg-green-100 text-green-800">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                {keyword}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium text-red-700 mb-3">Missing Keywords</h4>
                          <div className="flex flex-wrap gap-2">
                            {getSafeArray(suggestions.keywordAnalysis.missingKeywords).map((keyword, index) => (
                              <Badge key={index} variant="destructive" className="bg-red-100 text-red-800">
                                <AlertTriangle className="w-3 h-3 mr-1" />
                                {keyword}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Keyword Importance */}
                      {suggestions.keywordAnalysis.keywordImportance && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <h5 className="font-medium text-red-600 mb-2">Critical Keywords</h5>
                            <div className="flex flex-wrap gap-1">
                              {getSafeArray(suggestions.keywordAnalysis.keywordImportance.critical).map((keyword, index) => (
                                <Badge key={index} variant="destructive" className="text-xs">
                                  {keyword}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div>
                            <h5 className="font-medium text-yellow-600 mb-2">Important Keywords</h5>
                            <div className="flex flex-wrap gap-1">
                              {getSafeArray(suggestions.keywordAnalysis.keywordImportance.important).map((keyword, index) => (
                                <Badge key={index} className="bg-yellow-100 text-yellow-800 text-xs">
                                  {keyword}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div>
                            <h5 className="font-medium text-blue-600 mb-2">Nice to Have</h5>
                            <div className="flex flex-wrap gap-1">
                              {getSafeArray(suggestions.keywordAnalysis.keywordImportance.niceToHave).map((keyword, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {keyword}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Keyword Placement */}
                      {suggestions.keywordAnalysis.keywordPlacement && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="p-4 bg-blue-50 rounded-lg">
                            <h5 className="font-medium text-blue-700 mb-2">Summary Section</h5>
                            <div className="text-2xl font-bold text-blue-600">
                              {suggestions.keywordAnalysis.keywordPlacement.summary?.count || 0}
                            </div>
                            <p className="text-sm text-gray-600">
                              Density: {suggestions.keywordAnalysis.keywordPlacement.summary?.density || 'N/A'}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {suggestions.keywordAnalysis.keywordPlacement.summary?.recommendations}
                            </p>
                          </div>
                          <div className="p-4 bg-green-50 rounded-lg">
                            <h5 className="font-medium text-green-700 mb-2">Skills Section</h5>
                            <div className="text-2xl font-bold text-green-600">
                              {suggestions.keywordAnalysis.keywordPlacement.skills?.count || 0}
                            </div>
                            <p className="text-sm text-gray-600">
                              Density: {suggestions.keywordAnalysis.keywordPlacement.skills?.density || 'N/A'}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {suggestions.keywordAnalysis.keywordPlacement.skills?.recommendations}
                            </p>
                          </div>
                          <div className="p-4 bg-purple-50 rounded-lg">
                            <h5 className="font-medium text-purple-700 mb-2">Experience Section</h5>
                            <div className="text-2xl font-bold text-purple-600">
                              {suggestions.keywordAnalysis.keywordPlacement.experience?.count || 0}
                            </div>
                            <p className="text-sm text-gray-600">
                              Density: {suggestions.keywordAnalysis.keywordPlacement.experience?.density || 'N/A'}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {suggestions.keywordAnalysis.keywordPlacement.experience?.recommendations}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {activeTab === 'competitive' && (
            <div className="space-y-6">
              {/* Competitive Analysis */}
              {suggestions.competitiveAnalysis && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-blue-600" />
                      Competitive Market Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-3xl font-bold text-blue-600">
                          {suggestions.competitiveAnalysis.percentileRanking || 0}
                        </div>
                        <p className="text-sm text-gray-600">Percentile Ranking</p>
                        <div className={`text-lg font-bold mt-2 ${
                          suggestions.competitiveAnalysis.marketPosition === 'Above Average' ? 'text-green-600' :
                          suggestions.competitiveAnalysis.marketPosition === 'Below Average' ? 'text-red-600' :
                          'text-yellow-600'
                        }`}>
                          {suggestions.competitiveAnalysis.marketPosition || 'N/A'}
                        </div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-3xl font-bold text-green-600">
                          {suggestions.competitiveAnalysis.marketDemandAlignment || 0}%
                        </div>
                        <p className="text-sm text-gray-600">Market Demand Alignment</p>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <div className="text-lg font-bold text-purple-600">
                          {suggestions.industryBenchmarks?.improvementPotential || 'N/A'}
                        </div>
                        <p className="text-sm text-gray-600">Improvement Potential</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium text-green-700 mb-3">Competitive Strengths</h4>
                        <ul className="space-y-2">
                          {getSafeArray(suggestions.competitiveAnalysis.strengthsVsCompetition).map((strength, index) => (
                            <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                              {strength}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium text-red-700 mb-3">Areas to Outperform Competition</h4>
                        <ul className="space-y-2">
                          {getSafeArray(suggestions.competitiveAnalysis.areasToOutperform).map((area, index) => (
                            <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                              <TrendingUp className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                              {area}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {suggestions.competitiveAnalysis.competitiveAdvantage && (
                      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-medium text-blue-700 mb-2">Your Competitive Advantages</h4>
                        <ul className="space-y-1">
                          {getSafeArray(suggestions.competitiveAnalysis.competitiveAdvantage).map((advantage, index) => (
                            <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                              <Star className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                              {advantage}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Industry Benchmarks */}
              {suggestions.industryBenchmarks && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-purple-600" />
                      Industry Benchmarks
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-gray-600">
                          {suggestions.industryBenchmarks.averageScore || 0}
                        </div>
                        <p className="text-sm text-gray-600">Industry Average</p>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {suggestions.industryBenchmarks.topPerformerScore || 0}
                        </div>
                        <p className="text-sm text-gray-600">Top Performers</p>
                      </div>
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {suggestions.industryBenchmarks.targetScore || 0}
                        </div>
                        <p className="text-sm text-gray-600">Your Target</p>
                      </div>
                      <div className="text-center p-4 bg-yellow-50 rounded-lg">
                        <div className="text-lg font-bold text-yellow-600">
                          {suggestions.industryBenchmarks.yourPosition || 'N/A'}
                        </div>
                        <p className="text-sm text-gray-600">Your Position</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Recommended Resources */}
              {suggestions.recommendedResources && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="w-5 h-5 text-green-600" />
                      Recommended Resources
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <h4 className="font-medium text-blue-700 mb-3">Skill Development</h4>
                        <ul className="space-y-2">
                          {getSafeArray(suggestions.recommendedResources.skillDevelopment).map((resource, index) => (
                            <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                              <BookOpen className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                              {resource}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium text-green-700 mb-3">Resume Tools</h4>
                        <ul className="space-y-2">
                          {getSafeArray(suggestions.recommendedResources.resumeTools).map((tool, index) => (
                            <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                              <Settings className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                              {tool}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium text-purple-700 mb-3">Career Advancement</h4>
                        <ul className="space-y-2">
                          {getSafeArray(suggestions.recommendedResources.careerAdvancement).map((resource, index) => (
                            <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                              <TrendingUp className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                              {resource}
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

          {activeTab === 'action-plan' && (
            <div className="space-y-6">
              {/* Priority Action Items */}
              {suggestions.improvementPriority && suggestions.improvementPriority.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-blue-600" />
                      Priority Action Items
                    </CardTitle>
                    <CardDescription>Ranked by impact and difficulty</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {suggestions.improvementPriority.slice(0, 5).map((item, index) => (
                        <div
                          key={index}
                          className={`p-4 rounded-lg border-l-4 ${
                            index === 0 ? 'border-red-500 bg-red-50' :
                            index === 1 ? 'border-yellow-500 bg-yellow-50' :
                            'border-green-500 bg-green-50'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                                index === 0 ? 'bg-red-500' :
                                index === 1 ? 'bg-yellow-500' :
                                'bg-green-500'
                              }`}>
                                {item.priority || index + 1}
                              </div>
                              <h4 className="font-medium text-gray-900">{item.section || 'N/A'}</h4>
                            </div>
                            <div className="flex gap-2">
                              <Badge className={
                                item.estimatedImpact === 'High' ? 'bg-red-100 text-red-800' :
                                item.estimatedImpact === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }>
                                {item.estimatedImpact || 'N/A'} Impact
                              </Badge>
                              <Badge variant="outline">
                                +{item.expectedScoreIncrease || 0} pts
                              </Badge>
                            </div>
                          </div>
                          <p className="text-sm text-gray-700 mb-2">{item.action || 'N/A'}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>⏱️ {item.timeToComplete || 'N/A'}</span>
                            <span>🎚️ {item.difficultyLevel || 'N/A'}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Time-based Action Plan */}
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
                      {getSafeArray(suggestions.actionPlan?.immediateActions).map((action, index) => (
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
                      {getSafeArray(suggestions.actionPlan?.shortTermGoals).map((action, index) => (
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
                      {getSafeArray(suggestions.actionPlan?.longTermGoals).map((action, index) => (
                        <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                          {action}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>

              {/* Resume Strengths */}
              <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
                <CardHeader>
                  <CardTitle className="text-purple-700 flex items-center gap-2">
                    <Star className="w-5 h-5" />
                    Your Resume Strengths
                  </CardTitle>
                  <CardDescription>Build confidence with these points</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Top Strengths</h4>
                      <ul className="space-y-1">
                        {getSafeArray(suggestions.resumeStrengths?.topStrengths).map((strength, index) => (
                          <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                            <Star className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                            {strength}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Standout Qualities</h4>
                      <ul className="space-y-1">
                        {getSafeArray(suggestions.resumeStrengths?.standoutQualities).map((quality, index) => (
                          <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                            <Sparkles className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                            {quality}
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
