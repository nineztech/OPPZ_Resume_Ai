import React, { useEffect } from 'react';

interface TemplateData {
  personalInfo: {
    name: string;
    title: string;
    address: string;
    email: string;
    website: string;
    github?: string;
    linkedin?: string;
    phone?: string;
  };
  summary: string;
  skills: {
    technical: string[] | { [category: string]: string[] };
    professional?: string[];
  };
  experience: Array<{
    title: string;
    company: string;
    dates: string;
    achievements: string[];
    description?: string; // Added for fallback
    location?: string; // Added for location display
  }>;
  education: Array<{
    degree: string;
    institution: string;
    dates: string;
    details: string[];
    location?: string;
  }>;
  projects?: Array<{
    Name: string;
    Description: string;
    Tech_Stack: string;
    Start_Date?: string;
    End_Date?: string;
    Link?: string;
  }>;
  certifications?: Array<{
    certificateName: string;
    instituteName: string;
    issueDate?: string;
    link?: string;
  }>;
  additionalInfo: {
    languages?: string[];
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

interface CleanMinimalProps {
  data?: TemplateData;
  color?: string;
  visibleSections?: Set<string>;
  sectionOrder?: string[];
  customization?: {
    theme: {
      primaryColor: string;
      secondaryColor: string;
      textColor: string;
      backgroundColor: string;
      accentColor: string;
      borderColor: string;
      headerColor: string;
    };
    // FlowCV-style color customization
    colorMode?: 'basic' | 'advanced' | 'border';
    accentType?: 'accent' | 'multi' | 'image';
    selectedPalette?: string | null;
    applyAccentTo?: {
      name: boolean;
      headings: boolean;
      headerIcons: boolean;
      dotsBarsBubbles: boolean;
      dates: boolean;
      linkIcons: boolean;
    };
    // Entry layout customization
    entryLayout?: {
      layoutType: 'text-left-icons-right' | 'icons-left-text-right' | 'icons-text-icons' | 'two-lines';
      titleSize: 'small' | 'medium' | 'large';
      subtitleStyle: 'normal' | 'bold' | 'italic';
      subtitlePlacement: 'same-line' | 'next-line';
      indentBody: boolean;
      listStyle: 'bullet' | 'hyphen';
      descriptionFormat: 'paragraph' | 'points';
    };
    // Name customization
    nameCustomization?: {
      size: 'xs' | 's' | 'm' | 'l' | 'xl';
      bold: boolean;
      font: 'body' | 'creative';
      fontWeight?: number;
    };
    // Professional title customization
    titleCustomization?: {
      size: 's' | 'm' | 'l';
      position: 'same-line' | 'below';
      style: 'normal' | 'italic';
      separationType: 'vertical-line' | 'bullet' | 'dash' | 'space';
    };
    typography: {
      fontFamily: {
        header: string;
        body: string;
        name: string;
      };
      fontSize: {
        name: number;
        title: number;
        headers: number;
        body: number;
        subheader: number;
      };
      fontWeight: {
        name: number;
        headers: number;
        body: number;
      };
    };
    layout: {
      margins: {
        top: number;
        bottom: number;
        left: number;
        right: number;
      };
      sectionSpacing: number;
      lineHeight: number;
    };
    // Section headings customization
    sectionHeadings?: {
      style: 'left-align-underline' | 'center-align-underline' | 'center-align-no-line' | 'box-style' | 'double-line' | 'left-extended' | 'wavy-line';
      alignment: 'left' | 'center' | 'right';
      showUnderline: boolean;
      underlineStyle: 'solid' | 'dashed' | 'dotted' | 'double' | 'wavy';
      underlineColor: string;
    };
  };
}

const cleanMinimalTemplateData: TemplateData = {
  personalInfo: {
    name: 'Nikhil Dund',
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
  projects: [
    {
      Name: 'Supply Chain Optimization Dashboard',
      Description: 'Developed a comprehensive Power BI dashboard integrating SAP and WMS data to provide real-time visibility into inventory levels, demand forecasting, and supplier performance metrics. The dashboard features interactive visualizations for inventory turnover rates, supplier lead times, and demand variability analysis. Implemented automated data refresh mechanisms connecting to multiple ERP systems including SAP MM, WM, and PP modules. Created custom DAX measures for calculating key performance indicators such as inventory carrying costs, stockout frequency, and supplier reliability scores. The solution includes mobile-responsive design enabling field managers to access critical supply chain metrics on-the-go. Integrated advanced analytics capabilities using Python scripts for predictive demand forecasting and anomaly detection. Developed user-specific security roles ensuring data confidentiality across different organizational levels. The dashboard processes over 2 million data points daily and has reduced manual reporting time by 85%. Successfully deployed across 15+ manufacturing facilities with 200+ active users. The project resulted in 20% improvement in inventory accuracy and 15% reduction in carrying costs.',
      Tech_Stack: 'Power BI, SQL Server, SAP, Python, DAX, Azure Data Factory',
      Start_Date: 'Jan 2023',
      End_Date: 'Mar 2023',
      Link: 'https://github.com/example/supply-chain-dashboard'
    },
    {
      Name: 'Inventory Management System',
      Description: 'Built an automated inventory tracking system using RFID technology and machine learning algorithms to optimize stock levels and reduce carrying costs by 15%. The system integrates with existing WMS and ERP platforms to provide real-time inventory visibility across multiple warehouse locations. Implemented RFID readers and sensors at strategic points throughout the supply chain to capture item-level data automatically. Developed machine learning models using Python and scikit-learn to predict demand patterns and optimize reorder points based on historical consumption data. Created a web-based dashboard using React and Node.js for inventory managers to monitor stock levels, set alerts, and generate automated purchase orders. The system includes barcode scanning capabilities for mobile devices enabling warehouse staff to update inventory counts in real-time. Integrated with supplier APIs to enable automated replenishment and reduce manual procurement processes. Implemented data validation rules and exception handling to ensure data integrity and system reliability. The solution processes over 50,000 inventory transactions daily and has improved inventory accuracy from 78% to 96%. Successfully reduced stockout incidents by 40% and excess inventory by 25% across all managed locations.',
      Tech_Stack: 'Python, Machine Learning, RFID, SQL, React, Node.js, MongoDB',
      Start_Date: 'Jun 2022',
      End_Date: 'Dec 2022',
      Link: 'https://github.com/example/inventory-ml'
    }
  ],
  certifications: [
    {
      certificateName: 'Introduction to Data Analytics',
      instituteName: 'IBM',
      issueDate: '2023'
    },
    {
      certificateName: 'Analyzing and Visualizing Data with Microsoft Power BI',
      instituteName: 'Microsoft',
      issueDate: '2023'
    },
    {
      certificateName: 'Lean Six Sigma Green Belt',
      instituteName: 'ASQ (American Society for Quality)',
      issueDate: '2022'
    }
  ],
  additionalInfo: {
    languages: [],
    awards: []
  }
};

const ResumePDF: React.FC<CleanMinimalProps> = ({ data, color, visibleSections, sectionOrder, customization }) => {
  // Use the passed data prop if available, otherwise fall back to default data
  const templateData = data || cleanMinimalTemplateData;

  // Function to load Google Fonts dynamically
  const loadGoogleFont = (fontFamily: string) => {
    // Extract the primary font name from the font family string
    const fontName = fontFamily.split(',')[0].replace(/['"]/g, '').replace(/\s+/g, '+');
    
    // Check if font is already loaded
    const existingLink = document.querySelector(`link[href*="${fontName}"]`);
    if (existingLink) return;

    // Create link element to load Google Font
    const link = document.createElement('link');
    link.href = `https://fonts.googleapis.com/css2?family=${fontName}:wght@300;400;500;600;700&display=swap`;
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  };

  // Load fonts when customization changes
  useEffect(() => {
    if (customization?.typography?.fontFamily) {
      loadGoogleFont(customization.typography.fontFamily.name);
      loadGoogleFont(customization.typography.fontFamily.header);
      loadGoogleFont(customization.typography.fontFamily.body);
    }
  }, [customization?.typography?.fontFamily]);
  
  // Default visible sections if not provided
  const sections = visibleSections || new Set([
    'basic-details',
    'summary', 
    'skills',
    'experience',
    'education',
    'projects',
    'certifications'
  ]);

  // Default section order if not provided
  const defaultSectionOrder = [
    'basic-details',
    'summary',
    'skills',
    'experience',
    'education',
    'projects',
    'certifications',
    'activities',
    'references'
  ];

  // Helper functions for entry layout
  const getSubtitleStyle = () => {
    const entryLayout = customization?.entryLayout;
    return {
      fontWeight: entryLayout?.subtitleStyle === 'bold' ? 'bold' : 'normal',
      fontStyle: entryLayout?.subtitleStyle === 'italic' ? 'italic' : 'normal'
    };
  };

  const getDescriptionStyle = () => {
    const entryLayout = customization?.entryLayout;
    return {
      marginLeft: entryLayout?.indentBody ? '16px' : '0px'
    };
  };

  // Helper functions for name customization
  const getNameSize = () => {
    const nameCustomization = customization?.nameCustomization;
    const sizes = {
      xs: '16px',
      s: '18px',
      m: '22px',
      l: '26px',
      xl: '30px'
    };
    return sizes[nameCustomization?.size || 'm'];
  };

  const getNameFontWeight = () => {
    const nameCustomization = customization?.nameCustomization;
    if (nameCustomization?.fontWeight) {
      return nameCustomization.fontWeight.toString();
    }
    return nameCustomization?.bold ? 'bold' : 'normal';
  };

  const getNameFontFamily = () => {
    const nameCustomization = customization?.nameCustomization;
    return nameCustomization?.font === 'creative' 
      ? 'Georgia, Times New Roman, serif' 
      : 'var(--font-family-name)';
  };

  // Helper functions for title customization
  const getProfessionalTitleSize = () => {
    const titleCustomization = customization?.titleCustomization;
    const sizes = {
      s: '12px',
      m: '14px',
      l: '16px'
    };
    return sizes[titleCustomization?.size || 'm'];
  };

  const getTitleStyle = () => {
    const titleCustomization = customization?.titleCustomization;
    return {
      fontStyle: titleCustomization?.style === 'italic' ? 'italic' : 'normal'
    };
  };

  const shouldShowTitleBelow = () => {
    const titleCustomization = customization?.titleCustomization;
    return titleCustomization?.position === 'below';
  };

  const getSeparationCharacter = () => {
    const titleCustomization = customization?.titleCustomization;
    const separationType = titleCustomization?.separationType || 'vertical-line';
    
    switch (separationType) {
      case 'vertical-line':
        return '|';
      case 'bullet':
        return '•';
      case 'dash':
        return '—';
      case 'space':
        return ' ';
      default:
        return '|';
    }
  };



  // Helper function for entry layout
  const getEntryLayout = () => {
    return customization?.entryLayout?.layoutType || 'two-lines';
  };

  const orderedSections = sectionOrder || defaultSectionOrder;

  // Helper function to render section headings based on customization
  const renderSectionHeading = (title: string) => {
    const headingStyle = customization?.sectionHeadings;
    if (!headingStyle) {
      // Default heading style
      return (
        <>
          <h2 className="text-left mb-0 uppercase" style={{ 
            fontSize: 'var(--font-size-headers)',
            fontWeight: 'var(--font-weight-headers)',
            fontFamily: 'var(--font-family-header)',
            letterSpacing: '0.5px',
            lineHeight: '2.5',
            color: customization?.applyAccentTo?.headings ? 'var(--accent-color)' : 'var(--header-color)'
          }}>
            {title}
          </h2>
          <div className="w-full border-t-2 -mt-2 mb-2" style={{ borderColor: customization?.applyAccentTo?.dotsBarsBubbles ? 'var(--accent-color)' : 'var(--border-color)' }}></div>
        </>
      );
    }

    const getAlignmentClass = () => {
      switch (headingStyle.alignment) {
        case 'center': return 'text-center';
        case 'right': return 'text-right';
        default: return 'text-left';
      }
    };

    const getUnderlineStyle = () => {
      if (!headingStyle.showUnderline) return 'none';
      
      const color = headingStyle.underlineColor || 'var(--border-color)';
      switch (headingStyle.underlineStyle) {
        case 'dashed': return `2px dashed ${color}`;
        case 'dotted': return `2px dotted ${color}`;
        case 'double': return `2px double ${color}`;
        case 'wavy': return `2px wavy ${color}`;
        default: return `2px solid ${color}`;
      }
    };

    const renderHeadingContent = () => {
      switch (headingStyle.style) {
        case 'left-align-underline':
          return (
            <>
              <h2 className={`${getAlignmentClass()} mb-0 uppercase`} style={{ 
                fontSize: 'var(--font-size-headers)',
                fontWeight: 'var(--font-weight-headers)',
                fontFamily: 'var(--font-family-header)',
                letterSpacing: '0.5px',
                lineHeight: '2.5',
                color: customization?.applyAccentTo?.headings ? 'var(--accent-color)' : 'var(--header-color)'
              }}>
                {title}
              </h2>
              {headingStyle.showUnderline && (
                <div className="w-full -mt-2 mb-2" style={{ 
                  borderTop: getUnderlineStyle(),
                  height: '0'
                }}></div>
              )}
            </>
          );

        case 'center-align-underline':
          return (
            <>
              <h2 className={`${getAlignmentClass()} mb-0 uppercase`} style={{ 
                fontSize: 'var(--font-size-headers)',
                fontWeight: 'var(--font-weight-headers)',
                fontFamily: 'var(--font-family-header)',
                letterSpacing: '0.5px',
                lineHeight: '2.5',
                color: customization?.applyAccentTo?.headings ? 'var(--accent-color)' : 'var(--header-color)'
              }}>
                {title}
              </h2>
              {headingStyle.showUnderline && (
                <div className="w-full -mt-2 mb-2" style={{ 
                  borderTop: getUnderlineStyle(),
                  height: '0'
                }}></div>
              )}
            </>
          );

        case 'center-align-no-line':
          return (
            <h2 className={`${getAlignmentClass()} mb-2 uppercase`} style={{ 
              fontSize: 'var(--font-size-headers)',
              fontWeight: 'var(--font-weight-headers)',
              fontFamily: 'var(--font-family-header)',
              letterSpacing: '0.5px',
              lineHeight: '2.5',
              color: customization?.applyAccentTo?.headings ? 'var(--accent-color)' : 'var(--header-color)'
            }}>
              {title}
            </h2>
          );

        case 'box-style':
          return (
            <div className="rounded-md p-0 mb-2" style={{
              backgroundColor: '#f3f4f6',
              border: 'none'
            }}>
              <h2 className="text-center mb-0 uppercase" style={{ 
                fontSize: 'var(--font-size-headers)',
                fontWeight: 'var(--font-weight-headers)',
                fontFamily: 'var(--font-family-header)',
                letterSpacing: '0.5px',
                lineHeight: '2.5',
                color: customization?.applyAccentTo?.headings ? 'var(--accent-color)' : 'var(--header-color)'
              }}>
                {title}
              </h2>
            </div>
          );

        case 'double-line':
          return (
            <>
              <div className="w-full mb-1" style={{ 
                borderTop: getUnderlineStyle(),
                height: '0'
              }}></div>
              <h2 className={`${getAlignmentClass()} mb-0 uppercase`} style={{ 
                fontSize: 'var(--font-size-headers)',
                fontWeight: 'var(--font-weight-headers)',
                fontFamily: 'var(--font-family-header)',
                letterSpacing: '0.5px',
                lineHeight: '2.5',
                color: customization?.applyAccentTo?.headings ? 'var(--accent-color)' : 'var(--header-color)'
              }}>
                {title}
              </h2>
              <div className="w-full -mt-1 mb-2" style={{ 
                borderTop: getUnderlineStyle(),
                height: '0'
              }}></div>
            </>
          );

        case 'left-extended':
          return (
            <>
              <div className="flex items-center mb-2">
                <div className="w-4 h-1 mr-2" style={{
                  backgroundColor: customization?.applyAccentTo?.dotsBarsBubbles ? 'var(--accent-color)' : 'var(--border-color)',
                  borderRadius: '2px'
                }}></div>
                <h2 className="mb-0 uppercase" style={{ 
                  fontSize: 'var(--font-size-headers)',
                  fontWeight: 'var(--font-weight-headers)',
                  fontFamily: 'var(--font-family-header)',
                  letterSpacing: '0.5px',
                  lineHeight: '2.5',
                  color: customization?.applyAccentTo?.headings ? 'var(--accent-color)' : 'var(--header-color)'
                }}>
                  {title}
                </h2>
                <div className="flex-1 ml-2" style={{ 
                  borderTop: getUnderlineStyle(),
                  height: '0'
                }}></div>
              </div>
            </>
          );

        case 'wavy-line':
          return (
            <>
              <h2 className={`${getAlignmentClass()} mb-0 uppercase`} style={{ 
                fontSize: 'var(--font-size-headers)',
                fontWeight: 'var(--font-weight-headers)',
                fontFamily: 'var(--font-family-header)',
                letterSpacing: '0.5px',
                lineHeight: '2.5',
                color: customization?.applyAccentTo?.headings ? 'var(--accent-color)' : 'var(--header-color)'
              }}>
                {title}
              </h2>
              {headingStyle.showUnderline && (
                <div className="-mt-2 mb-2" style={{ 
                  borderTop: getUnderlineStyle(),
                  height: '0',
                  width: 'fit-content'
                }}></div>
              )}
            </>
          );

        default:
          return (
            <>
              <h2 className={`${getAlignmentClass()} mb-0 uppercase`} style={{ 
                fontSize: 'var(--font-size-headers)',
                fontWeight: 'var(--font-weight-headers)',
                fontFamily: 'var(--font-family-header)',
                letterSpacing: '0.5px',
                lineHeight: '2.5',
                color: customization?.applyAccentTo?.headings ? 'var(--accent-color)' : 'var(--header-color)'
              }}>
                {title}
              </h2>
              {headingStyle.showUnderline && (
                <div className="w-full -mt-2 mb-2" style={{ 
                  borderTop: getUnderlineStyle(),
                  height: '0'
                }}></div>
              )}
            </>
          );
      }
    };

    return renderHeadingContent();
  };

  // Function to render sections in order
  const renderOrderedSections = () => {
    const sectionComponents: { [key: string]: React.ReactElement } = {
      'summary': (
        <div key="summary" style={{ position: 'relative', marginBottom: 'var(--section-spacing)' }}>
          {renderSectionHeading('SUMMARY')}
          <div className="ml-0 mt-0 mb-0 p-0" >
            <div className="text-sm" style={{ 
              fontSize: 'var(--font-size-body)',
              fontFamily: 'var(--font-family-body)',
              lineHeight: 'var(--line-height)',
              textAlign: 'justify',
              color: 'var(--text-color)',
              fontWeight: 'var(--font-weight-body)'
            }}>
              {templateData.summary && templateData.summary.trim() !== '' 
                ? templateData.summary 
                : 'Write a compelling summary of your professional background and key strengths...'}
            </div>
          </div>
        </div>
      ),
      'skills': (
        <div key="skills" style={{ marginBottom: 'var(--section-spacing)' }}>
          {renderSectionHeading('TECHNICAL SKILLS')}
          <div className="space-y-0">
            {templateData.skills?.technical && templateData.skills.technical !== null && templateData.skills.technical !== undefined ? (
              typeof templateData.skills.technical === 'object' && !Array.isArray(templateData.skills.technical) ? (
                // Handle categorized skills structure - display as "Category: skills"
                Object.entries(templateData.skills.technical).map(([category, skills]) => {
                  // Skip empty categories
                  if (!skills || (Array.isArray(skills) && skills.length === 0)) {
                    return null;
                  }
                  
                  // Ensure skills is an array
                  const skillsArray = Array.isArray(skills) ? skills : [skills];
                  
                  return (
                    <div key={category} className="text-sm" style={{ 
                      fontSize: 'var(--font-size-body)',
                      lineHeight: 'var(--line-height)',
                      color: 'var(--text-color)'
                    }}>
                      <span className="" style={{ fontWeight: 'var(--font-weight-headers)', color: 'var(--header-color)', fontSize: 'var(--font-size-subheader)' }}>{category}:</span> {skillsArray.filter(skill => skill && typeof skill === 'string').join(', ')}
                    </div>
                  );
                }).filter(Boolean) // Remove null entries
              ) : Array.isArray(templateData.skills.technical) && templateData.skills.technical.length > 0 ? (
                // Handle flat skills array - parse key-value pairs
                templateData.skills.technical.map((skill, index) => {
                  if (!skill || typeof skill !== 'string') return null;
                  
                  // Check if skill contains a colon (key-value format)
                  if (skill.includes(':')) {
                    const [key, value] = skill.split(':', 2);
                    return (
                      <div key={index} className="text-sm" style={{ 
                        fontSize: 'var(--font-size-body)',
                        lineHeight: 'var(--line-height)',
                        color: 'var(--text-color)'
                      }}>
                        <span className="" style={{ fontWeight: 'var(--font-weight-headers)', color: 'var(--header-color)', fontSize: 'var(--font-size-subheader)' }}>{key.trim()}:</span> {value.trim()}
                      </div>
                    );
                  } else {
                    // Fallback for skills without colon
                    return (
                      <div key={index} className="text-sm" style={{ 
                        fontSize: 'var(--font-size-body)',
                        lineHeight: 'var(--line-height)',
                        color: 'var(--text-color)'
                      }}>
                        {skill}
                      </div>
                    );
                  }
                })
              ) : (
                // Show placeholder when no skills are present
                <div className="text-sm" style={{ 
                  fontSize: 'var(--font-size-body)',
                  lineHeight: 'var(--line-height)',
                  color: '#666666',
                  fontStyle: 'italic'
                }}>
                  Add your technical skills here...
                </div>
              )
            ) : (
              // Show placeholder when no skills are present
              <div className="text-sm" style={{ 
                fontSize: 'var(--font-size-body)',
                lineHeight: 'var(--line-height)',
                color: '#666666',
                fontStyle: 'italic'
              }}>
                Add your technical skills here...
              </div>
            )}
          </div>
        </div>
      ),
      'experience': (
        <div key="experience" style={{ marginBottom: 'var(--section-spacing)' }}>
          {renderSectionHeading('PROFESSIONAL EXPERIENCE')}
          <div className="-space-y-2 -mt-3">
            {Array.isArray(templateData.experience) && templateData.experience.length > 0 ? (
              templateData.experience.map((exp, index) => {
                const entryLayout = customization?.entryLayout;
                const subtitleStyle = getSubtitleStyle();
                const descriptionStyle = getDescriptionStyle();
                const layoutType = getEntryLayout();
                
                // Handle subtitle placement
                const shouldShowSubtitleOnSameLine = entryLayout?.subtitlePlacement === 'same-line';
                
                // Extract designation from title field (remove company name after —)
                const getDesignationFromTitle = (title: string) => {
                  const parts = title.split('—');
                  if (parts.length >= 2) {
                    // Take only the designation part (before —) and remove any company name after —
                    const designationPart = parts[0].trim();
                    return designationPart;
                  }
                  return title;
                };
                
                const designation = getDesignationFromTitle(exp.title || '');
                
                // Extract company name from title field
                const getCompanyFromTitle = (title: string) => {
                  const parts = title.split('—');
                  if (parts.length >= 2) {
                    // Take the company part (after —)
                    const companyPart = parts[1].trim();
                    return companyPart;
                  }
                  return '';
                };
                
                const companyFromTitle = getCompanyFromTitle(exp.title || '');
                
                // Render based on layout type
                const renderLayout = () => {
                  switch (layoutType) {
                    case 'text-left-icons-right':
                      return (
                        <div className="flex justify-between  items-start">
                          <div className="flex-1">
                            {shouldShowSubtitleOnSameLine ? (
                              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }} >
                                <h3 className="" style={{ 
                                  fontSize: 'var(--font-size-subheader)',
                                  fontWeight: 'var(--font-weight-headers)',
                                  letterSpacing: '0.3px',
                                  color: customization?.applyAccentTo?.headings ? 'var(--accent-color)' : 'var(--header-color)',
                                  margin: 0
                                }}>
                                  {companyFromTitle || exp.company || 'Company Name'}
                                  {designation && designation.trim() && (
                                    <span style={{ color: customization?.applyAccentTo?.headings ? 'var(--accent-color)' : 'var(--header-color)' }}> | {designation}</span>
                                  )}
                                  {exp.location && exp.location.trim() && (
                                    <span style={{ color: customization?.applyAccentTo?.headings ? 'var(--accent-color)' : 'var(--header-color)' }}> | {exp.location}</span>
                                  )}
                                </h3>
                              </div>
                            ) : (
                              <>
                                <h3 className="" style={{ 
                                  fontSize: 'var(--font-size-subheader)',
                                  fontWeight: 'var(--font-weight-headers)',
                                  letterSpacing: '0.3px',
                                  color: customization?.applyAccentTo?.headings ? 'var(--accent-color)' : 'var(--header-color)'
                                }}>
                                  {companyFromTitle || exp.company || 'Company Name'}
                                  {exp.location && exp.location.trim() && (
                                    <span style={{ color: customization?.applyAccentTo?.headings ? 'var(--accent-color)' : 'var(--header-color)' }}> | {exp.location}</span>
                                  )}
                                </h3>
                                <p className="text-gray-600 -mt-2 mb-1" style={{ 
                                  fontSize: 'var(--font-size-body)',
                                  letterSpacing: '0.2px',
                                  fontWeight: 'bold',
                                  fontStyle: subtitleStyle.fontStyle
                                }}>
                                  {designation || 'Job Title'}
                                </p>
                              </>
                            )}
                          </div>
                          <div className="flex items-center gap-2 ml-2">
                            <div className="w-3  h-3 bg-gray-400 rounded-full"></div>
                            <div className=" text-right" style={{ 
                              fontSize: 'var(--font-size-subheader)',
                              fontWeight: 'var(--font-weight-headers)',
                              fontFamily: 'var(--font-family-header)',
                              letterSpacing: '0.2px'
                            }}>
                              <span className="" style={{ color: customization?.applyAccentTo?.dates ? 'var(--accent-color)' : 'var(--text-color)' }}>
                                {exp.dates || 'Start Date - End Date'}
                              </span>
                            </div>
                          </div>
                        </div>
                      );

                    case 'icons-left-text-right':
                      return (
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                            <div className="flex-1">
                              {shouldShowSubtitleOnSameLine ? (
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                                  <h3 className="" style={{ 
                                    fontSize: 'var(--font-size-subheader)',
                                    fontWeight: 'var(--font-weight-headers)',
                                    letterSpacing: '0.3px',
                                    color: customization?.applyAccentTo?.headings ? 'var(--accent-color)' : 'var(--header-color)',
                                    margin: 0
                                  }}>
                                    {companyFromTitle || exp.company || 'Company Name'}
                                    {exp.title && exp.title.trim() && (
                                      <span style={{ color: customization?.applyAccentTo?.headings ? 'var(--accent-color)' : 'var(--header-color)' }}> | {exp.title}</span>
                                    )}
                                    {exp.location && exp.location.trim() && (
                                      <span style={{ color: customization?.applyAccentTo?.headings ? 'var(--accent-color)' : 'var(--header-color)' }}> | {exp.location}</span>
                                    )}
                                  </h3>
                                </div>
                              ) : (
                                <>
                                  <h3 className="" style={{ 
                                    fontSize: 'var(--font-size-subheader)',
                                    fontWeight: 'var(--font-weight-headers)',
                                    letterSpacing: '0.3px',
                                    color: customization?.applyAccentTo?.headings ? 'var(--accent-color)' : 'var(--header-color)'
                                  }}>
                                    {companyFromTitle || exp.company || 'Company Name'}
                                    {exp.location && exp.location.trim() && (
                                      <span style={{ color: customization?.applyAccentTo?.headings ? 'var(--accent-color)' : 'var(--header-color)' }}> | {exp.location}</span>
                                    )}
                                  </h3>
                                  <p className="text-gray-600 -mt-2 mb-1" style={{ 
                                    fontSize: 'var(--font-size-body)',
                                    letterSpacing: '0.2px',
                                    ...subtitleStyle
                                  }}>
                                    {designation || 'Job Title'}
                                  </p>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="text-right mt-2" style={{ 
                            fontSize: 'var(--font-size-subheader)',
                            fontWeight: 'var(--font-weight-headers)',
                            fontFamily: 'var(--font-family-header)',
                            letterSpacing: '0.2px'
                          }}>
                            <span style={{ color: customization?.applyAccentTo?.dates ? 'var(--accent-color)' : 'var(--text-color)' }}>
                              {exp.dates || 'Start Date - End Date'}
                            </span>
                          </div>
                        </div>
                      );

                    case 'icons-text-icons':
                      return (
                        <div className="flex justify-between items-start">
                          <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                          <div className="flex-1 mx-2">
                            {shouldShowSubtitleOnSameLine ? (
                              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                                <h3 className="" style={{ 
                                  fontSize: 'var(--font-size-subheader)',
                                  fontWeight: 'var(--font-weight-headers)',
                                  letterSpacing: '0.3px',
                                  color: customization?.applyAccentTo?.headings ? 'var(--accent-color)' : 'var(--header-color)',
                                  margin: 0
                                }}>
                                  {companyFromTitle || exp.company || 'Company Name'}
                                  {designation && designation.trim() && (
                                    <span style={{ color: customization?.applyAccentTo?.headings ? 'var(--accent-color)' : 'var(--header-color)' }}> | {designation}</span>
                                  )}
                                  {exp.location && exp.location.trim() && (
                                    <span style={{ color: customization?.applyAccentTo?.headings ? 'var(--accent-color)' : 'var(--header-color)' }}> | {exp.location}</span>
                                  )}
                                </h3>
                              </div>
                            ) : (
                              <>
                                <h3 className="" style={{ 
                                  fontSize: 'var(--font-size-subheader)',
                                  fontWeight: 'var(--font-weight-headers)',
                                  letterSpacing: '0.3px',
                                  color: customization?.applyAccentTo?.headings ? 'var(--accent-color)' : 'var(--header-color)'
                                }}>
                                  {companyFromTitle || exp.company || 'Company Name'}
                                  {exp.location && exp.location.trim() && (
                                    <span style={{ color: customization?.applyAccentTo?.headings ? 'var(--accent-color)' : 'var(--header-color)' }}> | {exp.location}</span>
                                  )}
                                </h3>
                                <p className="text-gray-600 -mt-2 mb-1" style={{ 
                                  fontSize: 'var(--font-size-body)',
                                  letterSpacing: '0.2px',
                                  fontWeight: 'bold',
                                  fontStyle: subtitleStyle.fontStyle
                                }}>
                                  {designation || 'Job Title'}
                                </p>
                              </>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-right" style={{ 
                              fontSize: 'var(--font-size-subheader)',
                              fontWeight: 'var(--font-weight-headers)',
                              fontFamily: 'var(--font-family-header)',
                              letterSpacing: '0.2px'
                            }}>
                              <span style={{ color: customization?.applyAccentTo?.dates ? 'var(--accent-color)' : 'var(--text-color)' }}>
                                {exp.dates || 'Start Date - End Date'}
                              </span>
                            </div>
                            <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                          </div>
                        </div>
                      );

                    case 'two-lines':
                    default:
                      return (
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            {shouldShowSubtitleOnSameLine ? (
                              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                                <h3 className="" style={{ 
                                  fontSize: 'var(--font-size-subheader)',
                                  fontWeight: 'var(--font-weight-headers)',
                                  letterSpacing: '0.3px',
                                  color: customization?.applyAccentTo?.headings ? 'var(--accent-color)' : 'var(--header-color)',
                                  margin: 0
                                }}>
                                  {companyFromTitle || exp.company || 'Company Name'}
                                  {designation && designation.trim() && (
                                    <span style={{ color: customization?.applyAccentTo?.headings ? 'var(--accent-color)' : 'var(--header-color)' }}> | {designation}</span>
                                  )}
                                  {exp.location && exp.location.trim() && (
                                    <span style={{ color: customization?.applyAccentTo?.headings ? 'var(--accent-color)' : 'var(--header-color)' }}> | {exp.location}</span>
                                  )}
                                </h3>
                              </div>
                            ) : (
                              <>
                                <h3 className="" style={{ 
                                  fontSize: 'var(--font-size-subheader)',
                                  fontWeight: 'var(--font-weight-headers)',
                                  letterSpacing: '0.3px',
                                  color: customization?.applyAccentTo?.headings ? 'var(--accent-color)' : 'var(--header-color)'
                                }}>
                                  {companyFromTitle || exp.company || 'Company Name'}
                                  {exp.location && exp.location.trim() && (
                                    <span style={{ color: customization?.applyAccentTo?.headings ? 'var(--accent-color)' : 'var(--header-color)' }}> | {exp.location}</span>
                                  )}
                                </h3>
                                <p className="text-gray-600 -mt-2 mb-1" style={{ 
                                  fontSize: 'var(--font-size-body)',
                                  letterSpacing: '0.2px',
                                  fontWeight: 'bold',
                                  fontStyle: subtitleStyle.fontStyle
                                }}>
                                  {designation || 'Job Title'}
                                </p>
                              </>
                            )}
                          </div>
                          <div className="text-right mt-2" style={{ 
                            fontSize: 'var(--font-size-subheader)',
                            fontWeight: 'var(--font-weight-headers)',
                            fontFamily: 'var(--font-family-header)',
                            letterSpacing: '0.2px'
                          }}>
                            <span style={{ color: customization?.applyAccentTo?.dates ? 'var(--accent-color)' : 'var(--text-color)' }}>
                              {exp.dates || 'Start Date - End Date'}
                            </span>
                          </div>
                        </div>
                      );
                  }
                };
                
                return (
                  <div key={index}>
                    {renderLayout()}
                    <div className="ml-0 mt-0" style={descriptionStyle}>
                      {Array.isArray(exp.achievements) && exp.achievements.length > 0 ? (
                        customization?.entryLayout?.descriptionFormat === 'points' ? (
                          exp.achievements.map((achievement, idx) => (
                            <div key={idx} className="flex items-start" style={{ fontSize: 'var(--font-size-body)', marginBottom: '2px' }}>
                              <span className="mr-2" style={{ fontWeight: 'bold', color: customization?.applyAccentTo?.dotsBarsBubbles ? 'var(--accent-color)' : 'var(--header-color)' }}>
                                {customization?.entryLayout?.listStyle === 'bullet' ? '•' : '–'}
                              </span>
                              <span className="leading-tight" style={{ lineHeight: 'var(--line-height)', color: 'var(--text-color)', fontWeight: 'var(--font-weight-body)' }}>
                                {achievement}
                              </span>
                            </div>
                          ))
                        ) : (
                          <div style={{ fontSize: 'var(--font-size-body)', lineHeight: 'var(--line-height)', color: 'var(--text-color)', fontWeight: 'var(--font-weight-body)', textAlign: 'justify' }}>
                            {exp.achievements.join(' ')}
                          </div>
                        )
                      ) : exp.description ? (
                        // Fallback to description if no achievements array
                        customization?.entryLayout?.descriptionFormat === 'points' ? (
                          (() => {
                            const newlineParts = exp.description.split(/\n+/g).map(s => s.trim()).filter(Boolean);
                            if (newlineParts.length > 1) {
                              return newlineParts.map((sentence, idx) => (
                                <div key={idx} className="flex items-start" style={{ fontSize: 'var(--font-size-body)', marginBottom: '2px' }}>
                                  <span className="mr-2" style={{ fontWeight: 'bold', color: customization?.applyAccentTo?.dotsBarsBubbles ? 'var(--accent-color)' : 'var(--header-color)' }}>
                                    {customization?.entryLayout?.listStyle === 'bullet' ? '•' : '–'}
                                  </span>
                                  <span className="leading-tight" style={{ lineHeight: 'var(--line-height)', color: 'var(--text-color)', fontWeight: 'var(--font-weight-body)' }}>
                                    {sentence}
                                  </span>
                                </div>
                              ));
                            }
                            
                            // Fallback to single description for legacy format
                            return (
                              <div className="flex items-start" style={{ fontSize: 'var(--font-size-body)', marginBottom: '2px' }}>
                                <span className="mr-2" style={{ fontWeight: 'bold', color: customization?.applyAccentTo?.dotsBarsBubbles ? 'var(--accent-color)' : 'var(--header-color)' }}>
                                  {customization?.entryLayout?.listStyle === 'bullet' ? '•' : '–'}
                                </span>
                                <span className="leading-tight" style={{ lineHeight: 'var(--line-height)', color: 'var(--text-color)', fontWeight: 'var(--font-weight-body)' }}>
                                  {exp.description}
                                </span>
                              </div>
                            );
                          })()
                        ) : (
                          <div style={{ fontSize: 'var(--font-size-body)', lineHeight: 'var(--line-height)', color: 'var(--text-color)', fontWeight: 'var(--font-weight-body)', textAlign: 'justify' }}>
                            {exp.description}
                          </div>
                        )
                      ) : (
                        // Show placeholder when no content
                        <div style={{ fontSize: 'var(--font-size-body)', lineHeight: 'var(--line-height)', color: '#666666', fontWeight: 'var(--font-weight-body)', fontStyle: 'italic', textAlign: 'justify' }}>
                          Describe your key responsibilities and achievements...
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              // Show placeholder when no experience entries
              <div style={{ fontSize: 'var(--font-size-body)', lineHeight: 'var(--line-height)', color: '#666666', fontWeight: 'var(--font-weight-body)', fontStyle: 'italic', textAlign: 'justify' }}>
                Add your work experience here...
              </div>
            )}
          </div>
        </div>
      ),
      'projects': (
        <div key="projects" style={{ marginBottom: 'var(--section-spacing)' }}>
          {renderSectionHeading('PROJECTS')}
          <div className="-space-y-2 -mt-3">
            {Array.isArray(templateData.projects) && templateData.projects.length > 0 ? (
              templateData.projects.map((project, index) => {
                const entryLayout = customization?.entryLayout;
                const subtitleStyle = getSubtitleStyle();
                const descriptionStyle = getDescriptionStyle();
                const layoutType = getEntryLayout();
                
                // Handle subtitle placement
                const shouldShowSubtitleOnSameLine = entryLayout?.subtitlePlacement === 'same-line';
                
                // Render based on layout type
                const renderLayout = () => {
                  switch (layoutType) {
                    case 'text-left-icons-right':
                      return (
                        <div className="flex justify-between items-center ">
                          <div className="flex-1 ">
                            {shouldShowSubtitleOnSameLine ? (
                              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                                <h3 className="" style={{ 
                                  fontSize: 'var(--font-size-subheader)',
                                  fontWeight: 'var(--font-weight-headers)',
                                  letterSpacing: '0.3px',
                                  color: customization?.applyAccentTo?.headings ? 'var(--accent-color)' : 'var(--header-color)',
                                  margin: 0
                                }}>
                                  {project.Name || 'Project Name'}
                                </h3>
                                <span style={{ 
                                  fontSize: 'var(--font-size-body)',
                                  color: '#666',
                                  letterSpacing: '0.2px',
                                  ...subtitleStyle
                                }}>
                                  {project.Tech_Stack || 'Tech Stack'}
                                </span>
                              </div>
                            ) : (
                              <>
                                <h3 className="" style={{ 
                                  fontSize: 'var(--font-size-subheader)',
                                  fontWeight: 'var(--font-weight-headers)',
                                  letterSpacing: '0.3px',
                                  color: customization?.applyAccentTo?.headings ? 'var(--accent-color)' : 'var(--header-color)'
                                }}>
                                  {project.Name || 'Project Name'}
                                </h3>
                                <span className="text-sm" style={{ 
                                  fontSize: 'var(--font-size-body)',
                                  color: '#666',
                                  letterSpacing: '0.2px',
                                  ...subtitleStyle
                                }}>
                                  {project.Tech_Stack || 'Tech Stack'}
                                </span>
                              </>
                            )}
                          </div>
                          <div className="flex items-center gap-2 ml-2">
                            <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                            <div className="" style={{ 
                              fontSize: 'var(--font-size-subheader)',
                              fontWeight: 'var(--font-weight-headers)',
                              fontFamily: 'var(--font-family-header)',
                              letterSpacing: '0.2px'
                            }}>
                              {(project.Start_Date || project.End_Date) ? (
                                <span style={{ color: customization?.applyAccentTo?.dates ? 'var(--accent-color)' : 'var(--text-color)' }}>
                                  {project.Start_Date && project.End_Date 
                                    ? `${project.Start_Date} - ${project.End_Date}`
                                    : project.Start_Date || project.End_Date
                                  }
                                </span>
                              ) : (
                                <span style={{ 
                                  color: '#666666',
                                  fontStyle: 'italic'
                                }}>
                                  Start Date - End Date
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );

                    case 'icons-left-text-right':
                      return (
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                            <div className="flex-1">
                              {shouldShowSubtitleOnSameLine ? (
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                                  <h3 className="" style={{ 
                                    fontSize: 'var(--font-size-subheader)',
                                    fontWeight: 'var(--font-weight-headers)',
                                    letterSpacing: '0.3px',
                                    color: customization?.applyAccentTo?.headings ? 'var(--accent-color)' : 'var(--header-color)',
                                    margin: 0
                                  }}>
                                    {project.Name || 'Project Name'}
                                  </h3>
                                  <span style={{ 
                                    fontSize: 'var(--font-size-body)',
                                    color: '#666',
                                    letterSpacing: '0.2px',
                                    ...subtitleStyle
                                  }}>
                                    {project.Tech_Stack || 'Tech Stack'}
                                  </span>
                                </div>
                              ) : (
                                <>
                                  <h3 className="" style={{ 
                                    fontSize: 'var(--font-size-subheader)',
                                    fontWeight: 'var(--font-weight-headers)',
                                    letterSpacing: '0.3px',
                                    color: customization?.applyAccentTo?.headings ? 'var(--accent-color)' : 'var(--header-color)'
                                  }}>
                                    {project.Name || 'Project Name'}
                                  </h3>
                                  <span className="text-sm" style={{ 
                                    fontSize: 'var(--font-size-body)',
                                    color: '#666',
                                    letterSpacing: '0.2px',
                                    ...subtitleStyle
                                  }}>
                                    {project.Tech_Stack || 'Tech Stack'}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="" style={{ 
                            fontSize: 'var(--font-size-subheader)',
                            fontWeight: 'var(--font-weight-headers)',
                            letterSpacing: '0.2px'
                          }}>
                            {(project.Start_Date || project.End_Date) ? (
                              <span style={{ color: customization?.applyAccentTo?.dates ? 'var(--accent-color)' : 'var(--text-color)' }}>
                                {project.Start_Date && project.End_Date 
                                  ? `${project.Start_Date} - ${project.End_Date}`
                                  : project.Start_Date || project.End_Date
                                }
                              </span>
                            ) : (
                              <span style={{ 
                                color: '#666666',
                                fontStyle: 'italic'
                              }}>
                                Start Date - End Date
                              </span>
                            )}
                          </div>
                        </div>
                      );

                    case 'icons-text-icons':
                      return (
                        <div className="flex justify-between items-center">
                          <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                          <div className="flex-1 mx-2">
                            {shouldShowSubtitleOnSameLine ? (
                              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                                <h3 className="" style={{ 
                                  fontSize: 'var(--font-size-subheader)',
                                  fontWeight: 'var(--font-weight-headers)',
                                  letterSpacing: '0.3px',
                                  color: customization?.applyAccentTo?.headings ? 'var(--accent-color)' : 'var(--header-color)',
                                  margin: 0
                                }}>
                                  {project.Name || 'Project Name'}
                                </h3>
                                <span style={{ 
                                  fontSize: 'var(--font-size-body)',
                                  color: '#666',
                                  letterSpacing: '0.2px',
                                  ...subtitleStyle
                                }}>
                                  {project.Tech_Stack || 'Tech Stack'}
                                </span>
                              </div>
                            ) : (
                              <>
                                <h3 className="" style={{ 
                                  fontSize: 'var(--font-size-subheader)',
                                  fontWeight: 'var(--font-weight-headers)',
                                  letterSpacing: '0.3px',
                                  color: customization?.applyAccentTo?.headings ? 'var(--accent-color)' : 'var(--header-color)'
                                }}>
                                  {project.Name || 'Project Name'}
                                </h3>
                                <span className="text-sm" style={{ 
                                  fontSize: 'var(--font-size-body)',
                                  color: '#666',
                                  letterSpacing: '0.2px',
                                  ...subtitleStyle
                                }}>
                                  {project.Tech_Stack || 'Tech Stack'}
                                </span>
                              </>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="" style={{ 
                              fontSize: 'var(--font-size-subheader)',
                              fontWeight: 'var(--font-weight-headers)',
                              fontFamily: 'var(--font-family-header)',
                              letterSpacing: '0.2px'
                            }}>
                              {(project.Start_Date || project.End_Date) ? (
                                <span style={{ color: customization?.applyAccentTo?.dates ? 'var(--accent-color)' : 'var(--text-color)' }}>
                                  {project.Start_Date && project.End_Date 
                                    ? `${project.Start_Date} - ${project.End_Date}`
                                    : project.Start_Date || project.End_Date
                                  }
                                </span>
                              ) : (
                                <span style={{ 
                                  color: '#666666',
                                  fontStyle: 'italic'
                                }}>
                                  Start Date - End Date
                                </span>
                              )}
                            </div>
                            <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                          </div>
                        </div>
                      );

                    case 'two-lines':
                    default:
                      return (
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            {shouldShowSubtitleOnSameLine ? (
                              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                                <h3 className="" style={{ 
                                  fontSize: 'var(--font-size-subheader)',
                                  fontWeight: 'var(--font-weight-headers)',
                                  letterSpacing: '0.3px',
                                  color: customization?.applyAccentTo?.headings ? 'var(--accent-color)' : 'var(--header-color)',
                                  margin: 0
                                }}>
                                  {project.Name || 'Project Name'}
                                </h3>
                                <span style={{ 
                                  fontSize: 'var(--font-size-body)',
                                  color: '#666',
                                  letterSpacing: '0.2px',
                                  ...subtitleStyle
                                }}>
                                  {project.Tech_Stack || 'Tech Stack'}
                                </span>
                              </div>
                            ) : (
                              <>
                                <h3 className="" style={{ 
                                  fontSize: 'var(--font-size-subheader)',
                                  fontWeight: 'var(--font-weight-headers)',
                                  letterSpacing: '0.3px',
                                  color: customization?.applyAccentTo?.headings ? 'var(--accent-color)' : 'var(--header-color)'
                                }}>
                                  {project.Name || 'Project Name'}
                                </h3>
                                <span className="text-sm" style={{ 
                                  fontSize: 'var(--font-size-body)',
                                  color: '#666',
                                  letterSpacing: '0.2px',
                                  ...subtitleStyle
                                }}>
                                  {project.Tech_Stack || 'Tech Stack'}
                                </span>
                              </>
                            )}
                          </div>
                          <div className="" style={{ 
                            fontSize: 'var(--font-size-subheader)',
                            fontWeight: 'var(--font-weight-headers)',
                            letterSpacing: '0.2px'
                          }}>
                            {(project.Start_Date || project.End_Date) ? (
                              <span style={{ color: customization?.applyAccentTo?.dates ? 'var(--accent-color)' : 'var(--text-color)' }}>
                                {project.Start_Date && project.End_Date 
                                  ? `${project.Start_Date} - ${project.End_Date}`
                                  : project.Start_Date || project.End_Date
                                }
                              </span>
                            ) : (
                              <span style={{ 
                                color: '#666666',
                                fontStyle: 'italic'
                              }}>
                                Start Date - End Date
                              </span>
                            )}
                          </div>
                        </div>
                      );
                  }
                };
                
                return (
                  <div key={index} style={{ marginBottom: '-10px' }}>
                    <div className="-mb-1.5">
                      {renderLayout()}
                    </div>
                    <div className="ml-0 mt-0" style={descriptionStyle}>
                      {project.Description ? (
                        customization?.entryLayout?.descriptionFormat === 'points' ? (
                          (() => {
                            // Split description by sentences and create bullet points
                            const descriptionParts = project.Description.split(/\.\s+/).map(s => s.trim()).filter(Boolean);
                            return (
                              <>
                                {descriptionParts.map((part, idx) => (
                                  <div key={idx} className="flex items-start" style={{ fontSize: 'var(--font-size-body)', marginBottom: '2px' }}>
                                    <span className="mr-2" style={{ fontWeight: 'bold', color: customization?.applyAccentTo?.dotsBarsBubbles ? 'var(--accent-color)' : 'var(--header-color)' }}>
                                      {customization?.entryLayout?.listStyle === 'bullet' ? '•' : '–'}
                                    </span>
                                    <span className="leading-tight" style={{ lineHeight: 'var(--line-height)', color: 'var(--text-color)', fontWeight: 'var(--font-weight-body)' }}>
                                      {part}{part.endsWith('.') ? '' : '.'}
                                    </span>
                                  </div>
                                ))}
                                {project.Link && project.Link.trim() && (
                                  <div className="flex items-start" style={{ fontSize: 'var(--font-size-body)', marginBottom: '2px' }}>
                                    <span className="mr-2" style={{ fontWeight: 'bold', color: customization?.applyAccentTo?.dotsBarsBubbles ? 'var(--accent-color)' : 'var(--header-color)' }}>
                                      {customization?.entryLayout?.listStyle === 'bullet' ? '•' : '–'}
                                    </span>
                                    <span className="leading-tight" style={{ lineHeight: 'var(--line-height)', color: 'var(--text-color)', fontWeight: 'var(--font-weight-body)' }}>
                                      <a href={project.Link} target="_blank" rel="noopener noreferrer" style={{ color: customization?.applyAccentTo?.linkIcons ? 'var(--accent-color)' : '#0077b5', textDecoration: 'underline' }}>
                                        View Project
                                      </a>
                                    </span>
                                  </div>
                                )}
                              </>
                            );
                          })()
                        ) : (
                          <div style={{ fontSize: 'var(--font-size-body)', lineHeight: 'var(--line-height)', color: 'var(--text-color)', fontWeight: 'var(--font-weight-body)', textAlign: 'justify' }}>
                            {project.Description}
                            {project.Link && project.Link.trim() && (
                              <span style={{ color: '#0077b5', textDecoration: 'underline', marginLeft: '4px' }}>
                                <a href={project.Link} target="_blank" rel="noopener noreferrer" style={{ color: customization?.applyAccentTo?.linkIcons ? 'var(--accent-color)' : '#0077b5', textDecoration: 'underline' }}>
                                  View Project
                                </a>
                              </span>
                            )}
                          </div>
                        )
                      ) : (
                        <div style={{ fontSize: 'var(--font-size-body)', lineHeight: 'var(--line-height)', color: '#666666', fontWeight: 'var(--font-weight-body)', fontStyle: 'italic', textAlign: 'justify' }}>
                          Describe your project details...
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              // Show placeholder when no projects
              <div style={{ fontSize: 'var(--font-size-body)', lineHeight: 'var(--line-height)', color: '#666666', fontWeight: 'var(--font-weight-body)', fontStyle: 'italic', textAlign: 'justify' }}>
                Add your projects here...
              </div>
            )}
          </div>
        </div>
      ),
      'education': (
        <div key="education" style={{ marginBottom: 'var(--section-spacing)' }}>
          {renderSectionHeading('EDUCATION')}
          <div className="space-y-0">
            {Array.isArray(templateData.education) && templateData.education.length > 0 ? (
              templateData.education.map((edu, index) => {
                const entryLayout = customization?.entryLayout;
                const subtitleStyle = getSubtitleStyle();
                const layoutType = getEntryLayout();
                
                // Handle subtitle placement
                const shouldShowSubtitleOnSameLine = entryLayout?.subtitlePlacement === 'same-line';
                
                // Render based on layout type
                const renderLayout = () => {
                  switch (layoutType) {
                    case 'text-left-icons-right':
                      return (
                        <div className="flex justify-between items-start" style={{ marginBottom: '6px' }}>
                          <div className="flex-1">
                            {shouldShowSubtitleOnSameLine ? (
                              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                                <div className="" style={{ 
                                  fontSize: 'var(--font-size-subheader)',
                                  fontWeight: 'var(--font-weight-headers)',
                                  letterSpacing: '0.3px',
                                  color: customization?.applyAccentTo?.headings ? 'var(--accent-color)' : 'var(--header-color)',
                                  margin: 0
                                }}>
                                  {edu.institution || 'Institution Name'}
                                </div>
                                <span style={{ 
                                  fontSize: 'var(--font-size-body)',
                                  color: '#666666',
                                  ...subtitleStyle
                                }}>
                                  {edu.degree || 'Degree/Program'}
                                  {edu.location && edu.location.trim() && (
                                    <span> | {edu.location}</span>
                                  )}
                                </span>
                              </div>
                            ) : (
                              <>
                                <div className="" style={{ 
                                  fontSize: 'var(--font-size-subheader)',
                                  fontWeight: 'var(--font-weight-headers)',
                                  letterSpacing: '0.3px',
                                  color: customization?.applyAccentTo?.headings ? 'var(--accent-color)' : 'var(--header-color)'
                                }}>
                                  {edu.institution || 'Institution Name'}
                                  {edu.location && edu.location.trim() && (
                                    <span style={{ fontWeight: 'var(--font-weight-headers)' }}> | {edu.location}</span>
                                  )}
                                </div>
                                <div style={{ 
                                  fontSize: 'var(--font-size-body)', 
                                  letterSpacing: '0.2px', 
                                  color: 'var(--text-color)',
                                  ...subtitleStyle
                                }}>
                                  {edu.degree || 'Degree/Program'}
                                </div>
                              </>
                            )}
                          </div>
                          <div className="flex items-center gap-2 ml-2">
                            <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                            <div className="" style={{ 
                              fontSize: 'var(--font-size-subheader)',
                              fontWeight: 'var(--font-weight-headers)',
                              fontFamily: 'var(--font-family-header)',
                              letterSpacing: '0.2px'
                            }}>
                              <span style={{ color: customization?.applyAccentTo?.dates ? 'var(--accent-color)' : 'var(--text-color)' }}>
                                {edu.dates || 'Graduation Year'}
                              </span>
                            </div>
                          </div>
                        </div>
                      );

                    case 'icons-left-text-right':
                      return (
                        <div className="flex justify-between items-start" style={{ marginBottom: '6px' }}>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                            <div className="flex-1">
                              {shouldShowSubtitleOnSameLine ? (
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                                  <div className="" style={{ 
                                    fontSize: 'var(--font-size-subheader)',
                                    fontWeight: 'var(--font-weight-headers)',
                                    letterSpacing: '0.3px',
                                    color: customization?.applyAccentTo?.headings ? 'var(--accent-color)' : 'var(--header-color)',
                                    margin: 0
                                  }}>
                                    {edu.institution || 'Institution Name'}
                                  </div>
                                <span style={{ 
                                  fontSize: 'var(--font-size-body)',
                                  color: '#666666',
                                  ...subtitleStyle
                                }}>
                                    {edu.degree || 'Degree/Program'}
                                    {edu.location && edu.location.trim() && (
                                      <span> | {edu.location}</span>
                                    )}
                                  </span>
                                </div>
                              ) : (
                                <>
                                  <div className="" style={{ 
                                    fontSize: 'var(--font-size-subheader)',
                                    fontWeight: 'var(--font-weight-headers)',
                                    letterSpacing: '0.3px',
                                    color: customization?.applyAccentTo?.headings ? 'var(--accent-color)' : 'var(--header-color)'
                                  }}>
                                    {edu.institution || 'Institution Name'}
                                    {edu.location && edu.location.trim() && (
                                      <span style={{ fontWeight: 'var(--font-weight-headers)' }}> | {edu.location}</span>
                                    )}
                                  </div>
                                  <div style={{ 
                                    fontSize: 'var(--font-size-body)', 
                                    letterSpacing: '0.2px', 
                                    color: 'var(--text-color)',
                                    ...subtitleStyle
                                  }}>
                                    {edu.degree || 'Degree/Program'}
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="" style={{ 
                            fontSize: 'var(--font-size-subheader)',
                            fontWeight: 'var(--font-weight-headers)',
                            letterSpacing: '0.2px'
                          }}>
                            <span style={{ color: customization?.applyAccentTo?.dates ? 'var(--accent-color)' : 'var(--text-color)' }}>
                              {edu.dates || 'Graduation Year'}
                            </span>
                          </div>
                        </div>
                      );

                    case 'icons-text-icons':
                      return (
                        <div className="flex justify-between items-start" style={{ marginBottom: '6px' }}>
                          <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                          <div className="flex-1 mx-2">
                            {shouldShowSubtitleOnSameLine ? (
                              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                                <div className="" style={{ 
                                  fontSize: 'var(--font-size-subheader)',
                                  fontWeight: 'var(--font-weight-headers)',
                                  letterSpacing: '0.3px',
                                  color: customization?.applyAccentTo?.headings ? 'var(--accent-color)' : 'var(--header-color)',
                                  margin: 0
                                }}>
                                  {edu.institution || 'Institution Name'}
                                </div>
                                <span style={{ 
                                  fontSize: 'var(--font-size-body)',
                                  color: '#666666',
                                  ...subtitleStyle
                                }}>
                                  {edu.degree || 'Degree/Program'}
                                  {edu.location && edu.location.trim() && (
                                    <span> | {edu.location}</span>
                                  )}
                                </span>
                              </div>
                            ) : (
                              <>
                                <div className="" style={{ 
                                  fontSize: 'var(--font-size-subheader)',
                                  fontWeight: 'var(--font-weight-headers)',
                                  letterSpacing: '0.3px',
                                  color: customization?.applyAccentTo?.headings ? 'var(--accent-color)' : 'var(--header-color)'
                                }}>
                                  {edu.institution || 'Institution Name'}
                                  {edu.location && edu.location.trim() && (
                                    <span style={{ fontWeight: 'var(--font-weight-headers)' }}> | {edu.location}</span>
                                  )}
                                </div>
                                <div style={{ 
                                  fontSize: 'var(--font-size-body)', 
                                  letterSpacing: '0.2px', 
                                  color: 'var(--text-color)',
                                  ...subtitleStyle
                                }}>
                                  {edu.degree || 'Degree/Program'}
                                </div>
                              </>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="" style={{ 
                              fontSize: 'var(--font-size-subheader)',
                              fontWeight: 'var(--font-weight-headers)',
                              fontFamily: 'var(--font-family-header)',
                              letterSpacing: '0.2px'
                            }}>
                              <span style={{ color: customization?.applyAccentTo?.dates ? 'var(--accent-color)' : 'var(--text-color)' }}>
                                {edu.dates || 'Graduation Year'}
                              </span>
                            </div>
                            <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                          </div>
                        </div>
                      );

                    case 'two-lines':
                    default:
                      return (
                        <div className="flex justify-between items-start" style={{ marginBottom: '6px' }}>
                          <div>
                            {shouldShowSubtitleOnSameLine ? (
                              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                                <div className="" style={{ 
                                  fontSize: 'var(--font-size-subheader)',
                                  fontWeight: 'var(--font-weight-headers)',
                                  letterSpacing: '0.3px',
                                  color: customization?.applyAccentTo?.headings ? 'var(--accent-color)' : 'var(--header-color)',
                                  margin: 0
                                }}>
                                  {edu.institution || 'Institution Name'}
                                </div>
                                <span style={{ 
                                  fontSize: 'var(--font-size-body)',
                                  color: '#666666',
                                  ...subtitleStyle
                                }}>
                                  {edu.degree || 'Degree/Program'}
                                  {edu.location && edu.location.trim() && (
                                    <span> | {edu.location}</span>
                                  )}
                                </span>
                              </div>
                            ) : (
                              <>
                                <div className="" style={{ 
                                  fontSize: 'var(--font-size-subheader)',
                                  fontWeight: 'var(--font-weight-headers)',
                                  letterSpacing: '0.3px',
                                  color: customization?.applyAccentTo?.headings ? 'var(--accent-color)' : 'var(--header-color)'
                                }}>
                                  {edu.institution || 'Institution Name'}
                                  {edu.location && edu.location.trim() && (
                                    <span style={{ fontWeight: 'var(--font-weight-headers)' }}> | {edu.location}</span>
                                  )}
                                </div>
                                <div style={{ 
                                  fontSize: 'var(--font-size-body)', 
                                  letterSpacing: '0.2px', 
                                  color: 'var(--text-color)',
                                  ...subtitleStyle
                                }}>
                                  {edu.degree || 'Degree/Program'}
                                </div>
                              </>
                            )}
                          </div>
                          <div className="" style={{ 
                            fontSize: 'var(--font-size-subheader)',
                            fontWeight: 'var(--font-weight-headers)',
                            letterSpacing: '0.2px'
                          }}>
                            <span style={{ color: customization?.applyAccentTo?.dates ? 'var(--accent-color)' : 'var(--text-color)' }}>
                              {edu.dates || 'Graduation Year'}
                            </span>
                          </div>
                        </div>
                      );
                  }
                };
                
                return (
                  <div key={index}>
                    {renderLayout()}
                  </div>
                );
              })
            ) : (
              // Show placeholder when no education entries
              <div className="flex justify-between items-start" style={{ marginBottom: '6px' }}>
                <div>
                  <div className="" style={{ 
                    fontSize: 'var(--font-size-body)',
                    fontWeight: 'var(--font-weight-headers)',
                    letterSpacing: '0.3px',
                    color: '#666666',
                    fontStyle: 'italic'
                  }}>
                    Institution Name | Location
                  </div>
                  <div style={{ fontSize: 'var(--font-size-body)', letterSpacing: '0.2px', color: '#666666', fontStyle: 'italic' }}>
                    Degree/Program
                  </div>
                </div>
                <div className="" style={{ 
                  fontSize: 'var(--font-size-body)',
                  fontWeight: 'var(--font-weight-headers)',
                  letterSpacing: '0.2px',
                  color: '#666666',
                  fontStyle: 'italic'
                }}>
                  Graduation Year
                  </div>
              </div>
            )}
          </div>
        </div>
      ),
      'certifications': (
        <div key="certifications" style={{ marginBottom: 'var(--section-spacing)' }}>
          {renderSectionHeading('CERTIFICATIONS')}
          <div className="space-y-0">
            {Array.isArray(templateData.certifications) && templateData.certifications.length > 0 ? (
              templateData.certifications.map((cert, index) => (
                <div key={index} className="flex justify-between items-start" style={{ marginBottom: '6px' }}>
                  <div>
                    <div style={{ 
                      fontSize: 'var(--font-size-body)',
                      letterSpacing: '0.2px',
                      color: 'var(--text-color)'
                    }}>
                      <span style={{ fontWeight: 'var(--font-weight-headers)', fontSize: 'var(--font-size-subheader)' }}>{cert.certificateName || 'Certificate Name'}</span> - <span style={{ color: 'var(--text-color)' }}>{cert.instituteName || 'Issuing Organization'}</span>
                      {cert.link && cert.link.trim() && (
                        <span style={{ marginLeft: '8px' }}>
                          <a href={cert.link} target="_blank" rel="noopener noreferrer" style={{ color: customization?.applyAccentTo?.linkIcons ? 'var(--accent-color)' : '#0077b5', textDecoration: 'underline', fontSize: 'var(--font-size-body)' }}>
                            View Certificate
                          </a>
                        </span>
                      )}
                    </div>
                  </div>
                  {cert.issueDate ? (
                    <div className="" style={{ 
                      fontSize: 'var(--font-size-body)',
                      fontWeight: 'var(--font-weight-headers)',
                      letterSpacing: '0.2px'
                    }}>
                      {cert.issueDate}
                    </div>
                  ) : (
                    <div className="" style={{ 
                      fontSize: 'var(--font-size-body)',
                      fontWeight: 'var(--font-weight-headers)',
                      letterSpacing: '0.2px',
                      color: '#666666',
                      fontStyle: 'italic'
                    }}>
                      Issue Date
                    </div>
                  )}
                </div>
              ))
            ) : (
              // Show placeholder when no certifications
              <div className="flex justify-between items-start" style={{ marginBottom: '6px' }}>
                <div>
                  <div style={{ 
                    fontSize: 'var(--font-size-body)',
                    letterSpacing: '0.2px',
                    color: '#666666',
                    fontStyle: 'italic'
                  }}>
                    <span style={{ fontWeight: 'var(--font-weight-headers)', fontSize: 'var(--font-size-subheader)' }}>Certificate Name</span> - <span style={{ color: '#666666' }}>Issuing Organization</span>
                  </div>
                </div>
                <div className="" style={{ 
                  fontSize: 'var(--font-size-body)',
                  fontWeight: 'var(--font-weight-headers)',
                  letterSpacing: '0.2px',
                  color: '#666666',
                  fontStyle: 'italic'
                }}>
                  Issue Date
                </div>
              </div>
            )}
          </div>
        </div>
      )
    };

    // Render sections in the specified order
    return orderedSections.map(sectionId => {
      if (sections.has(sectionId) && sectionComponents[sectionId]) {
        return sectionComponents[sectionId];
      }
      return null;
    }).filter(Boolean);
  };

  // Apply customization or use defaults
  const theme = customization?.theme || {
    primaryColor: color || '#1f2937',
    secondaryColor: '#374151',
    textColor: '#000000',
    backgroundColor: '#ffffff',
    accentColor: color || '#1f2937',
    borderColor: '#1f2937',
    headerColor: color || '#1f2937'
  };

  const typography = customization?.typography || {
    fontFamily: {
      header: 'Arial, Helvetica, Calibri, sans-serif',
      body: 'Arial, Helvetica, Calibri, sans-serif',
      name: 'Arial, Helvetica, Calibri, sans-serif'
    },
    fontSize: {
      name: 22,
      title: 14,
      headers: 13,
      body: 11,
      subheader: 10
    },
    fontWeight: {
      name: 700,
      headers: 700,
      body: 500
    }
  };

  const layout = customization?.layout || {
    margins: { top: 0, bottom: 0, left: 8, right: 8 },
    sectionSpacing: 16,
    lineHeight: 1.3
  };

  // Create CSS custom properties for dynamic theming
  const customStyles = {
    '--primary-color': theme.primaryColor,
    '--secondary-color': theme.secondaryColor,
    '--text-color': theme.textColor,
    '--background-color': theme.backgroundColor,
    '--accent-color': theme.accentColor,
    '--border-color': theme.borderColor,
    '--header-color': theme.headerColor,
    '--font-family-header': typography.fontFamily.header,
    '--font-family-body': typography.fontFamily.body,
    '--font-family-name': typography.fontFamily.name,
    '--font-size-name': `${typography.fontSize.name}px`,
    '--font-size-title': `${typography.fontSize.title}px`,
    '--font-size-headers': `${typography.fontSize.headers}px`,
    '--font-size-body': `${typography.fontSize.body}px`,
    '--font-size-subheader': `${typography.fontSize.subheader}px`,
    '--font-weight-name': typography.fontWeight.name.toString(),
    '--font-weight-headers': typography.fontWeight.headers.toString(),
    '--font-weight-body': typography.fontWeight.body.toString(),
    '--section-spacing': `${layout.sectionSpacing}px`,
    '--line-height': layout.lineHeight,
    fontFamily: typography.fontFamily.body,
    fontSize: `${typography.fontSize.body}px`,
    lineHeight: layout.lineHeight,
    marginTop: `${layout.margins.top}px`,
    marginBottom: `${layout.margins.bottom}px`,
    marginLeft: `${layout.margins.left}px`,
    marginRight: `${layout.margins.right}px`,
    backgroundColor: theme.backgroundColor
  } as React.CSSProperties;

  return (
    <div className="max-w-4xl mx-auto px-2 mt-0 bg-white" style={{
      ...customStyles,
      border: customization?.colorMode === 'border' ? '2px solid var(--accent-color)' : 'none',
      borderRadius: customization?.colorMode === 'border' ? '8px' : '0',
      padding: customization?.colorMode === 'border' ? '20px' : '0'
    }}>
      {/* Header */}
      <div className="text-center mb-0 -mt-4" style={{
        backgroundColor: customization?.colorMode === 'advanced' ? 'var(--accent-color)' : 'transparent',
        padding: customization?.colorMode === 'advanced' ? '20px' : '0',
        borderRadius: customization?.colorMode === 'advanced' ? '8px' : '0',
        marginBottom: customization?.colorMode === 'advanced' ? '20px' : '0'
      }}>
        {templateData.personalInfo && (
          <>
            {shouldShowTitleBelow() ? (
              <>
                <h1 className="text-2xl py-0 my-0 -mb-3" style={{
                  fontSize: getNameSize(),
                  fontWeight: getNameFontWeight(),
                  fontFamily: getNameFontFamily(),
                  letterSpacing: '1px',
                  color: customization?.applyAccentTo?.name ? 'var(--accent-color)' : 'var(--header-color)'
                }}>
                  {templateData.personalInfo.name || 'Your Full Name'}
                </h1>
                <div className="text-lg font-semibold mb-0 mt-1" style={{ 
                  fontSize: getProfessionalTitleSize(), 
                  fontWeight: '600', 
                  fontFamily: 'var(--font-family-body)',
                  color: 'var(--secondary-color)',
                  ...getTitleStyle()
                }}>
                  {templateData.personalInfo.title || 'Your Professional Title'}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center gap-1 -mb-3">
                <h1 className="" style={{
                  fontSize: getNameSize(),
                  fontWeight: getNameFontWeight(),
                  fontFamily: getNameFontFamily(),
                  letterSpacing: '1px',
                  color: customization?.applyAccentTo?.name ? 'var(--accent-color)' : 'var(--header-color)',
                  margin: 0
                }}>
                  {templateData.personalInfo.name || 'Your Full Name'}
                </h1>
                <span style={{
                  fontSize: customization?.titleCustomization?.separationType === 'vertical-line' ? 
                    `${parseInt(getProfessionalTitleSize()) + 2}px` : 
                    getProfessionalTitleSize(),
                  color: 'var(--secondary-color)',
                  margin: '0 2px'
                }}>
                  {getSeparationCharacter()}
                </span>
                <div className="font-semibold" style={{ 
                  fontSize: getProfessionalTitleSize(), 
                  fontWeight: '600', 
                  fontFamily: 'var(--font-family-body)',
                  color: 'var(--secondary-color)',
                  ...getTitleStyle(),
                  margin: 0
                }}>
                  {templateData.personalInfo.title || 'Your Professional Title'}
                </div>
              </div>
            )}
            <div className="text-sm" style={{ 
              fontSize: 'var(--font-size-body)',
              fontFamily: 'var(--font-family-body)',
              color: 'var(--text-color)'
            }}>
              {templateData.personalInfo.address || 'Your Location'}
              {(templateData.personalInfo.address || templateData.personalInfo.phone || templateData.personalInfo.email) && ' | '}
              {templateData.personalInfo.phone || 'Your Phone'}
              {(templateData.personalInfo.phone || templateData.personalInfo.email) && ' | '}
              {templateData.personalInfo.email || 'your.email@example.com'}
              {templateData.personalInfo.linkedin && (
                <> | <a href={templateData.personalInfo.linkedin} target="_blank" rel="noopener noreferrer" style={{ color: customization?.applyAccentTo?.linkIcons ? 'var(--accent-color)' : '#0077b5', textDecoration: 'underline' }}>LinkedIn</a></>
              )}
              {templateData.personalInfo.github && (
                <> | <a href={templateData.personalInfo.github} target="_blank" rel="noopener noreferrer" style={{ color: customization?.applyAccentTo?.linkIcons ? 'var(--accent-color)' : '#0077b5', textDecoration: 'underline' }}>GitHub</a></>
              )}
              {templateData.personalInfo.website && !templateData.personalInfo.linkedin && !templateData.personalInfo.github && (
                <> | {templateData.personalInfo.website}</>
              )}
            </div>
          </>
        )}
      </div>

      {/* Render sections in order */}
      {renderOrderedSections()}
    </div>
  );
};

export default ResumePDF;