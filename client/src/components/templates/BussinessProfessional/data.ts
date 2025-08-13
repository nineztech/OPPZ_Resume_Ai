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

export const businessProfessionalTemplateData: TemplateData = {
  personalInfo: {
    name: 'ESTELLE mjhjhjmh',
    title: 'BUSINESS ANALYST',
    address: '123 Anywhere St., Any City',
    email: 'hello@reallygreatsite.com',
    website: 'www.reallygreatsite.com'
  },
  summary: 'Experienced business analyst with strong analytical skills and proven track record in process optimization, data analysis, and strategic planning. Skilled in translating complex business requirements into actionable solutions.',
  skills: {
    technical: [
      'Data Analysis',
      'Process Optimization',
      'Business Intelligence',
      'SQL & Database Management',
      'Statistical Analysis',
      'Project Management',
      'Requirements Gathering',
      'Stakeholder Management',
      'Business Process Modeling'
    ]
  },
  experience: [
    {
      title: 'Senior Business Analyst',
      company: 'Tech Solutions Inc.',
      dates: 'Mar 2023 - Present',
      achievements: [
        'Led cross-functional teams to implement new business processes, resulting in 25% efficiency improvement.',
        'Developed comprehensive data analysis frameworks that improved decision-making accuracy by 40%.',
        'Managed stakeholder relationships across 5 departments, ensuring successful project delivery.'
      ]
    },
    {
      title: 'Business Analyst',
      company: 'Global Consulting Group',
      dates: 'Jan 2021 - Feb 2023',
      achievements: [
        'Analyzed business requirements and created detailed functional specifications for 15+ projects.',
        'Conducted user research and usability testing, improving user satisfaction by 30%.',
        'Collaborated with development teams to ensure successful implementation of business solutions.'
      ]
    }
  ],
  education: [
    {
      degree: 'Master of Business Administration',
      institution: 'Business University',
      dates: 'Sep 2018 - May 2020',
      details: [
        'Concentration in Business Analytics and Information Systems.',
        'Graduated with honors and received Dean\'s List recognition.'
      ]
    },
    {
      degree: 'Bachelor of Science in Business Administration',
      institution: 'State University',
      dates: 'Sep 2014 - May 2018',
      details: [
        'Major in Business Management with minor in Data Science.',
        'Completed capstone project on "Data-Driven Decision Making in Modern Organizations".'
      ]
    }
  ],
  additionalInfo: {
    languages: ['English', 'Spanish', 'French'],
    certifications: ['Certified Business Analysis Professional (CBAP)', 'Agile Certified Practitioner (ACP)', 'Six Sigma Green Belt'],
    awards: ['Analyst of the Year (2023)', 'Excellence in Process Improvement (2022)', 'Innovation Award (2021)']
  }
};
