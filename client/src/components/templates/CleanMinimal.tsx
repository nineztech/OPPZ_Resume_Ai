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
}

interface CleanMinimalProps {
  data: TemplateData;
  color?: string;
}

const CleanMinimal: React.FC<CleanMinimalProps> = ({ data, color = '#2563eb' }) => {
  return (
    <div className="bg-white max-w-4xl mx-auto font-serif" style={{ 
      fontFamily: 'Georgia, "Times New Roman", serif',
      fontSize: '11px',
      lineHeight: '1.4',
      color: '#333333'
    }}>
      {/* Header */}
      <div className="mb-6 pb-4 border-b-2" style={{ borderColor: color }}>
        <h1 className="text-3xl font-bold mb-1 tracking-wide" style={{ 
          color: color,
          fontWeight: '700',
          letterSpacing: '0.5px'
        }}>
          {data.personalInfo.name.toUpperCase()}
        </h1>
        <div className="text-sm text-gray-600 mb-2" style={{ fontSize: '10px' }}>
          {data.personalInfo.title} | B2B | Networking
        </div>
        <div className="text-xs text-gray-600 flex items-center gap-4" style={{ fontSize: '9px' }}>
          <span>📧 {data.personalInfo.email}</span>
          <span>🌐 {data.personalInfo.website}</span>
          <span>📍 {data.personalInfo.address}</span>
        </div>
      </div>

      {/* Summary */}
      <div className="mb-6">
        <h3 className="text-sm font-bold mb-2 tracking-wide" style={{ 
          color: color,
          fontSize: '11px',
          fontWeight: '700',
          letterSpacing: '0.3px'
        }}>
          SUMMARY
        </h3>
        <p className="text-gray-800 leading-relaxed text-justify" style={{ 
          fontSize: '10px',
          lineHeight: '1.5'
        }}>
          {data.summary}
        </p>
      </div>

      {/* Experience */}
      <div className="mb-6">
        <h3 className="text-sm font-bold mb-3 tracking-wide" style={{ 
          color: color,
          fontSize: '11px',
          fontWeight: '700',
          letterSpacing: '0.3px'
        }}>
          EXPERIENCE
        </h3>
        <div className="space-y-4">
          {data.experience.map((exp, index) => (
            <div key={index}>
              <div className="flex justify-between items-baseline mb-1">
                <h4 className="font-bold text-gray-900" style={{ 
                  fontSize: '10px',
                  fontWeight: '600'
                }}>
                  {exp.title}
                </h4>
                <span className="text-gray-600 font-medium" style={{ 
                  fontSize: '9px'
                }}>
                  {exp.dates}
                </span>
              </div>
              <div className="text-gray-700 font-medium mb-2" style={{ 
                fontSize: '10px',
                fontWeight: '500'
              }}>
                {exp.company}
              </div>
              <ul className="space-y-1 ml-4">
                {exp.achievements.map((achievement, idx) => (
                  <li key={idx} className="text-gray-800 relative" style={{ 
                    fontSize: '9px',
                    lineHeight: '1.4'
                  }}>
                    <span className="absolute -left-3 top-0">•</span>
                    {achievement}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Skills Section - Two Column Layout */}
      <div className="mb-6">
        <div className="grid grid-cols-2 gap-8">
          {/* Professional Skills */}
          {data.skills.professional && (
            <div>
              <h3 className="text-sm font-bold mb-3 tracking-wide" style={{ 
                color: color,
                fontSize: '11px',
                fontWeight: '700',
                letterSpacing: '0.3px'
              }}>
                CORE COMPETENCIES
              </h3>
              <div className="space-y-1">
                {data.skills.professional.map((skill, index) => (
                  <div key={index} className="text-gray-800" style={{ 
                    fontSize: '9px',
                    lineHeight: '1.4'
                  }}>
                    • {skill}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Technical Skills */}
          <div>
            <h3 className="text-sm font-bold mb-3 tracking-wide" style={{ 
              color: color,
              fontSize: '11px',
              fontWeight: '700',
              letterSpacing: '0.3px'
            }}>
              TECHNICAL PROFICIENCIES
            </h3>
            <div className="space-y-1">
              {data.skills.technical.map((skill, index) => (
                <div key={index} className="text-gray-800" style={{ 
                  fontSize: '9px',
                  lineHeight: '1.4'
                }}>
                  • {skill}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Projects Section */}
      <div className="mb-6">
        <h3 className="text-sm font-bold mb-3 tracking-wide" style={{ 
          color: color,
          fontSize: '11px',
          fontWeight: '700',
          letterSpacing: '0.3px'
        }}>
          KEY PROJECTS
        </h3>
        <div className="space-y-4">
          {data.education.slice(0, 1).map((project, index) => (
            <div key={index}>
              <div className="flex justify-between items-baseline mb-1">
                <h4 className="font-bold text-gray-900" style={{ 
                  fontSize: '10px',
                  fontWeight: '600'
                }}>
                  {project.degree}
                </h4>
                <span className="text-gray-600 font-medium" style={{ 
                  fontSize: '9px'
                }}>
                  {project.dates}
                </span>
              </div>
              <div className="text-gray-700 font-medium mb-2" style={{ 
                fontSize: '10px',
                fontWeight: '500'
              }}>
                {project.institution}
              </div>
              <ul className="space-y-1 ml-4">
                {project.details.map((detail, idx) => (
                  <li key={idx} className="text-gray-800 relative" style={{ 
                    fontSize: '9px',
                    lineHeight: '1.4'
                  }}>
                    <span className="absolute -left-3 top-0">•</span>
                    {detail}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Education */}
      <div className="mb-6">
        <h3 className="text-sm font-bold mb-3 tracking-wide" style={{ 
          color: color,
          fontSize: '11px',
          fontWeight: '700',
          letterSpacing: '0.3px'
        }}>
          EDUCATION
        </h3>
        <div className="space-y-3">
          {data.education.slice(1).map((edu, index) => (
            <div key={index}>
              <div className="flex justify-between items-baseline">
                <div>
                  <h4 className="font-bold text-gray-900" style={{ 
                    fontSize: '10px',
                    fontWeight: '600'
                  }}>
                    {edu.degree}
                  </h4>
                  <div className="text-gray-700" style={{ 
                    fontSize: '9px'
                  }}>
                    {edu.institution}
                  </div>
                </div>
                <span className="text-gray-600 font-medium" style={{ 
                  fontSize: '9px'
                }}>
                  {edu.dates}
                </span>
              </div>
              {edu.details.length > 0 && (
                <div className="mt-1">
                  {edu.details.map((detail, idx) => (
                    <div key={idx} className="text-gray-800" style={{ 
                      fontSize: '9px',
                      lineHeight: '1.3'
                    }}>
                      {detail}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Key Achievements */}
      <div>
        <h3 className="text-sm font-bold mb-3 tracking-wide" style={{ 
          color: color,
          fontSize: '11px',
          fontWeight: '700',
          letterSpacing: '0.3px'
        }}>
          KEY ACHIEVEMENTS
        </h3>
        <div className="space-y-3">
          {data.additionalInfo.languages && (
            <div>
              <span className="font-semibold text-gray-900" style={{ 
                fontSize: '9px',
                fontWeight: '600'
              }}>
                Languages: 
              </span>
              <span className="text-gray-800 ml-1" style={{ fontSize: '9px' }}>
                {data.additionalInfo.languages.join(', ')}
              </span>
            </div>
          )}
          {data.additionalInfo.certifications && (
            <div>
              <span className="font-semibold text-gray-900" style={{ 
                fontSize: '9px',
                fontWeight: '600'
              }}>
                Certifications: 
              </span>
              <span className="text-gray-800 ml-1" style={{ fontSize: '9px' }}>
                {data.additionalInfo.certifications.join(', ')}
              </span>
            </div>
          )}
          {data.additionalInfo.awards && (
            <div>
              <span className="font-semibold text-gray-900" style={{ 
                fontSize: '9px',
                fontWeight: '600'
              }}>
                Awards & Recognition: 
              </span>
              <span className="text-gray-800 ml-1" style={{ fontSize: '9px' }}>
                {data.additionalInfo.awards.join(', ')}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CleanMinimal;
