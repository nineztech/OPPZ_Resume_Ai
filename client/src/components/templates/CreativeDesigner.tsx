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

interface CreativeDesignerProps {
  data: TemplateData;
  color?: string;
}

const CreativeDesigner: React.FC<CreativeDesignerProps> = ({ data, color = '#ec4899' }) => {
  return (
    <div className="bg-white p-8 max-w-4xl mx-auto font-sans" style={{ color: '#1f2937' }}>
      {/* Header with Creative Design */}
      <div className="mb-8 relative">
        <div className="absolute top-0 left-0 w-20 h-20 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full opacity-20"></div>
        <div className="absolute top-4 right-4 w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full opacity-20"></div>
        
        <div className="relative z-10">
          <h1 className="text-5xl font-black mb-2 uppercase tracking-wider" style={{ color }}>
            {data.personalInfo.name}
          </h1>
          <h2 className="text-2xl font-bold mb-4 text-gray-800 uppercase tracking-wide">
            {data.personalInfo.title}
          </h2>
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
            <span className="flex items-center">
              <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: color }}></div>
              {data.personalInfo.address}
            </span>
            <span className="flex items-center">
              <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: color }}></div>
              {data.personalInfo.email}
            </span>
            <span className="flex items-center">
              <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: color }}></div>
              {data.personalInfo.website}
            </span>
          </div>
        </div>
      </div>

      {/* Summary with Creative Border */}
      <div className="mb-8 relative">
        <div className="border-l-4 pl-6" style={{ borderColor: color }}>
          <h3 className="text-xl font-bold mb-3 uppercase tracking-wide" style={{ color }}>
            About Me
          </h3>
          <p className="text-gray-700 leading-relaxed text-lg">
            {data.summary}
          </p>
        </div>
      </div>

      {/* Skills with Creative Layout */}
      <div className="mb-8">
        <h3 className="text-xl font-bold mb-4 uppercase tracking-wide" style={{ color }}>
          Skills & Expertise
        </h3>
        <div className="grid grid-cols-3 gap-6">
          {data.skills.technical.map((skill, index) => (
            <div key={index} className="relative group">
              <div className="p-4 border-2 border-gray-200 rounded-lg hover:border-pink-300 transition-all duration-300 group-hover:shadow-lg">
                <div className="text-center">
                  <div className="w-8 h-8 mx-auto mb-2 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: color }}>
                    {index + 1}
                  </div>
                  <span className="text-gray-700 font-medium">{skill}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Experience with Creative Timeline */}
      <div className="mb-8">
        <h3 className="text-xl font-bold mb-4 uppercase tracking-wide" style={{ color }}>
          Professional Journey
        </h3>
        <div className="space-y-8">
          {data.experience.map((exp, index) => (
            <div key={index} className="relative">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-4 h-4 rounded-full mr-4 mt-2" style={{ backgroundColor: color }}></div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="text-lg font-bold text-gray-900">
                        {exp.title}
                      </h4>
                      <p className="text-gray-600 font-medium">{exp.company}</p>
                    </div>
                    <span className="text-sm text-gray-500 font-medium bg-gray-100 px-3 py-1 rounded-full">
                      {exp.dates}
                    </span>
                  </div>
                  <ul className="space-y-2">
                    {exp.achievements.map((achievement, idx) => (
                      <li key={idx} className="text-gray-700 text-sm flex items-start">
                        <div className="w-1.5 h-1.5 rounded-full mr-3 mt-2 flex-shrink-0" style={{ backgroundColor: color }}></div>
                        {achievement}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              {index < data.experience.length - 1 && (
                <div className="absolute left-2 top-6 w-0.5 h-8 bg-gray-200"></div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Education */}
      <div className="mb-8">
        <h3 className="text-xl font-bold mb-4 uppercase tracking-wide" style={{ color }}>
          Education
        </h3>
        <div className="space-y-6">
          {data.education.map((edu, index) => (
            <div key={index} className="bg-gradient-to-r from-gray-50 to-white p-6 rounded-lg border-l-4" style={{ borderColor: color }}>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="text-lg font-bold text-gray-900">
                    {edu.degree}
                  </h4>
                  <p className="text-gray-600 font-medium">{edu.institution}</p>
                </div>
                <span className="text-sm text-gray-500 font-medium">
                  {edu.dates}
                </span>
              </div>
              <ul className="space-y-1">
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

      {/* Additional Information with Creative Layout */}
      <div>
        <h3 className="text-xl font-bold mb-4 uppercase tracking-wide" style={{ color }}>
          Additional Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {data.additionalInfo.languages && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-bold text-gray-900 mb-2">Languages</h4>
              <p className="text-gray-700">{data.additionalInfo.languages.join(', ')}</p>
            </div>
          )}
          {data.additionalInfo.certifications && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-bold text-gray-900 mb-2">Certifications</h4>
              <p className="text-gray-700">{data.additionalInfo.certifications.join(', ')}</p>
            </div>
          )}
          {data.additionalInfo.awards && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-bold text-gray-900 mb-2">Awards</h4>
              <p className="text-gray-700">{data.additionalInfo.awards.join(', ')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreativeDesigner; 