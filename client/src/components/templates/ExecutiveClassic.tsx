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
    <div className="bg-white p-8 max-w-4xl mx-auto font-serif" style={{ color: '#1f2937' }}>
      {/* Header with Executive Style */}
      <div className="mb-10 text-center border-b-2 pb-6" style={{ borderColor: color }}>
        <h1 className="text-4xl font-bold mb-3 uppercase tracking-widest" style={{ color }}>
          {data.personalInfo.name}
        </h1>
        <h2 className="text-xl font-semibold mb-4 text-gray-700 uppercase tracking-wide">
          {data.personalInfo.title}
        </h2>
        <div className="flex justify-center items-center space-x-6 text-sm text-gray-600">
          <span>{data.personalInfo.address}</span>
          <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
          <span>{data.personalInfo.email}</span>
          <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
          <span>{data.personalInfo.website}</span>
        </div>
      </div>

      {/* Executive Summary */}
      <div className="mb-10">
        <h3 className="text-lg font-bold mb-4 uppercase tracking-wide border-b-2 pb-2" style={{ color, borderColor: color }}>
          Executive Summary
        </h3>
        <p className="text-gray-700 leading-relaxed text-base">
          {data.summary}
        </p>
      </div>

      {/* Core Competencies */}
      <div className="mb-10">
        <h3 className="text-lg font-bold mb-4 uppercase tracking-wide border-b-2 pb-2" style={{ color, borderColor: color }}>
          Core Competencies
        </h3>
        <div className="grid grid-cols-3 gap-6">
          {data.skills.technical.map((skill, index) => (
            <div key={index} className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: color }}>
                {index + 1}
              </div>
              <span className="text-gray-700 font-medium text-sm">{skill}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Professional Experience with Executive Layout */}
      <div className="mb-10">
        <h3 className="text-lg font-bold mb-6 uppercase tracking-wide border-b-2 pb-2" style={{ color, borderColor: color }}>
          Professional Experience
        </h3>
        <div className="space-y-8">
          {data.experience.map((exp, index) => (
            <div key={index} className="relative">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h4 className="text-xl font-bold text-gray-900 mb-1">
                    {exp.title}
                  </h4>
                  <p className="text-lg font-semibold text-gray-700 mb-2">{exp.company}</p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-medium text-gray-600 bg-gray-100 px-4 py-2 rounded-full">
                    {exp.dates}
                  </span>
                </div>
              </div>
              <div className="pl-6 border-l-4" style={{ borderColor: color }}>
                <ul className="space-y-3">
                  {exp.achievements.map((achievement, idx) => (
                    <li key={idx} className="text-gray-700 text-base leading-relaxed">
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
        <h3 className="text-lg font-bold mb-6 uppercase tracking-wide border-b-2 pb-2" style={{ color, borderColor: color }}>
          Education & Credentials
        </h3>
        <div className="space-y-6">
          {data.education.map((edu, index) => (
            <div key={index} className="bg-gray-50 p-6 rounded-lg">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="text-lg font-bold text-gray-900">
                    {edu.degree}
                  </h4>
                  <p className="text-gray-700 font-medium">{edu.institution}</p>
                </div>
                <span className="text-sm font-medium text-gray-600">
                  {edu.dates}
                </span>
              </div>
              <ul className="space-y-2">
                {edu.details.map((detail, idx) => (
                  <li key={idx} className="text-gray-700 text-sm">
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
        <h3 className="text-lg font-bold mb-6 uppercase tracking-wide border-b-2 pb-2" style={{ color, borderColor: color }}>
          Additional Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {data.additionalInfo.languages && (
            <div>
              <h4 className="font-bold text-gray-900 mb-3 uppercase tracking-wide text-sm">Languages</h4>
              <p className="text-gray-700">{data.additionalInfo.languages.join(', ')}</p>
            </div>
          )}
          {data.additionalInfo.certifications && (
            <div>
              <h4 className="font-bold text-gray-900 mb-3 uppercase tracking-wide text-sm">Certifications</h4>
              <p className="text-gray-700">{data.additionalInfo.certifications.join(', ')}</p>
            </div>
          )}
          {data.additionalInfo.awards && (
            <div>
              <h4 className="font-bold text-gray-900 mb-3 uppercase tracking-wide text-sm">Awards & Recognition</h4>
              <p className="text-gray-700">{data.additionalInfo.awards.join(', ')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExecutiveClassic; 