import React from 'react';
import ModernProfessional from './ModernProffessional/ModernProfessional';
import CleanMinimal from './CleanMinimal/CleanMinimal';
import CreativeDesigner from './CreativeDesigner/CreativeDesigner';
import ExecutiveClassic from './ExecutiveClassic/ExecutiveClassic';
import BusinessProfessional from './BussinessProfessional/BusinessProfessional';
import EliteModern from './EliteModern/EliteModern';

interface TemplateData {
  personalInfo: {
    name: string;
    title: string;
    address: string;
    email: string;
    website: string;
    github?: string;
    linkedin?: string;
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
    location?: string;
  }>;
  projects?: Array<{
    Name: string;
    Description: string;
    Tech_Stack: string;
    Start_Date?: string;
    End_Date?: string;
    Link?: string;
  }>;
  certifications?: Array<{
    certificateName: string;
    instituteName: string;
    startDate?: string;
    endDate?: string;
    link?: string;
  }>;
  additionalInfo: {
    languages?: string[];
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
  visibleSections?: Set<string>;
  sectionOrder?: string[];
  customization?: {
    theme: {
      primaryColor: string;
      secondaryColor: string;
      textColor: string;
      backgroundColor: string;
      accentColor: string;
      borderColor: string;
      headerColor: string;
    };
    nameCustomization?: {
      size: 'xs' | 's' | 'm' | 'l' | 'xl';
      bold: boolean;
      font: 'body' | 'creative';
      fontWeight?: number;
    };
    typography: {
      fontFamily: {
        header: string;
        body: string;
        name: string;
      };
      fontSize: {
        name: number;
        title: number;
        headers: number;
        body: number;
        subheader: number;
      };
      fontWeight: {
        name: number;
        headers: number;
        body: number;
      };
    };
    layout: {
      margins: {
        top: number;
        bottom: number;
        left: number;
        right: number;
      };
      sectionSpacing: number;
      lineHeight: number;
    };
  };
}

const TemplateRenderer: React.FC<TemplateRendererProps> = ({ templateId, data, color, visibleSections, sectionOrder, customization }) => {
  const renderTemplate = () => {
    switch (templateId) {
      case 'modern-professional':
        return <ModernProfessional data={data} color={color} visibleSections={visibleSections} sectionOrder={sectionOrder} customization={customization} />;
      case 'clean-minimal':
        return <CleanMinimal data={data} color={color} visibleSections={visibleSections} sectionOrder={sectionOrder} customization={customization} />;
      case 'creative-designer':
        return <CreativeDesigner data={data} color={color} visibleSections={visibleSections} sectionOrder={sectionOrder} customization={customization} />;
      case 'executive-classic':
        return <ExecutiveClassic data={data} color={color} visibleSections={visibleSections} sectionOrder={sectionOrder} customization={customization} />;
      case 'business-professional':
        return <BusinessProfessional data={data} color={color} visibleSections={visibleSections} sectionOrder={sectionOrder} customization={customization} />;
      case 'elite-modern':
        return <EliteModern data={data} color={color} visibleSections={visibleSections} sectionOrder={sectionOrder} customization={customization} />;
      default:
        return <ModernProfessional data={data} color={color} visibleSections={visibleSections} sectionOrder={sectionOrder} customization={customization} />;
    }
  };

  return (
    <div className="template-container">
      {renderTemplate()}
    </div>
  );
};

export default TemplateRenderer; 