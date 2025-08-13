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

export const modernProfessionalTemplateData: TemplateData = {
  personalInfo: {
    name: 'ESTELLE DARCY',
    title: 'UX DESIGNER',
    address: '123 Anywhere St., Any City',
    email: 'hello@reallygreatsite.com',
    website: 'www.reallygreatsite.com'
  },
  summary: 'Practical Engineer with Significant Experience in Process Design, I have worked with some organizations, ensuring a grounded approach to my profession, leveraging my expertise to optimize processes and deliver innovative solutions that meet business objectives.',
  skills: {
    technical: [
      'Prototyping Tools',
      'User Research',
      'Information Architecture',
      'Interaction Design',
      'Visual Design',
      'Usability Heuristics',
      'Accessibility',
      'Responsive Design',
      'User Testing Tools'
    ]
  },
  experience: [
    {
      title: 'Instant Chartz App',
      company: 'Morcelle Program',
      dates: 'Jan 2023 - Present',
      achievements: [
        'Led development of an advanced automation system, achieving a 15% increase in operational efficiency.',
        'Streamlined manufacturing processes, reducing production costs by 10%.',
        'Implemented preventive maintenance strategies, resulting in a 20% decrease in equipment downtime.'
      ]
    },
    {
      title: 'System UX Engineer',
      company: 'XarrowAI Industries',
      dates: 'Feb 2021 - Dec 2022',
      achievements: [
        'Designed and optimised a robotic control system, realizing a 12% performance improvement.',
        'Coordinated testing and validation, ensuring compliance with industry standards.',
        'Provided technical expertise, contributing to a 15% reduction in system failures.'
      ]
    }
  ],
  education: [
    {
      degree: 'UX Industrial Basics and General Application',
      institution: 'University of Engineering UX Cohort',
      dates: 'Aug 2016 - Oct 2019',
      details: [
        'Major in Automotive Technology.',
        'Thesis on "Technological Advancements within the current Mechatronics Industry".'
      ]
    },
    {
      degree: 'Bachelor of Design in Process Engineering',
      institution: 'Engineering University',
      dates: 'May 2014 - May 2016',
      details: [
        'Relevant coursework in Structural Design and Project Management.'
      ]
    }
  ],
  additionalInfo: {
    languages: ['English', 'French', 'Mandarin'],
    certifications: ['Professional Design Engineer (PDE) License', 'Project Management Tech (PMT)'],
    awards: ['Most Innovative Employer of the Year (2021)', 'Overall Best Employee Division Two (2024)', 'Onboarding Project Load (2023)']
  }
};
