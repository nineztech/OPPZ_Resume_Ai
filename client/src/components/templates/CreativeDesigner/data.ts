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

export const creativeDesignerTemplateData: TemplateData = {
  personalInfo: {
    name: 'Hency Honey',
    title: 'CREATIVE DESIGNER',
    address: '123 Anywhere St., Any City',
    email: 'hello@reallygreatsite.com',
    website: 'www.reallygreatsite.com'
  },
  summary: 'Creative professional with extensive experience in visual design and user experience, specializing in creating engaging digital experiences that connect with audiences and drive business results.',
  skills: {
    technical: [
      'Adobe Creative Suite',
      'Figma',
      'Sketch',
      'InVision',
      'Prototyping',
      'User Research',
      'Visual Design',
      'Brand Identity',
      'UI/UX Design'
    ]
  },
  experience: [
    {
      title: 'Senior Designer',
      company: 'Creative Studio',
      dates: 'Mar 2023 - Present',
      achievements: [
        'Led design team of 5 designers, delivering 20+ successful projects.',
        'Increased client satisfaction by 25% through improved design processes.',
        'Redesigned company website, resulting in 40% increase in conversions.'
      ]
    },
    {
      title: 'UI/UX Designer',
      company: 'Tech Startup',
      dates: 'Jan 2021 - Feb 2023',
      achievements: [
        'Designed mobile app with 50,000+ downloads and 4.5-star rating.',
        'Created design system used across 10+ products.',
        'Improved user engagement by 35% through UX optimization.'
      ]
    }
  ],
  education: [
    {
      degree: 'Bachelor of Fine Arts in Graphic Design',
      institution: 'Design Institute',
      dates: 'Sep 2017 - Jun 2021',
      details: [
        'Specialized in Digital Design and User Experience.',
        'Graduated with honors and portfolio award.'
      ]
    }
  ],
  additionalInfo: {
    languages: ['English', 'Spanish'],
    certifications: ['Adobe Certified Expert', 'Figma Design System Specialist'],
    awards: ['Best Designer Award (2023)', 'Creative Excellence Award (2022)']
  }
};
