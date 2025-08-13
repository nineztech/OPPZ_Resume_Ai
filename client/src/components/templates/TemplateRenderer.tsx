import React from 'react';
import ModernProfessional from './ModernProffessional/ModernProfessional';
import CleanMinimal from './CleanMinimal/CleanMinimal';
import CreativeDesigner from './CreativeDesigner/CreativeDesigner';
import ExecutiveClassic from './ExecutiveClassic/ExecutiveClassic';
import BusinessProfessional from './BussinessProfessional/BusinessProfessional';

interface TemplateData {
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
    technical: string[];
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
}

interface TemplateRendererProps {
  templateId: string;
  data?: TemplateData;
  color?: string;
}

const TemplateRenderer: React.FC<TemplateRendererProps> = ({ templateId, data, color }) => {
  const renderTemplate = () => {
    switch (templateId) {
      case 'modern-professional':
        return <ModernProfessional data={data} color={color} />;
      case 'clean-minimal':
        return <CleanMinimal data={data} color={color} />;
      case 'creative-designer':
        return <CreativeDesigner data={data} color={color} />;
      case 'executive-classic':
        return <ExecutiveClassic data={data} color={color} />;
      case 'business-professional':
        return <BusinessProfessional data={data} color={color} />;
      default:
        return <ModernProfessional data={data} color={color} />;
    }
  };

  return (
    <div className="template-container">
      {renderTemplate()}
    </div>
  );
};

export default TemplateRenderer; 