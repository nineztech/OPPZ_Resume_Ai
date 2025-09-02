import React, { useRef, useState } from 'react';
import { X, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import TemplateRenderer from '@/components/templates/TemplateRenderer';
import { generatePDF, downloadPDF } from '@/services/pdfService';

interface ResumePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  templateId: string;
  data: {
    personalInfo: {
      name: string;
      title: string;
      address: string;
      email: string;
      website: string;
      phone?: string;
    };
    summary: string;
    skills: {
      technical: string[] | { [category: string]: string[] };
      professional?: string[];
    };
    experience: Array<{
      title: string;
      company: string;
      dates: string;
      achievements: string[];
    }>;
    education: Array<{
      degree: string;
      institution: string;
      dates: string;
      details: string[];
    }>;
    projects?: Array<{
      Name: string;
      Description: string;
      Tech_Stack: string;
      Start_Date?: string;
      End_Date?: string;
      Link?: string;
    }>;
    additionalInfo: {
      languages?: string[];
      certifications?: string[];
      awards?: string[];
    };
    customSections?: Array<{
      id: string;
      title: string;
      type: 'text' | 'list' | 'timeline' | 'grid' | 'mixed';
      position: number;
      content: {
        text?: string;
        items?: Array<{
          id: string;
          title?: string;
          subtitle?: string;
          description?: string;
          startDate?: string;
          endDate?: string;
          location?: string;
          link?: string;
          bullets?: string[];
          tags?: string[];
        }>;
        columns?: Array<{
          title: string;
          items: string[];
        }>;
      };
      styling?: {
        showBullets?: boolean;
        showDates?: boolean;
        showLocation?: boolean;
        showLinks?: boolean;
        showTags?: boolean;
        layout?: 'vertical' | 'horizontal' | 'grid';
      };
    }>;
  };
  color?: string;
  highlightedChanges?: Set<string>;
  showHighlights?: boolean;
}

const ResumePreviewModal: React.FC<ResumePreviewModalProps> = ({
  isOpen,
  onClose,
  templateId,
  data,
  color,
  highlightedChanges,
  showHighlights
}) => {
  const resumeRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGeneratePDF = async () => {
    if (!resumeRef.current) return;

    try {
      setIsGenerating(true);
      
      // Create clean data without highlighting for PDF generation
      const cleanData = {
        ...data,
        summary: data.summary.replace(/<span[^>]*>|<\/span>/g, ''), // Remove highlighting spans
        skills: {
          ...data.skills,
          technical: typeof data.skills.technical === 'object' && !Array.isArray(data.skills.technical)
            ? Object.keys(data.skills.technical).reduce((acc, category) => {
                acc[category] = (data.skills.technical as any)[category].map((skill: string) => 
                  skill.replace(/<span[^>]*>|<\/span>/g, '')
                );
                return acc;
              }, {} as any)
            : Array.isArray(data.skills.technical)
            ? data.skills.technical.map((skill: string) => skill.replace(/<span[^>]*>|<\/span>/g, ''))
            : data.skills.technical
        },
        experience: data.experience.map(exp => ({
          ...exp,
          title: exp.title.replace(/<span[^>]*>|<\/span>/g, ''),
          company: exp.company.replace(/<span[^>]*>|<\/span>/g, ''),
          achievements: exp.achievements.map(achievement => achievement.replace(/<span[^>]*>|<\/span>/g, ''))
        })),
        education: data.education.map(edu => ({
          ...edu,
          degree: edu.degree.replace(/<span[^>]*>|<\/span>/g, ''),
          institution: edu.institution.replace(/<span[^>]*>|<\/span>/g, ''),
          details: edu.details.map(detail => detail.replace(/<span[^>]*>|<\/span>/g, ''))
        })),
        projects: data.projects?.map(project => ({
          ...project,
          Name: project.Name.replace(/<span[^>]*>|<\/span>/g, ''),
          Description: project.Description.replace(/<span[^>]*>|<\/span>/g, '')
        })),
        additionalInfo: {
          ...data.additionalInfo,
          certifications: data.additionalInfo.certifications?.map(cert => cert.replace(/<span[^>]*>|<\/span>/g, ''))
        }
      };
      
      // Get the HTML content from the resume element and clean it
      const htmlContent = resumeRef.current?.outerHTML || '';
      const cleanHtmlContent = htmlContent.replace(/<span[^>]*class="[^"]*ai-highlight-[^"]*"[^>]*>|<\/span>/g, '');
      
      // Generate PDF using the service with clean data
      const blob = await generatePDF({
        htmlContent: cleanHtmlContent,
        templateId,
        resumeData: cleanData
      });

      // Download the PDF
      const filename = `${data.personalInfo.name.replace(/\s+/g, '_')}_Resume.pdf`;
      downloadPDF(blob, filename);

    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Resume Preview</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="h-full" ref={resumeRef}>
            <TemplateRenderer
              templateId={templateId}
              data={data}
              color={color}
              highlightedChanges={highlightedChanges}
              showHighlights={showHighlights}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={handleGeneratePDF} disabled={isGenerating}>
            {isGenerating ? 'Generating...' : 'Download PDF'}
            <Download className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ResumePreviewModal; 