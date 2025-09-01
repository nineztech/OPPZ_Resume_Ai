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
import { generatePDF, downloadPDF } from '@/services/pdfService';
import { createRoot } from 'react-dom/client';

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
      // Create a temporary div to render the template
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '0';
      tempDiv.style.width = '800px';
      tempDiv.style.backgroundColor = 'white';
      tempDiv.style.padding = '40px';
      document.body.appendChild(tempDiv);

      // Render the template with sample data
      const sampleData = {
        personalInfo: {
          name: 'John Doe',
          title: 'Software Engineer',
          address: 'New York, NY',
          email: 'john.doe@example.com',
          website: 'https://johndoe.com',
          phone: '+1 (555) 123-4567'
        },
        summary: 'Experienced software engineer with expertise in modern web technologies.',
        skills: {
          technical: ['JavaScript', 'React', 'Node.js', 'Python'],
          professional: ['Leadership', 'Communication', 'Problem Solving']
        },
        experience: [
          {
            title: 'Senior Software Engineer',
            company: 'Tech Corp',
            dates: '2020 - Present',
            achievements: ['Led development team', 'Improved performance by 40%']
          }
        ],
        education: [
          {
            degree: 'Bachelor of Science in Computer Science',
            institution: 'University of Technology',
            dates: '2016 - 2020',
            details: ['GPA: 3.8/4.0', 'Dean\'s List']
          }
        ],
        projects: [
          {
            Name: 'E-commerce Platform',
            Description: 'Full-stack web application',
            Tech_Stack: 'React, Node.js, MongoDB',
            Start_Date: '2021',
            End_Date: '2022',
            Link: 'https://github.com/johndoe/ecommerce'
          }
        ],
        additionalInfo: {
          languages: ['English', 'Spanish'],
          certifications: ['AWS Certified Developer'],
          awards: ['Best Employee 2022']
        }
      };

      // Create the template renderer
      const root = createRoot(tempDiv);
      root.render(
        <TemplateRenderer
          templateId={template.id}
          data={sampleData}
          color={template.colors[0]}
        />
      );

      // Wait for rendering
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Get the HTML content
      const htmlContent = tempDiv.innerHTML;

      // Clean up
      document.body.removeChild(tempDiv);

      // Generate PDF using the service
      const blob = await generatePDF({
        htmlContent,
        templateId: template.id,
        resumeData: sampleData
      });

      // Download the PDF
      const filename = `${template.name.replace(/\s+/g, '_')}_Template.pdf`;
      downloadPDF(blob, filename);

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                    <div className="relative bg-gray-50 rounded-lg p-2 mb-4 group-hover:bg-gray-100 transition-colors">
                      <div className="bg-white rounded shadow-sm border border-gray-200 overflow-hidden flex items-center justify-center h-50">
                      <div className="aspect-[3/4] bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden flex items-center justify-center">
                    <div 
                      className="transform origin-center" 
                      style={{ 
                        transform: 'scale(0.4)',
                        width: '250%', 
                        height: '250%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <div style={{ width: '210mm', height: '297mm' }}>
                        <TemplateRenderer 
                          templateId={template.id} 
                          color={template.colors[0]}
                        />
                      </div>
                    </div>
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
