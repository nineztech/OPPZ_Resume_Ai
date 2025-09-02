import React from 'react';
import { renderHtmlContent } from '@/lib/htmlRenderer';

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
    technical: string[] | { [category: string]: string[] };
    professional?: string[];
  };
  experience: Array<{
    title: string;
    company: string;
    dates: string;
    achievements: string[];
    description?: string;
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
}

interface CreativeDesignerProps {
  data?: TemplateData;
  color?: string;
}

const CreativeDesigner: React.FC<CreativeDesignerProps> = ({ 
  data: templateData, 
  color = '#1f2937'
}) => {
  if (!templateData) {
    return <div>No data provided</div>;
  }

  return (
    <div className="min-h-screen bg-white p-8" style={{ fontFamily: 'Georgia, serif' }}>
      {/* Header Section */}
      <div className="text-center mb-8" style={{ borderBottom: `3px solid ${color}`, paddingBottom: '20px' }}>
        <h1 className="text-4xl font-bold mb-2" style={{ 
          color: color,
          textTransform: 'uppercase',
          letterSpacing: '2px'
        }}>
          {templateData.personalInfo.name}
        </h1>
        <h2 className="text-xl italic mb-3" style={{ color: color }}>
          {templateData.personalInfo.title}
        </h2>
        <div className="text-sm text-gray-600 space-y-1">
          <p>{templateData.personalInfo.address}</p>
          <p>{templateData.personalInfo.email}</p>
          {templateData.personalInfo.phone && <p>{templateData.personalInfo.phone}</p>}
          {templateData.personalInfo.website && <p>{templateData.personalInfo.website}</p>}
        </div>
      </div>

      {/* Summary Section */}
      <div className="mb-8" style={{ position: 'relative' }}>
        <h2 className="text-xl font-bold mb-3" style={{ 
          color: color,
          borderBottom: `2px solid ${color}`,
          paddingBottom: '5px',
          display: 'inline-block'
        }}>
          PROFESSIONAL SUMMARY
        </h2>
        <p className="text-lg leading-relaxed text-justify" style={{ 
          lineHeight: '1.6',
          textAlign: 'justify'
        }}>
          {renderHtmlContent(templateData.summary || 'No summary provided yet. Please add your professional summary in the sidebar.')}
        </p>

      </div>

      {/* Skills Section */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4" style={{ 
          color: color,
          borderBottom: `2px solid ${color}`,
          paddingBottom: '5px',
          display: 'inline-block'
        }}>
          TECHNICAL SKILLS
        </h2>
        
        {templateData.skills && typeof templateData.skills === 'object' && !Array.isArray(templateData.skills) ? (
          // Handle categorized skills
          Object.entries(templateData.skills).map(([category, skills]) => {
            if (!skills || (Array.isArray(skills) && skills.length === 0)) return null;
            
            const cleanSkills = Array.isArray(skills) ? skills : [skills];
            
            return (
              <div key={category} className="mb-4">
                <h3 className="text-lg font-semibold mb-2" style={{ 
                  color: color,
                  fontStyle: 'italic'
                }}>
                  {category}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {cleanSkills.map((skill, index) => {
                    return (
                      <span key={index} className="px-3 py-1 rounded-full text-sm" style={{
                        background: '#f3f4f6',
                        border: '1px solid #d1d5db',
                        color: '#374151',
                        fontWeight: '400'
                      }}>
                        {renderHtmlContent(skill)}
                      </span>
                    );
                  })}
                </div>
              </div>
            );
          })
        ) : Array.isArray(templateData.skills?.technical) && templateData.skills.technical.length > 0 ? (
          // Handle flat skills array (fallback)
          <div className="flex flex-wrap gap-2">
            {templateData.skills.technical.map((skill, index) => {
              return (
                <span key={index} className="px-3 py-1 rounded-full text-sm" style={{
                  background: '#f3f4f6',
                  border: '1px solid #d1d5db',
                  color: '#374151',
                  fontWeight: '400'
                }}>
                  {renderHtmlContent(skill)}
                </span>
              );
            })}
          </div>
        ) : (
          <div className="text-gray-500 italic">
            No skills provided yet. Please add your technical skills in the sidebar.
          </div>
        )}
      </div>

      {/* Experience Section */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4" style={{ 
          color: color,
          borderBottom: `2px solid ${color}`,
          paddingBottom: '5px',
          display: 'inline-block'
        }}>
          PROFESSIONAL EXPERIENCE
        </h2>
        
        {templateData.experience && templateData.experience.length > 0 ? (
          <div className="space-y-6">
            {templateData.experience.map((exp, index) => {
              return (
                <div key={index} className="relative">
                  
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold" style={{ color: color }}>
                      {renderHtmlContent(exp.title)}
                    </h3>
                    <span className="text-sm text-gray-600 italic">
                      {exp.dates}
                    </span>
                  </div>
                  <h4 className="text-md font-semibold mb-2" style={{ color: color }}>
                    {exp.company}
                  </h4>
                  {exp.description && (
                    <p className="text-gray-700 mb-3 leading-relaxed">
                      {exp.description}
                    </p>
                  )}
                  {exp.achievements && exp.achievements.length > 0 && (
                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                      {exp.achievements.map((achievement, achievementIndex) => (
                        <li key={achievementIndex} className="leading-relaxed">
                          {renderHtmlContent(achievement)}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-gray-500 italic">
            No experience provided yet. Please add your work experience in the sidebar.
          </div>
        )}
      </div>

      {/* Education Section */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4" style={{ 
          color: color,
          borderBottom: `2px solid ${color}`,
          paddingBottom: '5px',
          display: 'inline-block'
        }}>
          EDUCATION
        </h2>
        
        {templateData.education && templateData.education.length > 0 ? (
          <div className="space-y-4">
            {templateData.education.map((edu, index) => (
              <div key={index} className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold" style={{ color: color }}>
                    {edu.degree}
                  </h3>
                  <p className="text-gray-700">{edu.institution}</p>
                  {edu.details && edu.details.length > 0 && (
                    <ul className="list-disc list-inside text-sm text-gray-600 mt-1">
                      {edu.details.map((detail, detailIndex) => (
                        <li key={detailIndex}>{detail}</li>
                      ))}
                    </ul>
                  )}
                </div>
                <span className="text-sm text-gray-600 italic">
                  {edu.dates}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-500 italic">
            No education provided yet. Please add your educational background in the sidebar.
          </div>
        )}
      </div>

      {/* Projects Section */}
      {templateData.projects && templateData.projects.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4" style={{ 
            color: color,
            borderBottom: `2px solid ${color}`,
            paddingBottom: '5px',
            display: 'inline-block'
          }}>
            PROJECTS
          </h2>
          
          <div className="space-y-4">
            {templateData.projects.map((project, index) => (
              <div key={index} className="border-l-4 pl-4" style={{ borderLeftColor: color }}>
                <h3 className="text-lg font-bold mb-2" style={{ color: color }}>
                  {project.Name}
                </h3>
                <p className="text-gray-700 mb-2 leading-relaxed">
                  {project.Description}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Tech Stack:</strong> {project.Tech_Stack}
                </p>
                {project.Start_Date && project.End_Date && (
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Duration:</strong> {project.Start_Date} - {project.End_Date}
                  </p>
                )}
                {project.Link && (
                  <a 
                    href={project.Link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    View Project →
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Additional Info Section */}
      {(templateData.additionalInfo.languages || templateData.additionalInfo.certifications || templateData.additionalInfo.awards) && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4" style={{ 
            color: color,
            borderBottom: `2px solid ${color}`,
            paddingBottom: '5px',
            display: 'inline-block'
          }}>
            ADDITIONAL INFORMATION
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {templateData.additionalInfo.languages && templateData.additionalInfo.languages.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: color }}>
                  Languages
                </h3>
                <ul className="list-disc list-inside text-gray-700">
                  {templateData.additionalInfo.languages.map((language, index) => (
                    <li key={index}>{language}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {templateData.additionalInfo.certifications && templateData.additionalInfo.certifications.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: color }}>
                  Certifications
                </h3>
                <ul className="list-disc list-inside text-gray-700">
                  {templateData.additionalInfo.certifications.map((cert, index) => (
                    <li key={index}>{cert}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {templateData.additionalInfo.awards && templateData.additionalInfo.awards.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: color }}>
                  Awards & Recognition
                </h3>
                <ul className="list-disc list-inside text-gray-700">
                  {templateData.additionalInfo.awards.map((award, index) => (
                    <li key={index}>{award}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Custom Sections */}
      {templateData.customSections && templateData.customSections.length > 0 && (
        <div className="space-y-6">
          {templateData.customSections
            .sort((a, b) => a.position - b.position)
            .map((section) => (
              <div key={section.id}>
                <h2 className="text-xl font-bold mb-4" style={{ 
                  color: color,
                  borderBottom: `2px solid ${color}`,
                  paddingBottom: '5px',
                  display: 'inline-block'
                }}>
                  {section.title.toUpperCase()}
                </h2>
                
                {section.content.text && (
                  <p className="text-gray-700 leading-relaxed mb-3">
                    {section.content.text}
                  </p>
                )}
                
                {section.content.items && section.content.items.length > 0 && (
                  <div className="space-y-3">
                    {section.content.items.map((item, index) => (
                      <div key={index} className="border-l-4 pl-4" style={{ borderLeftColor: color }}>
                        {item.title && (
                          <h3 className="text-lg font-semibold mb-1" style={{ color: color }}>
                            {item.title}
                          </h3>
                        )}
                        {item.subtitle && (
                          <p className="text-md font-medium text-gray-700 mb-1">
                            {item.subtitle}
                          </p>
                        )}
                        {item.description && (
                          <p className="text-gray-700 mb-2 leading-relaxed">
                            {item.description}
                          </p>
                        )}
                        {item.bullets && item.bullets.length > 0 && (
                          <ul className="list-disc list-inside text-gray-700">
                            {item.bullets.map((bullet, bulletIndex) => (
                              <li key={bulletIndex} className="leading-relaxed">
                                {bullet}
                              </li>
                            ))}
                          </ul>
                        )}
                        {item.tags && item.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {item.tags.map((tag, tagIndex) => (
                              <span key={tagIndex} className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default CreativeDesigner;
