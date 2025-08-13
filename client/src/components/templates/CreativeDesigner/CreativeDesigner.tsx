import React from 'react';
import { creativeDesignerTemplateData } from './data';
import type { TemplateData } from './data';

interface CreativeDesignerProps {
  data?: TemplateData;
  color?: string;
}

const CreativeDesigner: React.FC<CreativeDesignerProps> = ({ 
  data = creativeDesignerTemplateData, 
  color = '#ec4899' 
}) => {
  return (
    <div
      className="bg-white max-w-4xl mx-auto px-8 py-10"
      style={{
        fontFamily: 'Georgia, "Times New Roman", serif',
        color: '#333333',
        fontSize: '12px',
        lineHeight: '1.4',
      }}
    >
      {/* Header */}
      <header className="mb-10 pb-6 border-b" style={{ borderColor: color, borderBottomWidth: 2 }}>
        <h1
          className="text-4xl font-extrabold mb-1 uppercase tracking-widest"
          style={{ 
            color, 
            letterSpacing: '0.09em', 
            fontWeight: 900, 
            lineHeight: 1.1,
            fontSize: '32px'
          }}
        >
          {data.personalInfo.name}
        </h1>
        <h2
          className="text-lg font-bold text-gray-700 mb-2 uppercase tracking-wide"
          style={{ 
            fontWeight: 700, 
            letterSpacing: '0.08em',
            fontSize: '18px'
          }}
        >
          {data.personalInfo.title}
        </h2>
        <div className="flex flex-wrap gap-x-6 text-sm text-gray-700" style={{ 
          fontSize: '11px', 
          marginBottom: '0.5rem' 
        }}>
          <span>{data.personalInfo.address}</span>
          <span>|</span>
          <span>{data.personalInfo.email}</span>
          <span>|</span>
          <span>{data.personalInfo.website}</span>
          {data.personalInfo.phone && (
            <>
              <span>|</span>
              <span>{data.personalInfo.phone}</span>
            </>
          )}
        </div>
      </header>

      {/* Summary */}
      <section className="mb-8">
        <div style={{ borderLeft: `4px solid ${color}`, paddingLeft: '1.1rem' }}>
          <h3 className="text-base font-bold mb-2 uppercase tracking-wide" style={{ 
            color, 
            fontSize: '14px',
            fontWeight: '700',
            letterSpacing: '0.3px'
          }}>
            About Me
          </h3>
          <p style={{ 
            fontSize: '11px', 
            color: '#25324b', 
            marginBottom: 0,
            lineHeight: '1.5',
            textAlign: 'justify'
          }}>{data.summary}</p>
        </div>
      </section>

      {/* Skills Section */}
      <section className="mb-8">
        <h3
          className="text-base font-bold mb-2 uppercase tracking-wide"
          style={{
            color,
            fontSize: '14px',
            letterSpacing: '0.08em',
            marginBottom: '0.7rem',
            fontWeight: '700'
          }}
        >
          Skills & Expertise
        </h3>
        {data.skills.professional && Array.isArray(data.skills.professional) && data.skills.professional.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {(Array.isArray(data.skills.professional) ? data.skills.professional : []).map((skill, idx) => (
              <span
                key={idx}
                className="inline-block px-3 py-1 rounded-full"
                style={{
                  background: '#f3f7fa',
                  border: `1.2px solid ${color}`,
                  color,
                  fontWeight: 600,
                  fontSize: '11px',
                  marginBottom: '4px',
                }}
              >
                {skill}
              </span>
            ))}
          </div>
        )}
        {Array.isArray(data.skills.technical) && data.skills.technical.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {(Array.isArray(data.skills.technical) ? data.skills.technical : []).map((skill, idx) => (
              <span
                key={idx}
                className="inline-block px-3 py-1 rounded-full"
                style={{
                  background: '#f3f6fd',
                  border: `1.2px solid ${color}`,
                  color,
                  fontWeight: 500,
                  fontSize: '10px',
                  marginBottom: '3px',
                }}
              >
                {skill}
              </span>
            ))}
          </div>
        )}
      </section>

      {/* Experience */}
      <section className="mb-8">
        <h3
          className="text-base font-bold mb-3 uppercase tracking-wide"
          style={{
            color,
            fontSize: '14px',
            letterSpacing: '0.08em',
            fontWeight: '700'
          }}
        >
          Professional Journey
        </h3>
        <div className="flex flex-col gap-7">
          {data.experience.map((exp, idx) => (
            <div key={idx}>
              <div className="flex items-baseline justify-between mb-1 gap-x-4">
                <div>
                  <h4 className="font-semibold" style={{ 
                    fontSize: '13px', 
                    marginBottom: 0,
                    fontWeight: '600'
                  }}>{exp.title}</h4>
                  <span className="text-gray-700" style={{ 
                    fontSize: '11px',
                    fontWeight: '500'
                  }}>{exp.company}</span>
                </div>
                <span
                  className="text-xs text-gray-600 font-medium"
                  style={{
                    background: '#e4f0fa',
                    borderRadius: '1rem',
                    padding: '2px 12px',
                    color,
                    fontSize: '10px'
                  }}
                >
                  {exp.dates}
                </span>
              </div>
              <ul className="pl-4" style={{ 
                color: '#2c2c34', 
                fontSize: '10px',
                lineHeight: '1.4'
              }}>
                {exp.achievements.map((achievement, subidx) => (
                  <li key={subidx} style={{ 
                    marginBottom: 3, 
                    listStyle: 'disc' 
                  }}>
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
        <h3
          className="text-base font-bold mb-3 uppercase tracking-wide"
          style={{
            color,
            fontSize: '14px',
            letterSpacing: '0.08em',
            fontWeight: '700'
          }}
        >
          Education
        </h3>
        <div className="flex flex-col gap-6">
          {data.education.map((edu, idx) => (
            <div
              key={idx}
              className="pl-6 py-3"
              style={{
                borderLeft: `4px solid ${color}`,
                background: idx % 2 === 0 ? '#f7fafc' : '#eef4fb',
                borderRadius: '0 10px 10px 0',
              }}
            >
              <div className="flex justify-between items-baseline mb-1">
                <div>
                  <h4 className="font-semibold" style={{ 
                    fontSize: '13px', 
                    marginBottom: 0,
                    fontWeight: '600'
                  }}>{edu.degree}</h4>
                  <div className="text-gray-700" style={{ 
                    fontSize: '11px',
                    fontWeight: '500'
                  }}>{edu.institution}</div>
                </div>
                <span className="text-xs text-gray-600 font-medium" style={{ 
                  fontSize: '10px' 
                }}>{edu.dates}</span>
              </div>
              <ul className="pl-4" style={{ 
                color: '#3f4848', 
                fontSize: '10px',
                lineHeight: '1.4'
              }}>
                {edu.details.map((detail, idx3) => (
                  <li key={idx3} style={{ 
                    marginBottom: 1, 
                    listStyle: 'circle' 
                  }}>
                    {detail}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Additional Information */}
      {(data.additionalInfo.languages || data.additionalInfo.certifications || data.additionalInfo.awards) && (
        <section>
          <h3
            className="text-base font-bold mb-3 uppercase tracking-wide"
            style={{
              color,
              fontSize: '14px',
              letterSpacing: '0.08em',
              fontWeight: '700'
            }}
          >
            Additional Information
          </h3>
          <div className="flex flex-wrap gap-6">
            {data.additionalInfo.languages && (
              <div style={{ minWidth: 180 }}>
                <span className="font-bold" style={{ 
                  color,
                  fontSize: '12px',
                  fontWeight: '700'
                }}>Languages:</span>
                <span className="ml-2" style={{
                  fontSize: '10px'
                }}>{data.additionalInfo.languages.join(', ')}</span>
              </div>
            )}
            {data.additionalInfo.certifications && (
              <div style={{ minWidth: 180 }}>
                <span className="font-bold" style={{ 
                  color,
                  fontSize: '12px',
                  fontWeight: '700'
                }}>Certifications:</span>
                <span className="ml-2" style={{
                  fontSize: '10px'
                }}>{data.additionalInfo.certifications.join(', ')}</span>
              </div>
            )}
            {data.additionalInfo.awards && (
              <div style={{ minWidth: 180 }}>
                <span className="font-bold" style={{ 
                  color,
                  fontSize: '12px',
                  fontWeight: '700'
                }}>Awards:</span>
                <span className="ml-2" style={{
                  fontSize: '10px'
                }}>{data.additionalInfo.awards.join(', ')}</span>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
};

export default CreativeDesigner;
