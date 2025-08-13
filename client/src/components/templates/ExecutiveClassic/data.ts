export interface TemplateData {
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

export const executiveClassicTemplateData: TemplateData = {
  personalInfo: {
    name: 'ESTELLE DARCY',
    title: 'SENIOR EXECUTIVE',
    address: '123 Anywhere St., Any City',
    email: 'hello@reallygreatsite.com',
    website: 'www.reallygreatsite.com'
  },
  summary: 'Seasoned executive with over 15 years of leadership experience in strategic planning, team management, and business development. Proven track record of driving organizational growth and operational excellence.',
  skills: {
    technical: [
      'Strategic Planning',
      'Team Leadership',
      'Business Development',
      'Financial Management',
      'Change Management',
      'Stakeholder Relations',
      'Project Management',
      'Risk Assessment',
      'Performance Optimization'
    ]
  },
  experience: [
    {
      title: 'Chief Operations Officer',
      company: 'Global Corporation',
      dates: 'Jan 2022 - Present',
      achievements: [
        'Led company-wide digital transformation, resulting in 30% efficiency improvement.',
        'Managed team of 200+ employees across 5 departments.',
        'Increased annual revenue by 25% through strategic initiatives.'
      ]
    },
    {
      title: 'Director of Operations',
      company: 'Fortune 500 Company',
      dates: 'Mar 2019 - Dec 2021',
      achievements: [
        'Reduced operational costs by 20% while maintaining quality standards.',
        'Implemented new processes that improved productivity by 35%.',
        'Led successful merger integration affecting 500+ employees.'
      ]
    }
  ],
  education: [
    {
      degree: 'Master of Business Administration',
      institution: 'Business School',
      dates: 'Sep 2015 - May 2017',
      details: [
        'Concentration in Strategic Management and Leadership.',
        'Graduated with distinction.'
      ]
    },
    {
      degree: 'Bachelor of Science in Business Administration',
      institution: 'University',
      dates: 'Sep 2011 - May 2015',
      details: [
        'Major in Management with minor in Finance.'
      ]
    }
  ],
  additionalInfo: {
    languages: ['English', 'French', 'German'],
    certifications: ['PMP Certification', 'Six Sigma Black Belt', 'Executive Leadership Program'],
    awards: ['Executive of the Year (2023)', 'Leadership Excellence Award (2022)', 'Innovation Award (2021)']
  }
};
