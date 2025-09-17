export interface Template {
  id: string;
  name: string;
  category: string;
  description: string;
  image: string;
  rating: number;
  downloads: number;
  isPopular?: boolean;
  isNew?: boolean;
  features: string[];
  colors: string[];
  formats: string[];
  templateData: {
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
  };
}

export interface TemplateData {
  id: string;
  name: string;
  category: string;
  description: string;
  image: string;
  rating: number;
  downloads: number;
  isPopular?: boolean;
  isNew?: boolean;
  features: string[];
  colors: string[];
  formats: string[];
  templateData: {
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
  };
}

export const templates: Template[] = [
  {
    id: 'modern-professional',
    name: 'Modern Professional',
    category: 'Professional',
    description: 'Clean and modern design perfect for corporate roles',
    image: '/src/assets/templates/modern-professional-preview.png',
    rating: 4.8,
    downloads: 1247,
    isPopular: true,
    features: ['Clean Layout', 'Professional Design', 'Easy Customization', 'ATS Friendly'],
    colors: ['#1e293b', '#374154', '#2c5282', '#1e40af'],
    formats: ['PDF', 'DOCX', 'HTML'],
    templateData: {
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
    }
  },
  {
    id: 'elite-modern',
    name: 'Elite Modern',
    category: 'Professional',
    description: 'Elite modern design with sophisticated blue accents and professional styling',
    image: '/src/assets/templates/elite-modern-preview.png',
    rating: 4.9,
    downloads: 1200,
    isPopular: true,
    isNew: true,
    features: ['Elite Design', 'Blue Accents', 'Professional Layout', 'Modern Typography'],
    colors: ['#1e293b', '#374154', '#2c5282', '#1e40af'],
    formats: ['PDF', 'DOCX', 'HTML'],
    templateData: {
      personalInfo: {
        name: 'ESTELLE DARCY',
        title: 'SUPPLY CHAIN ANALYST',
        address: '123 Anywhere St., Any City',
        email: 'hello@reallygreatsite.com',
        website: 'www.reallygreatsite.com'
      },
      summary: 'Results-driven Supply Chain Analyst with 5 years of experience optimizing end-to-end supply chain operations for heavy equipment, telecom, and defense electronics manufacturers. Proven record of reducing inventory 15-25%, cutting logistics costs 12-18%, and accelerating on-time delivery through data-driven planning.',
      skills: {
        technical: [
          'Analytics & Reporting: Power BI, Tableau, Advanced Excel',
          'Database & Languages: SQL Server, MS Access, Python, R, MATLAB',
          'ERP / SCM Systems: SAP (MM, WM, PP, QM, CO), Oracle NetSuite',
          'Process Ideologies: SDLC, Agile/Scrum, Waterfall, Lean Six Sigma',
          'Planning & Optimization: Demand Forecasting, S&OP, JIT, ROP',
          'Project & Collaboration: Jira, Confluence, MS Project, SharePoint'
        ]
      },
      experience: [
        {
          title: 'Supply Chain Analyst',
          company: 'Systel Inc.',
          dates: 'Apr 2023 - Present',
          achievements: [
            'Implemented JIT and ROP inventory models, reducing excess stock by 15% while maintaining 98% service level.',
            'Designed Power BI dashboards enabling 50+ users to access real-time inventory and demand KPIs.',
            'Automated manual reporting workflows, cutting weekly report preparation time from 6 hours to 30 minutes.'
          ]
        },
        {
          title: 'Supply Chain Analyst',
          company: 'Sterlite Technologies Ltd.',
          dates: 'Apr 2020 - Apr 2023',
          achievements: [
            'Managed end-to-end order fulfillment for fiber optic cables, cutting stockouts by 22%.',
            'Designed integrated Power BI-Tableau supply-chain control tower used by COO.',
            'Improved top-tier supplier OTD from 85% to 97% within 9 months.'
          ]
        }
      ],
      education: [
        {
          degree: 'Master of Science, Industrial Engineering (GPA: 3.73)',
          institution: 'Arizona State University',
          dates: 'Aug 2023 - May 2025',
          details: [
            'Concentration in Supply Chain Management and Data Analytics.'
          ]
        },
        {
          degree: 'Bachelor of Technology, Mechanical Engineering (GPA: 3.65)',
          institution: 'SRM University',
          dates: 'Jun 2013 - Jul 2017',
          details: [
            'Major in Mechanical Engineering with focus on Industrial Systems.'
          ]
        }
      ],
      additionalInfo: {
        languages: ['English', 'Hindi', 'Tamil'],
        certifications: ['Introduction to Data Analytics (IBM)', 'Microsoft Power BI Certification', 'Lean Six Sigma Green Belt'],
        awards: ['Supply Chain Excellence Award (2023)', 'Process Improvement Champion (2022)', 'Innovation Award (2021)']
      }
    }
  },
  {
    id: 'clean-minimal',
    name: 'Clean Minimal',
    category: 'Minimal',
    description: 'Simple and elegant design for any industry',
    image: '/src/assets/templates/clean-minimal-preview.png',
    rating: 4.6,
    downloads: 892,
    features: ['Minimal Design', 'Easy to Read', 'Professional', 'Clean Layout'],
    colors: ['#1e293b', '#374154', '#2c5282', '#1e40af'],
    formats: ['PDF', 'DOCX', 'HTML'],
    templateData: {
      personalInfo: {
        name: 'ESTELLE DARCY',
        title: 'PROCESS ENGINEER',
        address: '123 Anywhere St., Any City',
        email: 'hello@reallygreatsite.com',
        website: 'www.reallygreatsite.com'
      },
      summary: 'Practical Engineer with Significant Experience in Process Design, I have worked with some organizations, ensuring a grounded approach to my profession, leveraging my expertise to optimize processes and deliver innovative solutions that meet business objectives.',
      skills: {
        technical: [
          'Accessibility',
          'Responsive Design',
          'Interaction Design',
          'Visual Design'
        ],
        professional: [
          'Prototyping Tools',
          'User Research',
          'Interaction Design',
          'Visual Design'
        ]
      },
      experience: [
        {
          title: 'Instrument Tech',
          company: 'Morcelle Program',
          dates: 'Jan 2024 - Present',
          achievements: [
            'Led development of an advanced automation system, achieving a 15% increase in operational efficiency.',
            'Streamlined manufacturing processes, reducing production costs by 10%.',
            'Implemented preventive maintenance strategies, resulting in a 20% decrease in equipment downtime.'
          ]
        },
        {
          title: 'Internship',
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
          degree: 'Bachelor of Design in Process Engineering',
          institution: 'Engineering University',
          dates: 'Sep 2019 - Sep 2023',
          details: [
            'Relevant coursework in Process Design and Project Management.'
          ]
        }
      ],
      additionalInfo: {
        languages: ['English', 'French', 'Mandarin'],
        certifications: ['Professional Design Engineer (PDE) License', 'Project Management Tech (PMT)', 'Structural Process Design (SPD)'],
        awards: ['Most Innovative Intern of the Year (2022)', 'Overall Best Intern, Division Two (2022)', 'Onboarding Project Lead (2024)']
      }
    }
  },
  {
    id: 'creative-designer',
    name: 'Creative Designer',
    category: 'Creative',
    description: 'Bold and creative design for design professionals',
    image: '/src/assets/templates/creative-designer-preview.png',
    rating: 4.7,
    downloads: 756,
    isNew: true,
    features: ['Creative Layout', 'Bold Design', 'Visual Impact', 'Designer Friendly'],
    colors: ['#1e293b', '#374154', '#2c5282', '#1e40af'],
    formats: ['PDF', 'DOCX', 'HTML'],
    templateData: {
      personalInfo: {
        name: 'ESTELLE DARCY',
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
    }
  },
  {
    id: 'executive-classic',
    name: 'Executive Classic',
    category: 'Traditional',
    description: 'Timeless design for executive and senior positions',
    image: '/src/assets/templates/executive-classic-preview.png',
    rating: 4.9,
    downloads: 1103,
    isPopular: true,
    features: ['Executive Style', 'Professional Layout', 'Traditional Design', 'Senior Level'],
    colors: ['#1e293b', '#374154', '#2c5282', '#1e40af'],
    formats: ['PDF', 'DOCX', 'HTML'],
    templateData: {
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
    }
  },
  {
    id: 'business-professional',
    name: 'Business Professional',
    category: 'Professional',
    description: 'Clean and modern business design with professional layout',
    image: '/src/assets/templates/business-professional-preview.png',
    rating: 4.7,
    downloads: 856,
    isNew: true,
    features: ['Professional Layout', 'Modern Design', 'Business Focus', 'Clean Typography'],
    colors: ['#1e293b', '#374154', '#2c5282', '#1e40af'],
    formats: ['PDF', 'DOCX', 'HTML'],
    templateData: {
      personalInfo: {
        name: 'ESTELLE DARCY',
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
    }
  }
];

export const getTemplateById = (id: string): Template | undefined => {
  return templates.find(template => template.id === id);
};

export const getTemplatesByCategory = (category: string): Template[] => {
  return templates.filter(template => template.category === category);
}; 