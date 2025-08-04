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

interface BusinessProfessionalProps {
  data: TemplateData;
  color?: string;
}

const BusinessProfessional: React.FC<BusinessProfessionalProps> = ({ data, color = '#1e40af' }) => {
  return (
    <div
      className="max-w-4xl mx-auto px-8 py-10 bg-white"
      style={{
        fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
        fontSize: '12px',
        color: '#2d3748',
        lineHeight: '1.5',
        letterSpacing: '0.01em',
      }}
    >
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-3xl mb-2 font-bold" style={{ 
              color,
              fontWeight: '700',
              fontSize: '32px',
              letterSpacing: '-0.5px'
            }}>
              {data.personalInfo.name}
            </h1>
            <h2 className="text-lg font-semibold text-gray-700 mb-3" style={{
              fontWeight: 600,
              fontSize: '18px'
            }}>
              {data.personalInfo.title}
            </h2>
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600" style={{ fontSize: '11px' }}>
              <div className="flex items-center gap-2">
                <span className="font-medium">Address:</span>
                <span>{data.personalInfo.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Email:</span>
                <span>{data.personalInfo.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Website:</span>
                <span>{data.personalInfo.website}</span>
              </div>
              {data.personalInfo.phone && (
                <div className="flex items-center gap-2">
                  <span className="font-medium">Phone:</span>
                  <span>{data.personalInfo.phone}</span>
                </div>
              )}
            </div>
          </div>
          <div 
            className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl"
            style={{ backgroundColor: color }}
          >
            {data.personalInfo.name.split(' ').map(n => n[0]).join('').toUpperCase()}
          </div>
        </div>
      </header>

      {/* Summary */}
      <section className="mb-8">
        <h3 className="text-sm font-bold uppercase tracking-wide mb-3 pb-1 border-b-2" style={{ 
          color,
          fontSize: '13px',
          fontWeight: '700',
          letterSpacing: '0.5px',
          borderBottomColor: color,
          borderBottomWidth: '2px'
        }}>
          Professional Summary
        </h3>
        <p style={{ 
          color: '#4a5568', 
          fontSize: '11px', 
          marginBottom: 0,
          lineHeight: '1.6',
          textAlign: 'justify'
        }}>{data.summary}</p>
      </section>

      {/* Skills */}
      <section className="mb-8">
        <h3 className="text-sm font-bold uppercase tracking-wide mb-3 pb-1 border-b-2" style={{ 
          color,
          fontSize: '13px',
          fontWeight: '700',
          letterSpacing: '0.5px',
          borderBottomColor: color,
          borderBottomWidth: '2px'
        }}>
          Core Competencies
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="text-xs font-semibold mb-2" style={{ color, fontSize: '11px' }}>Technical Skills</h4>
            <div className="flex flex-wrap gap-1">
              {data.skills.technical.map((skill, index) => (
                <span
                  key={index}
                  className="px-2 py-1 rounded text-xs font-medium"
                  style={{
                    backgroundColor: `${color}15`,
                    color,
                    fontSize: '10px'
                  }}
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
          {data.skills.professional && data.skills.professional.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold mb-2" style={{ color, fontSize: '11px' }}>Professional Skills</h4>
              <div className="flex flex-wrap gap-1">
                {data.skills.professional.map((skill, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 rounded text-xs font-medium"
                    style={{
                      backgroundColor: `${color}15`,
                      color,
                      fontSize: '10px'
                    }}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Experience */}
      <section className="mb-8">
        <h3 className="text-sm font-bold uppercase tracking-wide mb-3 pb-1 border-b-2" style={{ 
          color,
          fontSize: '13px',
          fontWeight: '700',
          letterSpacing: '0.5px',
          borderBottomColor: color,
          borderBottomWidth: '2px'
        }}>
          Professional Experience
        </h3>
        <div className="space-y-4">
          {data.experience.map((exp, index) => (
            <div key={index} className="border-l-4 pl-4" style={{ borderLeftColor: color }}>
              <div className="flex justify-between items-start mb-2">
                <h4 className="text-sm font-bold" style={{ fontSize: '12px', color: '#2d3748' }}>
                  {exp.title}
                </h4>
                <span className="text-xs text-gray-500" style={{ fontSize: '10px' }}>
                  {exp.dates}
                </span>
              </div>
              <p className="text-sm font-semibold text-gray-600 mb-2" style={{ fontSize: '11px' }}>
                {exp.company}
              </p>
              <ul className="list-disc list-inside space-y-1" style={{ fontSize: '10px', color: '#4a5568' }}>
                {exp.achievements.map((achievement, achievementIndex) => (
                  <li key={achievementIndex} style={{ lineHeight: '1.4' }}>
                    {achievement}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Education */}
      <section className="mb-8">
        <h3 className="text-sm font-bold uppercase tracking-wide mb-3 pb-1 border-b-2" style={{ 
          color,
          fontSize: '13px',
          fontWeight: '700',
          letterSpacing: '0.5px',
          borderBottomColor: color,
          borderBottomWidth: '2px'
        }}>
          Education
        </h3>
        <div className="space-y-4">
          {data.education.map((edu, index) => (
            <div key={index} className="border-l-4 pl-4" style={{ borderLeftColor: color }}>
              <div className="flex justify-between items-start mb-2">
                <h4 className="text-sm font-bold" style={{ fontSize: '12px', color: '#2d3748' }}>
                  {edu.degree}
                </h4>
                <span className="text-xs text-gray-500" style={{ fontSize: '10px' }}>
                  {edu.dates}
                </span>
              </div>
              <p className="text-sm font-semibold text-gray-600 mb-2" style={{ fontSize: '11px' }}>
                {edu.institution}
              </p>
              {edu.details && edu.details.length > 0 && (
                <ul className="list-disc list-inside space-y-1" style={{ fontSize: '10px', color: '#4a5568' }}>
                  {edu.details.map((detail, detailIndex) => (
                    <li key={detailIndex} style={{ lineHeight: '1.4' }}>
                      {detail}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Additional Information */}
      {(data.additionalInfo.languages || data.additionalInfo.certifications || data.additionalInfo.awards) && (
        <section className="mb-8">
          <h3 className="text-sm font-bold uppercase tracking-wide mb-3 pb-1 border-b-2" style={{ 
            color,
            fontSize: '13px',
            fontWeight: '700',
            letterSpacing: '0.5px',
            borderBottomColor: color,
            borderBottomWidth: '2px'
          }}>
            Additional Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.additionalInfo.languages && data.additionalInfo.languages.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold mb-2" style={{ color, fontSize: '11px' }}>Languages</h4>
                <div className="flex flex-wrap gap-1">
                  {data.additionalInfo.languages.map((language, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 rounded text-xs font-medium"
                      style={{
                        backgroundColor: `${color}15`,
                        color,
                        fontSize: '10px'
                      }}
                    >
                      {language}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {data.additionalInfo.certifications && data.additionalInfo.certifications.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold mb-2" style={{ color, fontSize: '11px' }}>Certifications</h4>
                <ul className="space-y-1" style={{ fontSize: '10px', color: '#4a5568' }}>
                  {data.additionalInfo.certifications.map((cert, index) => (
                    <li key={index} style={{ lineHeight: '1.4' }}>• {cert}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {data.additionalInfo.awards && data.additionalInfo.awards.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold mb-2" style={{ color, fontSize: '11px' }}>Awards & Recognition</h4>
                <ul className="space-y-1" style={{ fontSize: '10px', color: '#4a5568' }}>
                  {data.additionalInfo.awards.map((award, index) => (
                    <li key={index} style={{ lineHeight: '1.4' }}>• {award}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
};

export default BusinessProfessional; 