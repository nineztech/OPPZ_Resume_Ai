import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle, 
  AlertCircle, 
  Lightbulb, 
  Eye,
  EyeOff
} from 'lucide-react';
import type { AppliedSuggestion, ParsedResumeData } from '@/services/suggestionApplierService';
import { suggestionApplicationService, type ResumeData } from '@/services/suggestionApplicationService';

interface ApplySuggestionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  suggestions: AppliedSuggestion[];
  originalResumeData: ParsedResumeData;
  onApplySuggestions: (updatedResumeData: ResumeData, appliedChanges: any[]) => void;
}

const ApplySuggestionsModal: React.FC<ApplySuggestionsModalProps> = ({
  isOpen,
  onClose,
  suggestions,
  originalResumeData,
  onApplySuggestions
}) => {
  const [selectedSuggestions, setSelectedSuggestions] = useState<Set<string>>(new Set());
  const [showPreview, setShowPreview] = useState(false);
  const [previewResumeData, setPreviewResumeData] = useState<ResumeData | null>(null);
  const [convertedResumeData, setConvertedResumeData] = useState<ResumeData | null>(null);

  const handleSuggestionToggle = (suggestionId: string) => {
    const newSelected = new Set(selectedSuggestions);
    if (newSelected.has(suggestionId)) {
      newSelected.delete(suggestionId);
    } else {
      newSelected.add(suggestionId);
    }
    setSelectedSuggestions(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedSuggestions.size === suggestions.length) {
      setSelectedSuggestions(new Set());
    } else {
      setSelectedSuggestions(new Set(suggestions.map(s => s.id)));
    }
  };

  // Convert parsed data to resume data format on component mount
  React.useEffect(() => {
    if (originalResumeData && !convertedResumeData) {
      const converted = suggestionApplicationService.convertParsedDataToResumeData(originalResumeData);
      setConvertedResumeData(converted);
      console.log('Converted resume data:', converted);
    }
  }, [originalResumeData, convertedResumeData]);

  const handlePreview = () => {
    if (!convertedResumeData) {
      console.error('No converted resume data available for preview');
      return;
    }

    const selectedSuggestionObjects = suggestions.filter(s => selectedSuggestions.has(s.id));
    console.log('Previewing with selected suggestions:', selectedSuggestionObjects);
    
    // Use the suggestion application service to apply changes
    const result = suggestionApplicationService.applySuggestionsToResume(
      convertedResumeData,
      selectedSuggestionObjects
    );
    
    if (result.success) {
      console.log('Preview data created:', result.updatedResumeData);
      setPreviewResumeData(result.updatedResumeData);
      setShowPreview(true);
    } else {
      console.error('Failed to create preview:', result.error);
    }
  };

  const handleApply = () => {
    if (!convertedResumeData) {
      console.error('No converted resume data available for application');
      return;
    }

    const selectedSuggestionObjects = suggestions.filter(s => selectedSuggestions.has(s.id));
    console.log('Applying suggestions:', selectedSuggestionObjects);
    
    // Use the suggestion application service to apply changes
    const result = suggestionApplicationService.applySuggestionsToResume(
      convertedResumeData,
      selectedSuggestionObjects
    );
    
    if (result.success) {
      console.log('Suggestions applied successfully:', result.appliedChanges);
      onApplySuggestions(result.updatedResumeData, result.appliedChanges);
      onClose();
    } else {
      console.error('Failed to apply suggestions:', result.error);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'achievements_impact_metrics':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'clarity_brevity':
        return <AlertCircle className="w-4 h-4 text-blue-500" />;
      case 'formatting_layout_ats':
        return <CheckCircle className="w-4 h-4 text-purple-500" />;
      case 'keyword_usage_placement':
        return <Lightbulb className="w-4 h-4 text-yellow-500" />;
      case 'repetition_avoidance':
        return <AlertCircle className="w-4 h-4 text-orange-500" />;
      case 'skills_match_alignment':
        return <CheckCircle className="w-4 h-4 text-indigo-500" />;
      case 'test':
        return <Lightbulb className="w-4 h-4 text-blue-500" />;
      default:
        return <Lightbulb className="w-4 h-4 text-gray-500" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'achievements_impact_metrics':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'clarity_brevity':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'formatting_layout_ats':
        return 'bg-purple-50 border-purple-200 text-purple-800';
      case 'keyword_usage_placement':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'repetition_avoidance':
        return 'bg-orange-50 border-orange-200 text-orange-800';
      case 'skills_match_alignment':
        return 'bg-indigo-50 border-indigo-200 text-indigo-800';
      case 'test':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const formatCategoryName = (category: string) => {
    return category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Lightbulb className="w-5 h-5 text-yellow-500" />
            <span>Apply ATS Suggestions</span>
          </DialogTitle>
          <DialogDescription>
            Review and select which suggestions to apply to improve your resume's ATS compatibility.
          </DialogDescription>
        </DialogHeader>

        <div className="flex space-x-4">
          {/* Left Panel - Suggestions List */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Available Suggestions</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
              >
                {selectedSuggestions.size === suggestions.length ? 'Deselect All' : 'Select All'}
              </Button>
            </div>

            <ScrollArea className="h-96">
              <div className="space-y-3">
                {suggestions.map((suggestion) => (
                  <Card 
                    key={suggestion.id}
                    className={`cursor-pointer transition-all ${
                      selectedSuggestions.has(suggestion.id) 
                        ? 'ring-2 ring-blue-500 bg-blue-50' 
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => handleSuggestionToggle(suggestion.id)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start space-x-3">
                        <Checkbox
                          checked={selectedSuggestions.has(suggestion.id)}
                          onChange={() => handleSuggestionToggle(suggestion.id)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            {getCategoryIcon(suggestion.category)}
                            <Badge 
                              variant="outline" 
                              className={getCategoryColor(suggestion.category)}
                            >
                              {formatCategoryName(suggestion.category)}
                            </Badge>
                          </div>
                          <CardTitle className="text-sm font-medium text-gray-900">
                            Suggestion
                          </CardTitle>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-gray-600 mb-2">
                            {suggestion.suggestion}
                          </p>
                        </div>
                        
                        <Separator />
                        
                        <div className="space-y-2">
                          <div>
                            <p className="text-xs font-medium text-gray-500 mb-1">Original:</p>
                            <p className="text-xs text-gray-700 bg-gray-100 p-2 rounded whitespace-pre-wrap">
                              {suggestion.originalText}
                            </p>
                          </div>
                          
                          <div>
                            <p className="text-xs font-medium text-green-600 mb-1">Improved:</p>
                            <p className="text-xs text-gray-700 bg-green-50 p-2 rounded border border-green-200 whitespace-pre-wrap">
                              {suggestion.improvedText}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Right Panel - Preview */}
          <div className="w-80">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Preview</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreview}
                disabled={selectedSuggestions.size === 0}
              >
                {showPreview ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                {showPreview ? 'Hide Preview' : 'Preview Changes'}
              </Button>
            </div>

            {showPreview && previewResumeData ? (
              <ScrollArea className="h-96">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Resume Preview</CardTitle>
                    <p className="text-xs text-gray-500">Changes applied to your resume</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Basic Details</h4>
                      <div className="text-xs space-y-1">
                        <p><span className="font-medium">Name:</span> {previewResumeData.basicDetails.fullName}</p>
                        <p><span className="font-medium">Title:</span> {previewResumeData.basicDetails.title}</p>
                        <p><span className="font-medium">Email:</span> {previewResumeData.basicDetails.email}</p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Summary</h4>
                      <p className="text-xs text-gray-600 bg-blue-50 p-2 rounded whitespace-pre-wrap">
                        {previewResumeData.summary}
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Experience</h4>
                      <div className="space-y-2">
                        {previewResumeData.experience.slice(0, 2).map((exp, index) => (
                          <div key={index} className="text-xs bg-gray-50 p-2 rounded">
                            <p className="font-medium">{exp.position} at {exp.company}</p>
                            <p className="text-gray-600 mt-1 whitespace-pre-wrap">{exp.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </ScrollArea>
            ) : (
              <div className="h-96 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <Eye className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">Select suggestions to preview changes</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="flex justify-between">
          <div className="text-sm text-gray-500">
            {selectedSuggestions.size} of {suggestions.length} suggestions selected
          </div>
          <div className="space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleApply}
              disabled={selectedSuggestions.size === 0}
            >
              Apply Selected Suggestions
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ApplySuggestionsModal;
