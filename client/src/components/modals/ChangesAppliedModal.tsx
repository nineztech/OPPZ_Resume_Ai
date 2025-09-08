import React from 'react';
import { X, CheckCircle, Wand2, TrendingUp, FileText, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ChangesAppliedModalProps {
  isOpen: boolean;
  onClose: () => void;
  improvementSummary: any;
  atsResults: any;
}

const ChangesAppliedModal: React.FC<ChangesAppliedModalProps> = ({
  isOpen,
  onClose,
  improvementSummary,
  atsResults
}) => {
  if (!isOpen) return null;

  // Debug logging
  console.log('ChangesAppliedModal - improvementSummary:', improvementSummary);
  console.log('ChangesAppliedModal - atsResults:', atsResults);

  // Safely extract data with fallbacks
  const safeImprovementAreas = Array.isArray(improvementSummary?.improvement_areas) 
    ? improvementSummary.improvement_areas 
    : [];
  
  const safeFieldsImproved = Array.isArray(improvementSummary?.fields_improved) 
    ? improvementSummary.fields_improved 
    : [];
  
  const safeRecommendations = Array.isArray(atsResults?.recommendations) 
    ? atsResults.recommendations 
    : [];

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 65) return 'text-blue-600';
    if (score >= 45) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800';
    if (score >= 65) return 'bg-blue-100 text-blue-800';
    if (score >= 45) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <Wand2 className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Resume Improvements Applied</h2>
              <p className="text-sm text-gray-600">Your resume has been enhanced based on ATS analysis</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Improvement Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <span>Improvement Summary</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {improvementSummary?.total_changes || 0}
                  </div>
                  <div className="text-sm text-green-800">Total Changes</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {safeImprovementAreas.length}
                  </div>
                  <div className="text-sm text-blue-800">Areas Improved</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {safeFieldsImproved.length}
                  </div>
                  <div className="text-sm text-purple-800">Fields Enhanced</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ATS Score Improvement */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-blue-600" />
                <span>ATS Score Analysis</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <FileText className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Overall ATS Score</div>
                      <div className="text-sm text-gray-600">Based on comprehensive analysis</div>
                    </div>
                  </div>
                  <Badge className={`${getScoreBadgeColor(atsResults?.overall_score || 0)} text-lg px-3 py-1`}>
                    {atsResults?.overall_score || 0}/100
                  </Badge>
                </div>

                {/* Category Scores */}
                {atsResults?.category_scores && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {Object.entries(atsResults.category_scores).map(([category, score]) => (
                      <div key={category} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                        <div className="text-sm font-medium text-gray-700 capitalize">
                          {category.replace(/_/g, ' ')}
                        </div>
                        <Badge className={getScoreBadgeColor(score as number)}>
                          {score as number}/100
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Applied Changes Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span>Applied Changes</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Areas Improved */}
                {safeImprovementAreas.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Areas Improved:</h4>
                    <div className="flex flex-wrap gap-2">
                      {safeImprovementAreas.map((area: any, index: number) => (
                        <Badge key={index} className="bg-green-100 text-green-800">
                          {typeof area === 'string' ? area : JSON.stringify(area)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Fields Enhanced */}
                {safeFieldsImproved.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Fields Enhanced:</h4>
                    <div className="flex flex-wrap gap-2">
                      {safeFieldsImproved.map((field: any, index: number) => (
                        <Badge key={index} className="bg-blue-100 text-blue-800">
                          {typeof field === 'string' ? field : JSON.stringify(field)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Key Improvements from ATS Analysis */}
                {safeRecommendations.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Key Improvements Applied:</h4>
                    <ul className="space-y-2">
                      {safeRecommendations.slice(0, 5).map((recommendation: any, index: number) => (
                        <li key={index} className="flex items-start space-x-2 text-sm text-gray-700">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{typeof recommendation === 'string' ? recommendation : JSON.stringify(recommendation)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={onClose}
              className="px-6"
            >
              Continue to Resume Builder
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangesAppliedModal;
