import React from 'react';

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
    content: {
      text?: string;
      items?: Array<{
        id: string;
        title?: string;
        subtitle?: string;
        startDate?: string;
        endDate?: string;
        description?: string;
        bullets?: string[];
        location?: string;
        link?: string;
        tags?: string[];
      }>;
    };
    styling?: {
      showDates?: boolean;
      showBullets?: boolean;
      showLocation?: boolean;
      showLinks?: boolean;
      showTags?: boolean;
    };
  }>;
}

interface ModernProfessionalProps {
  data: TemplateData;
  color?: string;
}

const ModernProfessional: React.FC<ModernProfessionalProps> = ({ data, color = '#2563eb' }) => {
  return (
    <div
      className="max-w-4xl mx-auto px-8 py-10 bg-white"
      style={{
        fontFamily: 'Georgia, "Times New Roman", serif',
        fontSize: '12px',
        color: '#333333',
        lineHeight: '1.4',
        letterSpacing: '0.01em',
      }}
    >
      {/* Header */}
      <header className="mb-8 pb-4 border-b" style={{ borderColor: color, borderBottomWidth: 2 }}>
        <h1 className="text-3xl mb-1 font-bold uppercase tracking-tight" style={{ 
          color,
          fontWeight: '700',
          letterSpacing: '0.5px',
          fontSize: '28px'
        }}>
          {data.personalInfo.name}
        </h1>
        <h2 className="text-lg font-semibold text-gray-700 mb-2 tracking-wide" style={{
          fontWeight: 600,
          fontSize: '16px'
        }}>
          {data.personalInfo.title}
        </h2>
        <div className="flex flex-wrap gap-x-6 text-sm text-gray-500" style={{ fontSize: '11px' }}>
          <span>{data.personalInfo.address}</span>
          <span>|</span>
          <span>{data.personalInfo.email}</span>
          <span>|</span>
          <span>{data.personalInfo.website}</span>
          {data.personalInfo.phone && <>
            <span>|</span>
            <span>{data.personalInfo.phone}</span>
          </>}
        </div>
      </header>

      {/* Summary */}
      <section className="mb-8">
        <h3 className="text-xs font-bold uppercase tracking-wide mb-2" style={{ 
          color,
          fontSize: '12px',
          fontWeight: '700',
          letterSpacing: '0.3px'
        }}>{'Summary'}</h3>
        <p style={{ 
          color: '#3B3B3B', 
          fontSize: '11px', 
          marginBottom: 0,
          lineHeight: '1.5',
          textAlign: 'justify'
        }}>{data.summary}</p>
      </section>

      {/* Skills */}
      <section className="mb-8">
        {data.skills.professional && (
          <>
            <h3 className="text-xs font-bold uppercase tracking-wide mb-2" style={{ 
              color,
              fontSize: '12px',
              fontWeight: '700',
              letterSpacing: '0.3px'
            }}>Core Competencies</h3>
            <ul className="mb-4 flex flex-wrap gap-x-8 gap-y-1" style={{ 
              listStyleType: 'none', 
              paddingLeft: 0,
              fontSize: '10px'
            }}>
              {data.skills.professional.map((skill, idx) => (
                <li key={idx} style={{ 
                  color: '#333', 
                  fontSize: '10px', 
                  marginRight: '24px',
                  lineHeight: '1.4'
                }}>• {skill}</li>
              ))}
            </ul>
          </>
        )}
        <h3 className="text-xs font-bold uppercase tracking-wide mb-2" style={{ 
          color,
          fontSize: '12px',
          fontWeight: '700',
          letterSpacing: '0.3px'
        }}>Technical Skills</h3>
        <ul className="flex flex-wrap gap-x-8 gap-y-1 mb-0" style={{ 
          listStyleType: 'none', 
          paddingLeft: 0,
          fontSize: '10px'
        }}>
          {data.skills.technical.map((skill, idx) => (
            <li key={idx} style={{ 
              color: '#333', 
              fontSize: '10px', 
              marginRight: '24px',
              lineHeight: '1.4'
            }}>• {skill}</li>
          ))}
        </ul>
      </section>

      {/* Experience */}
      <section className="mb-8">
        <h3 className="text-xs font-bold uppercase tracking-wide mb-2" style={{ 
          color,
          fontSize: '12px',
          fontWeight: '700',
          letterSpacing: '0.3px'
        }}>
          Professional Experience
        </h3>
        <div className="flex flex-col gap-6">
          {data.experience.map((exp, index) => (
            <div key={index}>
              <div className="flex justify-between items-baseline mb-1">
                <div>
                  <h4 className="font-semibold" style={{ 
                    fontSize: '12px', 
                    marginBottom: 0,
                    fontWeight: '600'
                  }}>{exp.title}</h4>
                  <div className="text-gray-500" style={{ 
                    fontSize: '11px', 
                    marginBottom: 0,
                    fontWeight: '500'
                  }}>{exp.company}</div>
                </div>
                <span className="text-xs text-gray-600 font-medium" style={{ 
                  fontSize: '10px'
                }}>
                  {exp.dates}
                </span>
              </div>
              <ul className="list-disc pl-5 gap-1" style={{ 
                color: '#373737', 
                fontSize: '10px', 
                marginTop: '6px',
                lineHeight: '1.4'
              }}>
                {exp.achievements.map((achievement, idx) => (
                  <li key={idx}>{achievement}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Education */}
      <section className="mb-8">
        <h3 className="text-xs font-bold uppercase tracking-wide mb-2" style={{ 
          color,
          fontSize: '12px',
          fontWeight: '700',
          letterSpacing: '0.3px'
        }}>Education</h3>
        <div className="flex flex-col gap-3">
          {data.education.map((edu, idx) => (
            <div key={idx}>
              <div className="flex justify-between items-baseline mb-1">
                <div>
                  <h4 className="font-semibold" style={{ 
                    fontSize: '12px', 
                    marginBottom: 0,
                    fontWeight: '600'
                  }}>{edu.degree}</h4>
                  <div className="text-gray-500" style={{ 
                    fontSize: '11px', 
                    marginBottom: 0,
                    fontWeight: '500'
                  }}>{edu.institution}</div>
                </div>
                <span className="text-xs text-gray-600 font-medium" style={{ 
                  fontSize: '10px'
                }}>
                  {edu.dates}
                </span>
              </div>
              <ul className="list-disc pl-5 gap-1" style={{ 
                color: '#373737', 
                fontSize: '10px', 
                marginTop: '6px',
                lineHeight: '1.4'
              }}>
                {edu.details.map((detail, idx2) => (
                  <li key={idx2}>{detail}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Additional Information */}
      {(data.additionalInfo.languages || data.additionalInfo.certifications || data.additionalInfo.awards) && (
        <section>
          <h3 className="text-xs font-bold uppercase tracking-wide mb-2" style={{ 
            color,
            fontSize: '12px',
            fontWeight: '700',
            letterSpacing: '0.3px'
          }}>Additional Information</h3>
          <div className="flex flex-col gap-2">
            {data.additionalInfo.languages && (
              <div>
                <span className="font-medium" style={{ 
                  color: '#2D2D2D', 
                  fontSize: '10px',
                  fontWeight: '600'
                }}>Languages: </span>
                <span style={{ 
                  color: '#595959', 
                  fontSize: '10px'
                }}>{data.additionalInfo.languages.join(', ')}</span>
              </div>
            )}
            {data.additionalInfo.certifications && (
              <div>
                <span className="font-medium" style={{ 
                  color: '#2D2D2D', 
                  fontSize: '10px',
                  fontWeight: '600'
                }}>Certifications: </span>
                <span style={{ 
                  color: '#595959', 
                  fontSize: '10px'
                }}>{data.additionalInfo.certifications.join(', ')}</span>
              </div>
            )}
            {data.additionalInfo.awards && (
              <div>
                <span className="font-medium" style={{ 
                  color: '#2D2D2D', 
                  fontSize: '10px',
                  fontWeight: '600'
                }}>Awards & Activities: </span>
                <span style={{ 
                  color: '#595959', 
                  fontSize: '10px'
                }}>{data.additionalInfo.awards.join(', ')}</span>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Custom Sections */}
      {data.customSections && data.customSections.map((section) => (
        <section key={section.id} className="mb-8">
          <h3 className="text-xs font-bold uppercase tracking-wide mb-2" style={{ 
            color,
            fontSize: '12px',
            fontWeight: '700',
            letterSpacing: '0.3px'
          }}>{section.title}</h3>
          
          {section.type === 'text' && section.content.text && (
            <p style={{ 
              color: '#3B3B3B', 
              fontSize: '11px', 
              marginBottom: 0,
              lineHeight: '1.5',
              textAlign: 'justify'
            }}>{section.content.text}</p>
          )}

          {(section.type === 'list' || section.type === 'timeline' || section.type === 'grid' || section.type === 'mixed') && section.content.items && (
            <div className="flex flex-col gap-4">
              {section.content.items.map((item) => (
                <div key={item.id}>
                  <div className="flex justify-between items-baseline mb-1">
                    <div>
                      {item.title && (
                        <h4 className="font-semibold" style={{ 
                          fontSize: '12px', 
                          marginBottom: 0,
                          fontWeight: '600'
                        }}>{item.title}</h4>
                      )}
                      {item.subtitle && (
                        <div className="text-gray-500" style={{ 
                          fontSize: '11px', 
                          marginBottom: 0,
                          fontWeight: '500'
                        }}>{item.subtitle}</div>
                      )}
                    </div>
                    {(section.styling?.showDates && (item.startDate || item.endDate)) && (
                      <span className="text-xs text-gray-600 font-medium" style={{ 
                        fontSize: '10px'
                      }}>
                        {item.startDate && item.endDate ? `${item.startDate} - ${item.endDate}` : item.startDate || item.endDate}
                      </span>
                    )}
                  </div>
                  
                  {item.description && (
                    <p style={{ 
                      color: '#373737', 
                      fontSize: '10px', 
                      marginTop: '6px',
                      lineHeight: '1.4'
                    }}>{item.description}</p>
                  )}

                  {section.styling?.showBullets && item.bullets && item.bullets.length > 0 && (
                    <ul className="list-disc pl-5 gap-1" style={{ 
                      color: '#373737', 
                      fontSize: '10px', 
                      marginTop: '6px',
                      lineHeight: '1.4'
                    }}>
                      {item.bullets.map((bullet, idx) => (
                        <li key={idx}>{bullet}</li>
                      ))}
                    </ul>
                  )}

                  <div className="flex flex-wrap gap-2 mt-2">
                    {section.styling?.showLocation && item.location && (
                      <span className="text-xs text-gray-500" style={{ fontSize: '9px' }}>
                        📍 {item.location}
                      </span>
                    )}
                    {section.styling?.showLinks && item.link && (
                      <span className="text-xs text-blue-600" style={{ fontSize: '9px' }}>
                        🔗 {item.link}
                      </span>
                    )}
                    {section.styling?.showTags && item.tags && item.tags.map((tag, idx) => (
                      <span key={idx} className="text-xs bg-gray-100 px-2 py-1 rounded" style={{ fontSize: '9px' }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      ))}
    </div>
  );
};

export default ModernProfessional;
