import React from 'react';

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

interface ExecutiveClassicProps {
  data?: TemplateData;
  color?: string;
}

const ExecutiveClassic: React.FC<ExecutiveClassicProps> = ({ 
  data: templateData, 
  color = '#1a365d'
}) => {
  if (!templateData) {
    return <div>No data provided</div>;
  }

  return (
    <div className="min-h-screen bg-white p-8" style={{ fontFamily: 'Georgia, serif' }}>
      {/* Header Section */}
      <div className="text-center mb-8" style={{ borderBottom: `4px solid ${color}`, paddingBottom: '25px' }}>
        <h1 className="text-5xl font-bold mb-3" style={{ 
          color: color,
          textTransform: 'uppercase',
          letterSpacing: '3px'
        }}>
          {templateData.personalInfo.name}
        </h1>
        <h2 className="text-2xl font-semibold mb-3" style={{ color: '#4a5568' }}>
          {templateData.personalInfo.title}
        </h2>
        <div className="text-lg text-gray-600 space-y-1">
          {templateData.personalInfo.address && (
            <div>{templateData.personalInfo.address}</div>
          )}
          {templateData.personalInfo.phone && (
            <div>{templateData.personalInfo.phone}</div>
          )}
          <div>{templateData.personalInfo.email}</div>
          {templateData.personalInfo.website && (
            <div className="text-blue-600">{templateData.personalInfo.website}</div>
          )}
        </div>
      </div>

      {/* Professional Summary */}
      <div className="mb-8">
        <h3 className="text-2xl font-bold mb-4" style={{ color: color, borderBottom: `2px solid ${color}`, paddingBottom: '8px' }}>
          PROFESSIONAL SUMMARY
        </h3>
        <div className="text-lg leading-relaxed text-gray-700">
          {templateData.summary}
        </div>
      </div>

      {/* Skills Section */}
      <div className="mb-8">
        <h3 className="text-2xl font-bold mb-4" style={{ color: color, borderBottom: `2px solid ${color}`, paddingBottom: '8px' }}>
          TECHNICAL SKILLS
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {templateData.skills.technical && templateData.skills.technical.length > 0 && (
            <div>
              <h4 className="text-lg font-semibold mb-3" style={{ color: '#4a5568' }}>Technical Skills</h4>
              <div className="space-y-2">
                {templateData.skills.technical.map((skill, index) => (
                  <div 
                    key={index}
                    className="text-gray-700"
                  >
                    • {skill}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {templateData.skills.professional && templateData.skills.professional.length > 0 && (
            <div>
              <h4 className="text-lg font-semibold mb-3" style={{ color: '#4a5568' }}>Professional Skills</h4>
              <div className="space-y-2">
                {templateData.skills.professional.map((skill, index) => (
                  <div 
                    key={index}
                    className="text-gray-700"
                  >
                    • {skill}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Professional Experience */}
      <div className="mb-8">
        <h3 className="text-2xl font-bold mb-4" style={{ color: color, borderBottom: `2px solid ${color}`, paddingBottom: '8px' }}>
          PROFESSIONAL EXPERIENCE
        </h3>
        <div className="space-y-6">
          {templateData.experience.map((exp, index) => (
            <div 
              key={index}
              className="border-l-4 pl-6"
              style={{ 
                borderLeftColor: color
              }}
            >
              <div className="flex justify-between items-start mb-2">
                <h4 className="text-xl font-bold text-gray-800">{exp.title}</h4>
                <span className="text-gray-600 font-medium">{exp.dates}</span>
              </div>
              <div className="text-lg font-semibold text-gray-700 mb-2">{exp.company}</div>
              <div className="text-gray-700 space-y-2">
                {exp.achievements.map((achievement, achievementIndex) => (
                  <div key={achievementIndex} className="flex items-start">
                    <span className="text-blue-600 mr-2 mt-1">•</span>
                    <span>{achievement}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Education */}
      <div className="mb-8">
        <h3 className="text-2xl font-bold mb-4" style={{ color: color, borderBottom: `2px solid ${color}`, paddingBottom: '8px' }}>
          EDUCATION
        </h3>
        <div className="space-y-4">
          {templateData.education.map((edu, index) => (
            <div key={index} className="flex justify-between items-start">
              <div>
                <h4 className="text-lg font-semibold text-gray-800">{edu.degree}</h4>
                <div className="text-gray-700">{edu.institution}</div>
                <div className="text-gray-600 text-sm space-y-1 mt-2">
                  {edu.details.map((detail, detailIndex) => (
                    <div key={detailIndex}>• {detail}</div>
                  ))}
                </div>
              </div>
              <span className="text-gray-600 font-medium">{edu.dates}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Projects */}
      {templateData.projects && templateData.projects.length > 0 && (
        <div className="mb-8">
          <h3 className="text-2xl font-bold mb-4" style={{ color: color, borderBottom: `2px solid ${color}`, paddingBottom: '8px' }}>
            PROJECTS
          </h3>
          <div className="space-y-4">
            {templateData.projects.map((project, index) => (
              <div key={index} className="border-l-4 pl-6" style={{ borderLeftColor: color }}>
                <h4 className="text-lg font-semibold text-gray-800 mb-2">{project.Name}</h4>
                <p className="text-gray-700 mb-2">{project.Description}</p>
                <div className="text-sm text-gray-600">
                  <strong>Tech Stack:</strong> {project.Tech_Stack}
                  {project.Start_Date && project.End_Date && (
                    <span className="ml-4">
                      <strong>Duration:</strong> {project.Start_Date} - {project.End_Date}
                    </span>
                  )}
                  {project.Link && (
                    <div className="mt-1">
                      <a href={project.Link} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                        View Project
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Additional Information */}
      {(templateData.additionalInfo.languages || templateData.additionalInfo.certifications || templateData.additionalInfo.awards) && (
        <div className="mb-8">
          <h3 className="text-2xl font-bold mb-4" style={{ color: color, borderBottom: `2px solid ${color}`, paddingBottom: '8px' }}>
            ADDITIONAL INFORMATION
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {templateData.additionalInfo.languages && templateData.additionalInfo.languages.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold mb-3" style={{ color: '#4a5568' }}>Languages</h4>
                <div className="space-y-1">
                  {templateData.additionalInfo.languages.map((language, index) => (
                    <div key={index} className="text-gray-700">• {language}</div>
                  ))}
                </div>
              </div>
            )}
            
            {templateData.additionalInfo.certifications && templateData.additionalInfo.certifications.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold mb-3" style={{ color: '#4a5568' }}>Certifications</h4>
                <div className="space-y-1">
                  {templateData.additionalInfo.certifications.map((cert, index) => (
                    <div key={index} className="text-gray-700">• {cert}</div>
                  ))}
                </div>
              </div>
            )}
            
            {templateData.additionalInfo.awards && templateData.additionalInfo.awards.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold mb-3" style={{ color: '#4a5568' }}>Awards</h4>
                <div className="space-y-1">
                  {templateData.additionalInfo.awards.map((award, index) => (
                    <div key={index} className="text-gray-700">• {award}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Custom Sections */}
      {templateData.customSections && templateData.customSections.length > 0 && (
        <div className="space-y-8">
          {templateData.customSections
            .sort((a, b) => a.position - b.position)
            .map((section) => (
              <div key={section.id}>
                <h3 className="text-2xl font-bold mb-4" style={{ color: color, borderBottom: `2px solid ${color}`, paddingBottom: '8px' }}>
                  {section.title.toUpperCase()}
                </h3>
                
                {section.type === 'text' && section.content.text && (
                  <div className="text-gray-700 leading-relaxed">{section.content.text}</div>
                )}
                
                {section.type === 'list' && section.content.items && (
                  <div className="space-y-3">
                    {section.content.items.map((item) => (
                      <div key={item.id} className="border-l-4 pl-6" style={{ borderLeftColor: color }}>
                        {item.title && <h4 className="text-lg font-semibold text-gray-800 mb-1">{item.title}</h4>}
                        {item.subtitle && <div className="text-gray-600 mb-2">{item.subtitle}</div>}
                        {item.description && <p className="text-gray-700 mb-2">{item.description}</p>}
                        {item.bullets && item.bullets.length > 0 && (
                          <div className="space-y-1">
                            {item.bullets.map((bullet, bulletIndex) => (
                              <div key={bulletIndex} className="flex items-start">
                                <span className="text-blue-600 mr-2 mt-1">•</span>
                                <span className="text-gray-700">{bullet}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        {item.tags && item.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {item.tags.map((tag, tagIndex) => (
                              <span 
                                key={tagIndex} 
                                className="px-2 py-1 text-xs rounded-full"
                                style={{ backgroundColor: color, color: 'white' }}
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                
                {section.type === 'timeline' && section.content.items && (
                  <div className="space-y-4">
                    {section.content.items.map((item) => (
                      <div key={item.id} className="flex">
                        <div className="flex-shrink-0 w-24 text-sm text-gray-600">
                          {item.startDate && item.endDate ? `${item.startDate} - ${item.endDate}` : ''}
                        </div>
                        <div className="flex-grow border-l-4 pl-6" style={{ borderLeftColor: color }}>
                          {item.title && <h4 className="text-lg font-semibold text-gray-800 mb-1">{item.title}</h4>}
                          {item.subtitle && <div className="text-gray-600 mb-2">{item.subtitle}</div>}
                          {item.description && <p className="text-gray-700">{item.description}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {section.type === 'grid' && section.content.columns && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {section.content.columns.map((column, columnIndex) => (
                      <div key={columnIndex}>
                        <h4 className="text-lg font-semibold mb-3" style={{ color: '#4a5568' }}>{column.title}</h4>
                        <div className="space-y-1">
                          {column.items.map((item, itemIndex) => (
                            <div key={itemIndex} className="text-gray-700">• {item}</div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {section.type === 'mixed' && (
                  <div className="space-y-4">
                    {section.content.text && (
                      <div className="text-gray-700 leading-relaxed">{section.content.text}</div>
                    )}
                    {section.content.items && section.content.items.length > 0 && (
                      <div className="space-y-3">
                        {section.content.items.map((item) => (
                          <div key={item.id} className="border-l-4 pl-6" style={{ borderLeftColor: color }}>
                            {item.title && <h4 className="text-lg font-semibold text-gray-800 mb-1">{item.title}</h4>}
                            {item.description && <p className="text-gray-700">{item.description}</p>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default ExecutiveClassic;
