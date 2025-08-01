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

interface ModernProfessionalProps {
  data: TemplateData;
  color?: string;
}

const ModernProfessional: React.FC<ModernProfessionalProps> = ({ data, color = '#2563eb' }) => {
  return (
    <div className="bg-white p-8 max-w-4xl mx-auto font-sans" style={{ color: '#1f2937' }}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2" style={{ color }}>
          {data.personalInfo.name}
        </h1>
        <h2 className="text-xl font-semibold mb-3 text-gray-800">
          {data.personalInfo.title}
        </h2>
        <div className="flex items-center text-sm text-gray-600 space-x-4">
          <span>{data.personalInfo.address}</span>
          <span>•</span>
          <span>{data.personalInfo.email}</span>
          <span>•</span>
          <span>{data.personalInfo.website}</span>
        </div>
      </div>

      {/* Summary */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-3 uppercase tracking-wide" style={{ color }}>
          Summary
        </h3>
        <div className="border-b-2 mb-4" style={{ borderColor: color }}></div>
        <p className="text-gray-700 leading-relaxed">
          {data.summary}
        </p>
      </div>

      {/* Technical Skills */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-3 uppercase tracking-wide" style={{ color }}>
          Technical Skills
        </h3>
        <div className="border-b-2 mb-4" style={{ borderColor: color }}></div>
        <div className="grid grid-cols-3 gap-4">
          {data.skills.technical.map((skill, index) => (
            <div key={index} className="text-gray-700">
              {skill}
            </div>
          ))}
        </div>
      </div>

      {/* Professional Experience */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-3 uppercase tracking-wide" style={{ color }}>
          Professional Experience
        </h3>
        <div className="border-b-2 mb-4" style={{ borderColor: color }}></div>
        <div className="space-y-6">
          {data.experience.map((exp, index) => (
            <div key={index}>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-semibold text-gray-900">
                    {exp.title}, {exp.company}
                  </h4>
                </div>
                <span className="text-sm text-gray-600 font-medium">
                  {exp.dates}
                </span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                {exp.achievements.map((achievement, idx) => (
                  <li key={idx} className="text-sm">
                    {achievement}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Education */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-3 uppercase tracking-wide" style={{ color }}>
          Education
        </h3>
        <div className="border-b-2 mb-4" style={{ borderColor: color }}></div>
        <div className="space-y-6">
          {data.education.map((edu, index) => (
            <div key={index}>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-semibold text-gray-900">
                    {edu.degree}
                  </h4>
                  <p className="text-gray-700">{edu.institution}</p>
                </div>
                <span className="text-sm text-gray-600 font-medium">
                  {edu.dates}
                </span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                {edu.details.map((detail, idx) => (
                  <li key={idx} className="text-sm">
                    {detail}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Additional Information */}
      <div>
        <h3 className="text-lg font-semibold mb-3 uppercase tracking-wide" style={{ color }}>
          Additional Information
        </h3>
        <div className="border-b-2 mb-4" style={{ borderColor: color }}></div>
        <div className="space-y-4">
          {data.additionalInfo.languages && (
            <div>
              <span className="font-medium text-gray-900">Languages: </span>
              <span className="text-gray-700">{data.additionalInfo.languages.join(', ')}.</span>
            </div>
          )}
          {data.additionalInfo.certifications && (
            <div>
              <span className="font-medium text-gray-900">Certifications: </span>
              <span className="text-gray-700">{data.additionalInfo.certifications.join(', ')}.</span>
            </div>
          )}
          {data.additionalInfo.awards && (
            <div>
              <span className="font-medium text-gray-900">Awards/Activities: </span>
              <span className="text-gray-700">{data.additionalInfo.awards.join(', ')}.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModernProfessional; 