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

interface ExecutiveClassicProps {
  data: TemplateData;
  color?: string;
}

const ExecutiveClassic: React.FC<ExecutiveClassicProps> = ({ data, color = '#1e293b' }) => {
  return (
    <div className="bg-white p-8 max-w-4xl mx-auto" style={{ 
      fontFamily: 'Georgia, "Times New Roman", serif',
      color: '#333333',
      fontSize: '12px',
      lineHeight: '1.4'
    }}>
      {/* Header with Executive Style */}
      <div className="mb-10 text-center border-b-2 pb-6" style={{ borderColor: color }}>
        <h1 className="text-4xl font-bold mb-3 uppercase tracking-widest" style={{ 
          color,
          fontWeight: '700',
          letterSpacing: '0.5px',
          fontSize: '32px'
        }}>
          {data.personalInfo.name}
        </h1>
        <h2 className="text-xl font-semibold mb-4 text-gray-700 uppercase tracking-wide" style={{
          fontWeight: '600',
          fontSize: '18px'
        }}>
          {data.personalInfo.title}
        </h2>
        <div className="flex justify-center items-center space-x-6 text-sm text-gray-600" style={{ fontSize: '11px' }}>
          <span>{data.personalInfo.address}</span>
          <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
          <span>{data.personalInfo.email}</span>
          <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
          <span>{data.personalInfo.website}</span>
        </div>
      </div>

      {/* Executive Summary */}
      <div className="mb-10">
        <h3 className="text-lg font-bold mb-4 uppercase tracking-wide border-b-2 pb-2" style={{ 
          color, 
          borderColor: color,
          fontSize: '14px',
          fontWeight: '700',
          letterSpacing: '0.3px'
        }}>
          Executive Summary
        </h3>
        <p className="text-gray-700 leading-relaxed text-base" style={{
          fontSize: '11px',
          lineHeight: '1.5',
          textAlign: 'justify'
        }}>
          {data.summary}
        </p>
      </div>

      {/* Core Competencies */}
      <div className="mb-10">
        <h3 className="text-lg font-bold mb-4 uppercase tracking-wide border-b-2 pb-2" style={{ 
          color, 
          borderColor: color,
          fontSize: '14px',
          fontWeight: '700',
          letterSpacing: '0.3px'
        }}>
          Core Competencies
        </h3>
        <div className="grid grid-cols-3 gap-6">
          {data.skills.technical.map((skill, index) => (
            <div key={index} className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center text-white font-bold" style={{ 
                backgroundColor: color,
                fontSize: '12px'
              }}>
                {index + 1}
              </div>
              <span className="text-gray-700 font-medium text-sm" style={{
                fontSize: '10px',
                fontWeight: '500'
              }}>{skill}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Professional Experience with Executive Layout */}
      <div className="mb-10">
        <h3 className="text-lg font-bold mb-6 uppercase tracking-wide border-b-2 pb-2" style={{ 
          color, 
          borderColor: color,
          fontSize: '14px',
          fontWeight: '700',
          letterSpacing: '0.3px'
        }}>
          Professional Experience
        </h3>
        <div className="space-y-8">
          {data.experience.map((exp, index) => (
            <div key={index} className="relative">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h4 className="text-xl font-bold text-gray-900 mb-1" style={{
                    fontSize: '13px',
                    fontWeight: '600'
                  }}>
                    {exp.title}
                  </h4>
                  <p className="text-lg font-semibold text-gray-700 mb-2" style={{
                    fontSize: '11px',
                    fontWeight: '500'
                  }}>{exp.company}</p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-medium text-gray-600 bg-gray-100 px-4 py-2 rounded-full" style={{
                    fontSize: '10px'
                  }}>
                    {exp.dates}
                  </span>
                </div>
              </div>
              <div className="pl-6 border-l-4" style={{ borderColor: color }}>
                <ul className="space-y-3">
                  {exp.achievements.map((achievement, idx) => (
                    <li key={idx} className="text-gray-700 text-base leading-relaxed" style={{
                      fontSize: '10px',
                      lineHeight: '1.4'
                    }}>
                      {achievement}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Education with Executive Style */}
      <div className="mb-10">
        <h3 className="text-lg font-bold mb-6 uppercase tracking-wide border-b-2 pb-2" style={{ 
          color, 
          borderColor: color,
          fontSize: '14px',
          fontWeight: '700',
          letterSpacing: '0.3px'
        }}>
          Education & Credentials
        </h3>
        <div className="space-y-6">
          {data.education.map((edu, index) => (
            <div key={index} className="bg-gray-50 p-6 rounded-lg">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="text-lg font-bold text-gray-900" style={{
                    fontSize: '13px',
                    fontWeight: '600'
                  }}>
                    {edu.degree}
                  </h4>
                  <p className="text-gray-700 font-medium" style={{
                    fontSize: '11px',
                    fontWeight: '500'
                  }}>{edu.institution}</p>
                </div>
                <span className="text-sm font-medium text-gray-600" style={{
                  fontSize: '10px'
                }}>
                  {edu.dates}
                </span>
              </div>
              <ul className="space-y-2">
                {edu.details.map((detail, idx) => (
                  <li key={idx} className="text-gray-700 text-sm" style={{
                    fontSize: '10px',
                    lineHeight: '1.4'
                  }}>
                    • {detail}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Additional Information with Executive Layout */}
      <div>
        <h3 className="text-lg font-bold mb-6 uppercase tracking-wide border-b-2 pb-2" style={{ 
          color, 
          borderColor: color,
          fontSize: '14px',
          fontWeight: '700',
          letterSpacing: '0.3px'
        }}>
          Additional Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {data.additionalInfo.languages && (
            <div>
              <h4 className="font-bold text-gray-900 mb-3 uppercase tracking-wide text-sm" style={{
                fontSize: '12px',
                fontWeight: '700',
                letterSpacing: '0.3px'
              }}>Languages</h4>
              <p className="text-gray-700" style={{
                fontSize: '10px'
              }}>{data.additionalInfo.languages.join(', ')}</p>
            </div>
          )}
          {data.additionalInfo.certifications && (
            <div>
              <h4 className="font-bold text-gray-900 mb-3 uppercase tracking-wide text-sm" style={{
                fontSize: '12px',
                fontWeight: '700',
                letterSpacing: '0.3px'
              }}>Certifications</h4>
              <p className="text-gray-700" style={{
                fontSize: '10px'
              }}>{data.additionalInfo.certifications.join(', ')}</p>
            </div>
          )}
          {data.additionalInfo.awards && (
            <div>
              <h4 className="font-bold text-gray-900 mb-3 uppercase tracking-wide text-sm" style={{
                fontSize: '12px',
                fontWeight: '700',
                letterSpacing: '0.3px'
              }}>Awards & Recognition</h4>
              <p className="text-gray-700" style={{
                fontSize: '10px'
              }}>{data.additionalInfo.awards.join(', ')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExecutiveClassic; 