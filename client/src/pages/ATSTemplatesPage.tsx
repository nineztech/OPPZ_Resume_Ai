import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Eye, 
  Download, 
  CheckCircle, 
  AlertCircle, 
  XCircle,
  TrendingUp,
  Award,
  Target
} from 'lucide-react';
import { templates, type Template } from '@/data/templates';
import TemplateRenderer from '@/components/templates/TemplateRenderer';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface ATSScore {
  templateId: string;
  score: number;
  grade: 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'F';
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}

interface TemplatePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: Template | null;
  atsScore: ATSScore | null;
}

const TemplatePreviewModal = ({ isOpen, onClose, template, atsScore }: TemplatePreviewModalProps) => {
  const [isDownloading, setIsDownloading] = useState(false);

  if (!isOpen || !template) return null;

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    try {
      // Create a temporary container for the resume
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.top = '0';
      tempContainer.style.width = '800px';
      tempContainer.style.backgroundColor = 'white';
      tempContainer.style.padding = '40px';
      document.body.appendChild(tempContainer);

      // Create the template renderer
      const tempDiv = document.createElement('div');
      tempContainer.appendChild(tempDiv);

      // Render the template (simplified version - in real implementation you'd need to properly render the React component)
      tempDiv.innerHTML = `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h1 style="font-size: 24px; margin-bottom: 10px;">${template.templateData.personalInfo.name}</h1>
          <h2 style="font-size: 18px; color: #666; margin-bottom: 20px;">${template.templateData.personalInfo.title}</h2>
          <div style="margin-bottom: 20px;">
            <p>${template.templateData.personalInfo.email} | ${template.templateData.personalInfo.phone || 'N/A'}</p>
            <p>${template.templateData.personalInfo.address}</p>
            ${template.templateData.personalInfo.website ? `<p>${template.templateData.personalInfo.website}</p>` : ''}
          </div>
          <div style="margin-bottom: 20px;">
            <h3 style="font-size: 16px; margin-bottom: 10px; color: #333;">SUMMARY</h3>
            <p style="line-height: 1.5;">${template.templateData.summary}</p>
          </div>
          <div style="margin-bottom: 20px;">
            <h3 style="font-size: 16px; margin-bottom: 10px; color: #333;">SKILLS</h3>
            <p>${template.templateData.skills.technical.join(', ')}</p>
          </div>
          <div style="margin-bottom: 20px;">
            <h3 style="font-size: 16px; margin-bottom: 10px; color: #333;">EXPERIENCE</h3>
            ${template.templateData.experience.map(exp => `
              <div style="margin-bottom: 15px;">
                <h4 style="font-size: 14px; margin-bottom: 5px;">${exp.title} - ${exp.company}</h4>
                <p style="font-size: 12px; color: #666; margin-bottom: 5px;">${exp.dates}</p>
                <ul style="margin-left: 20px;">
                  ${exp.achievements.map(achievement => `<li style="margin-bottom: 3px;">${achievement}</li>`).join('')}
                </ul>
              </div>
            `).join('')}
          </div>
          <div>
            <h3 style="font-size: 16px; margin-bottom: 10px; color: #333;">EDUCATION</h3>
            ${template.templateData.education.map(edu => `
              <div style="margin-bottom: 10px;">
                <h4 style="font-size: 14px;">${edu.degree}</h4>
                <p style="font-size: 12px; color: #666;">${edu.institution} | ${edu.dates}</p>
                ${edu.details.map(detail => `<p style="font-size: 12px;">${detail}</p>`).join('')}
              </div>
            `).join('')}
          </div>
        </div>
      `;

      // Wait for any images to load
      await new Promise(resolve => setTimeout(resolve, 100));

      // Convert to canvas
      const canvas = await html2canvas(tempContainer, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: 800,
        height: tempContainer.scrollHeight
      });

      // Remove temporary container
      document.body.removeChild(tempContainer);

      // Create PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add additional pages if needed
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Download the PDF
      const fileName = `${template.name.replace(/\s+/g, '_')}_Template.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 90) return <CheckCircle className="w-5 h-5 text-green-600" />;
    if (score >= 70) return <AlertCircle className="w-5 h-5 text-yellow-600" />;
    return <XCircle className="w-5 h-5 text-red-600" />;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden flex">
        {/* Left Panel - Template Preview */}
        <div className="w-1/2 bg-gray-50 overflow-auto">
          <div className="p-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <TemplateRenderer
                templateId={template.id}
                data={template.templateData}
                color={template.colors[0]}
              />
            </div>
          </div>
        </div>

        {/* Right Panel - ATS Score & Actions */}
        <div className="w-1/2 p-6 overflow-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">{template.name}</h2>
            <Button variant="ghost" onClick={onClose} className="text-gray-500 hover:text-gray-700">
              ✕
            </Button>
          </div>

          {/* ATS Score Card */}
          {atsScore && (
            <Card className="mb-6">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">ATS Compatibility Score</CardTitle>
                  {getScoreIcon(atsScore.score)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-4">
                  <div className={`text-4xl font-bold ${getScoreColor(atsScore.score)}`}>
                    {atsScore.score}%
                  </div>
                  <div className="text-lg font-semibold text-gray-600">
                    Grade: {atsScore.grade}
                  </div>
                </div>

                {/* Strengths */}
                <div className="mb-4">
                  <h4 className="font-semibold text-green-700 mb-2 flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Strengths
                  </h4>
                  <ul className="space-y-1">
                    {atsScore.strengths.map((strength, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-start">
                        <span className="text-green-500 mr-2">•</span>
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Weaknesses */}
                {atsScore.weaknesses.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-semibold text-orange-700 mb-2 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-2" />
                      Areas for Improvement
                    </h4>
                    <ul className="space-y-1">
                      {atsScore.weaknesses.map((weakness, index) => (
                        <li key={index} className="text-sm text-gray-600 flex items-start">
                          <span className="text-orange-500 mr-2">•</span>
                          {weakness}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Recommendations */}
                {atsScore.recommendations.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-blue-700 mb-2 flex items-center">
                      <Target className="w-4 h-4 mr-2" />
                      Recommendations
                    </h4>
                    <ul className="space-y-1">
                      {atsScore.recommendations.map((recommendation, index) => (
                        <li key={index} className="text-sm text-gray-600 flex items-start">
                          <span className="text-blue-500 mr-2">•</span>
                          {recommendation}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Template Info */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="space-y-3">
                <div>
                  <span className="font-medium text-gray-700">Category:</span>
                  <Badge variant="secondary" className="ml-2">{template.category}</Badge>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Rating:</span>
                  <span className="ml-2">⭐ {template.rating}/5</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Downloads:</span>
                  <span className="ml-2">{template.downloads.toLocaleString()}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Features:</span>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {template.features.map((feature, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button 
              onClick={handleDownloadPDF}
              disabled={isDownloading}
              className="flex-1"
            >
              <Download className="w-4 h-4 mr-2" />
              {isDownloading ? 'Downloading...' : 'Download PDF'}
            </Button>
            <Button variant="outline" onClick={onClose} className="flex-1">
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ATSTemplatesPage = () => {
  const navigate = useNavigate();
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [atsScores, setAtsScores] = useState<ATSScore[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock ATS scoring function
  const generateATSScore = (template: Template): ATSScore => {
    // Generate scores based on template characteristics
    const baseScore = Math.floor(Math.random() * 30) + 70; // 70-100 range
    
    const strengths = [
      'Clean, professional layout',
      'ATS-friendly formatting',
      'Proper section headers',
      'Standard font usage',
      'Good white space utilization'
    ];

    const weaknesses = [
      'Could benefit from more keywords',
      'Some sections could be more detailed',
      'Consider adding more quantified achievements'
    ];

    const recommendations = [
      'Add relevant industry keywords',
      'Include more measurable results',
      'Optimize for specific job descriptions',
      'Consider adding a skills summary section'
    ];

    let grade: ATSScore['grade'] = 'F';
    if (baseScore >= 95) grade = 'A+';
    else if (baseScore >= 90) grade = 'A';
    else if (baseScore >= 85) grade = 'B+';
    else if (baseScore >= 80) grade = 'B';
    else if (baseScore >= 75) grade = 'C+';
    else if (baseScore >= 70) grade = 'C';
    else if (baseScore >= 60) grade = 'D';

    return {
      templateId: template.id,
      score: baseScore,
      grade,
      strengths: strengths.slice(0, Math.floor(Math.random() * 3) + 3),
      weaknesses: baseScore < 85 ? weaknesses.slice(0, Math.floor(Math.random() * 2) + 1) : [],
      recommendations: baseScore < 90 ? recommendations.slice(0, Math.floor(Math.random() * 2) + 2) : []
    };
  };

  useEffect(() => {
    // Generate ATS scores for all templates
    const scores = templates.map(template => generateATSScore(template));
    setAtsScores(scores);
    setLoading(false);
  }, []);

  const handleTemplateClick = (template: Template) => {
    setSelectedTemplate(template);
    setIsPreviewModalOpen(true);
  };

  const getATSScore = (templateId: string): ATSScore | undefined => {
    return atsScores.find(score => score.templateId === templateId);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'bg-green-100 text-green-800 border-green-200';
    if (score >= 80) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (score >= 70) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  const sortedTemplates = [...templates].sort((a, b) => {
    const scoreA = getATSScore(a.id)?.score || 0;
    const scoreB = getATSScore(b.id)?.score || 0;
    return scoreB - scoreA;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Analyzing ATS compatibility...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 mt-14">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  onClick={() => navigate(-1)}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">ATS Template Analysis</h1>
                  <p className="text-gray-600 mt-1">
                    Compare ATS compatibility scores across all resume templates
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Award className="w-4 h-4" />
                <span>Sorted by ATS Score</span>
              </div>
            </div>
          </div>
        </div>

        {/* Templates Grid */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedTemplates.map((template) => {
              const atsScore = getATSScore(template.id);
              return (
                <Card 
                  key={template.id} 
                  className="overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer group"
                  onClick={() => handleTemplateClick(template)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      {atsScore && (
                        <Badge className={`${getScoreColor(atsScore.score)} border font-semibold`}>
                          {atsScore.score}% {atsScore.grade}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{template.description}</p>
                  </CardHeader>
                  
                  <CardContent>
                    {/* Template Preview */}
                    <div className="relative bg-gray-50 rounded-lg p-4 mb-4 group-hover:bg-gray-100 transition-colors">
                      <div className="aspect-[3/4] bg-white rounded shadow-sm border border-gray-200 overflow-hidden flex items-center justify-center">
                        <div className="transform scale-[0.7] origin-center w-[800px] h-[1200px]">
                          <TemplateRenderer
                            templateId={template.id}
                            data={template.templateData}
                            color={template.colors[0]}
                          />
                        </div>
                      </div>
                      
                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center rounded-lg">
                        <div className="text-center text-white">
                          <Eye className="w-6 h-6 mx-auto mb-2" />
                          <span className="text-sm font-medium">View Details</span>
                        </div>
                      </div>
                    </div>

                    {/* Template Stats */}
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                      <span>⭐ {template.rating}/5</span>
                      <span>{template.downloads.toLocaleString()} downloads</span>
                    </div>

                    {/* ATS Score Details */}
                    {atsScore && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">ATS Compatibility</span>
                          <div className="flex items-center gap-2">
                            {atsScore.score >= 90 ? (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            ) : atsScore.score >= 70 ? (
                              <AlertCircle className="w-4 h-4 text-yellow-600" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-600" />
                            )}
                            <span className="text-sm font-semibold">
                              {atsScore.score >= 90 ? 'Excellent' : 
                               atsScore.score >= 80 ? 'Very Good' :
                               atsScore.score >= 70 ? 'Good' : 'Needs Improvement'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-500 ${
                              atsScore.score >= 90 ? 'bg-green-500' :
                              atsScore.score >= 80 ? 'bg-blue-500' :
                              atsScore.score >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${atsScore.score}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

                    {/* Template Badges */}
                    <div className="flex items-center gap-2 mt-3">
                      {template.isPopular && (
                        <Badge className="bg-orange-100 text-orange-700 text-xs">Popular</Badge>
                      )}
                      {template.isNew && (
                        <Badge className="bg-green-100 text-green-700 text-xs">New</Badge>
                      )}
                      <Badge variant="outline" className="text-xs">{template.category}</Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {/* Template Preview Modal */}
      <TemplatePreviewModal
        isOpen={isPreviewModalOpen}
        onClose={() => {
          setIsPreviewModalOpen(false);
          setSelectedTemplate(null);
        }}
        template={selectedTemplate}
        atsScore={selectedTemplate ? getATSScore(selectedTemplate.id) || null : null}
      />
    </>
  );
};

export default ATSTemplatesPage;
