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
  projects?: Array<{
    Name: string;
    Description: string;
    Tech_Stack: string;
    Start_Date?: string;
    End_Date?: string;
    Link?: string;
  }>;
  additionalInfo: {
    languages?: string[];
    certifications?: string[];
    awards?: string[];
  };
  customSections?: Array<{
    id: string;
    title: string;
    type: 'text' | 'list' | 'timeline' | 'grid' | 'mixed';
    position: number;
    content: {
      text?: string;
      items?: Array<{
        id: string;
        title?: string;
        subtitle?: string;
        description?: string;
        startDate?: string;
        endDate?: string;
        location?: string;
        link?: string;
        bullets?: string[];
        tags?: string[];
      }>;
      columns?: Array<{
        title: string;
        items: string[];
      }>;
    };
    styling?: {
      showBullets?: boolean;
      showDates?: boolean;
      showLocation?: boolean;
      showLinks?: boolean;
      showTags?: boolean;
      layout?: 'vertical' | 'horizontal' | 'grid';
    };
  }>;
}

export const cleanMinimalTemplateData: TemplateData = {
  personalInfo: {
    name: 'Nikhil Dundu',
    title: 'Supply Chain Analyst',
    address: 'AZ USA',
    email: 'ndundu1804@gmail.com',
    website: 'https://www.linkedin.com/in/nikhild180495/',
    phone: '+1 623-388-1239'
  },
  summary: 'Results-driven Supply Chain Analyst with 5 years of experience. India & USA optimizing end-to-end supply chain operations for heavy equipment, telecom, and defense electronics manufacturers. Proven record of reducing inventory 15 – 25 %, cutting logistics costs 12 – 18 %, and accelerating on-time delivery through data-driven planning. Lean Six Sigma methods, and advanced analytics (Power BI, Tableau, SQL, SAP, ERP, WMS). Adept at Agile & Waterfall project environments, cross-functional leadership, and translating complex data into actionable insights that drive margin and service-level improvements.',
  skills: {
    technical: [
      'Analytics & Reporting: Power BI, Tableau, Advanced Excel (Pivot, Power Query, Solver, VBA)',
      'Database & Languages: SQL Server, MS Access, Python, R, MATLAB',
      'ERP / SCM Systems: SAP (MM, WM, PP, QM, CO), Oracle NetSuite, Looker',
      'Process Ideologies: SDLC, Agile/Scrum, Waterfall, Lean Six Sigma, 5S',
      'Planning & Optimization: Demand Forecasting, S&OP, JIT, ROP, Inventory Optimization, Scorecards',
      'Project & Collaboration: Jira, Confluence, MS Project, SharePoint, Git',
      'Soft Skills: Stakeholder Communication, Cross-functional Leadership, Process Improvement, Data Storytelling'
    ],
    professional: []
  },
  experience: [
    {
      title: 'Supply Chain Analyst — Systel Inc. (Remote — Austin, TX, USA)',
      company: '',
      dates: 'Apr 2023 – Present',
      achievements: [
        'Implemented JIT and ROP inventory models for rugged-server line; reducing excess stock by 15% while maintaining a 98% service level.',
        'Designed and launched Power BI dashboards with Row-Level Security, enabling 50+ users to access real-time inventory and demand KPIs.',
        'Automated manual reporting workflows, cutting weekly report preparation time from 6 hours to under 30 minutes.',
        'Collaborated with cross-functional teams to align demand planning and procurement, improving planning accuracy and visibility.',
        'Led data consolidation and reporting standardization using Excel and SQL, streamlining data-driven decision-making processes.'
      ]
    },
    {
      title: 'Supply Chain Analyst — Sterlite Technologies Ltd. (Chennai, India)',
      company: '',
      dates: 'Apr 2020 – Apr 2023',
      achievements: [
        'Managed end-to-end order fulfillment for fiber optic cables (400+ demand); deployed SAP MM MRP parameters and safety-stock modeling, cutting stockouts 22 %.',
        'Designed integrated Power BI-Tableau supply-chain control tower integrating SAP, WMS, and freight APIs; provided real-time OTD, capacity, and cost dashboards used by COO.',
        'Partnered with procurement to institute Supplier Scorecards (quality, OTD, cost variance), improved top-tier supplier OTD from 85 % to 97 % within 9 months.',
        'Led data consolidation DMAIC project on extrusion line changeovers; reduced setup time 18 % and saved ₹11 M annually.',
        'Forecasted demand using ARIMA & Prophet models in Python, improving 6-month forecast accuracy from 72 % to 88 %.',
        'Automated daily WMS reconciliations via SQL & VBA, eliminating 600+ manual hours per year.'
      ]
    },
    {
      title: 'Supply Chain Analyst — Caterpillar (Chennai, India)',
      company: '',
      dates: 'Jun 2018 – Mar 2020',
      achievements: [
        'Co-developed inventory segmentation (ABC/XYZ) and Goal-Seek/Solver-based reorder policies, reducing working capital by 10 (1.5 % of finished-goods inventory).',
        'Enhanced SAP SD order-to-cash workflow; cut order cycle time 20 % and improved order fillrate 10 pp.',
        'Piloted barcode/RFID tracking for engine components; delivered real-time visibility and cut data entry errors 15 %.',
        'Supported implementation of Power BI KPI suite for plant leadership, enabling weekly variance root-cause reviews and driving 5 % productivity gain.',
        'Facilitated supplier negotiations that lowered raw-material cost 12 % and instituted consignment stock for high-turn items.'
      ]
    }
  ],
  education: [
    {
      degree: 'Master of Science, Industrial Engineering (GPA: 3.73) Tempe, Arizona',
      institution: 'Arizona State University',
      dates: 'Aug 2023 - May 2025',
      details: []
    },
    {
      degree: 'Bachelor of Technology, Mechanical Engineering (GPA: 3.65) Chennai, India',
      institution: 'SRM University',
      dates: 'Jun 2013 - Jul 2017',
      details: []
    }
  ],
  additionalInfo: {
    languages: [],
    certifications: [],
    awards: []
  }
};