import React from 'react';

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

interface CleanMinimalProps {
  data?: TemplateData;
  color?: string;
}

const cleanMinimalTemplateData: TemplateData = {
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
  additionalInfo: {
    languages: [],
    certifications: [],
    awards: []
  }
};

const ResumePDF: React.FC<CleanMinimalProps> = ({ data, color }) => {
  // Use the passed data prop if available, otherwise fall back to default data
  const templateData = data || cleanMinimalTemplateData;

  return (
    <div className="max-w-4xl mx-auto p-2 -mt-4 bg-white" style={{ 
      fontFamily: 'Arial, sans-serif',
      fontSize: '11px',
      lineHeight: '1.3'
    }}>
      {/* Header */}
      <div className="text-center mb-1">
        <h1 className="text-2xl font-bold mb-0" style={{ 
          fontSize: '22px',
          fontWeight: 'bold',
          letterSpacing: '1px',
          color: color || '#1f2937'
        }}>
          {templateData.personalInfo?.name || 'Your Name'}
        </h1>
        <div className="text-lg font-semibold mb-1" style={{ fontSize: '14px', fontWeight: '600', color: color || '#374151' }}>
          {templateData.personalInfo?.title || 'Your Title'}
        </div>
        <div className="text-sm" style={{ fontSize: '11px' }}>
          {templateData.personalInfo?.address || 'Your Address'} | {templateData.personalInfo?.phone || 'Your Phone'} | {templateData.personalInfo?.email || 'your.email@example.com'}
          {templateData.personalInfo?.linkedin && (
            <> | <a href={templateData.personalInfo.linkedin} target="_blank" rel="noopener noreferrer" style={{ color: '#0077b5', textDecoration: 'underline' }}>LinkedIn</a></>
          )}
          {templateData.personalInfo?.github && (
            <> | <a href={templateData.personalInfo.github} target="_blank" rel="noopener noreferrer" style={{ color: '#0077b5', textDecoration: 'underline' }}>GitHub</a></>
          )}
          {templateData.personalInfo?.website && !templateData.personalInfo?.linkedin && !templateData.personalInfo?.github && (
            <> | {templateData.personalInfo.website}</>
          )}
        </div>
      </div>

      {/* Summary */}
      <div className="mb-1" style={{ position: 'relative' }}>
        <h2 className="text-left font-bold mb-1 uppercase border-b-2 pb-1" style={{ 
          fontSize: '13px',
          fontWeight: 'bold',
          letterSpacing: '0.5px',
          color: color || '#1f2937',
          borderBottomColor: color || '#1f2937'
        }}>
          SUMMARY
        </h2>
        <div className="space-y-0 ml-0 mt-1">
          {templateData.summary ? (
            // Split summary into bullet points
            templateData.summary.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0).map((sentence, index) => (
              <div key={index} className="flex items-start" style={{ fontSize: '11px' }}>
                <span className="mr-2">•</span>
                <span className="leading-relaxed" style={{ lineHeight: '1.3' }}>{sentence.trim()}</span>
              </div>
            ))
          ) : (
            <div className="text-sm text-gray-500" style={{ 
              fontSize: '11px',
              lineHeight: '1.3',
              fontStyle: 'italic'
            }}>
              No summary provided yet. Please add your professional summary in the sidebar.
            </div>
          )}
        </div>
      </div>

      {/* Technical Skills */}
      <div className="mb-1">
        <h2 className="text-left font-bold mb-1 uppercase border-b-2 pb-1" style={{ 
          fontSize: '13px',
          fontWeight: 'bold',
          letterSpacing: '0.5px',
          color: color || '#1f2937',
          borderBottomColor: color || '#1f2937'
        }}>
          TECHNICAL SKILLS
        </h2>
        <div className="space-y-1">
          {templateData.skills?.technical && typeof templateData.skills.technical === 'object' && !Array.isArray(templateData.skills.technical) ? (
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
                  fontSize: '11px',
                  lineHeight: '1.3'
                }}>
                  <span className="font-bold" style={{ fontWeight: 'bold' }}>{category}:</span> 
                  {skillsArray.map((skill, index) => {
                    if (!skill || typeof skill !== 'string') return null;
                    
                    return (
                      <span key={index}>
                        {index > 0 ? ', ' : ' '}
                        <span>{skill}</span>
                      </span>
                    );
                  })}
                </div>
              );
            }).filter(Boolean) // Remove null entries
          ) : Array.isArray(templateData.skills?.technical) && templateData.skills.technical.length > 0 ? (
            // Handle flat skills array (fallback)
            <div className="text-sm" style={{ 
              fontSize: '11px',
              lineHeight: '1.3'
            }}>
              {templateData.skills.technical.map((skill, index) => {
                if (!skill || typeof skill !== 'string') return null;
                return (
                  <span key={index}>
                    {index > 0 ? ', ' : ''}
                    <span>{skill}</span>
                  </span>
                );
              })}
            </div>
          ) : (
            <div className="text-sm text-gray-500" style={{ 
              fontSize: '11px',
              lineHeight: '1.3',
              fontStyle: 'italic'
            }}>
              No technical skills added yet
            </div>
          )}
        </div>
      </div>

      {/* Professional Experience */}
      <div className="mb-1 mt-0">
        <h2 className="text-left font-bold mb-1 mt-0 uppercase border-b-2 pb-1" style={{ 
          fontSize: '13px',
          fontWeight: 'bold',
          letterSpacing: '0.5px',
          color: color || '#1f2937',
          borderBottomColor: color || '#1f2937'
        }}>
          PROFESSIONAL EXPERIENCE
        </h2>
        <div className="space-y-1">
          {Array.isArray(templateData.experience) && templateData.experience.length > 0 ? (
            templateData.experience.map((exp, index) => {
              return (
                <div key={index}>
                  
                  <div className="flex justify-between items-start -mb-2">
                    <div className="flex-1">
                      <h3 className="font-bold" style={{ 
                        fontSize: '11px',
                        fontWeight: 'bold'
                      }}>
                        {exp.title}
                      </h3>
                      {exp.company && (
                        <p className="text-gray-600 mb-4" style={{ 
                          fontSize: '10px',
                          fontWeight: '500'
                        }}>
                          <b>{exp.company}</b>
                        </p>
                      )}
                    </div>
                    <div className="font-bold text-right" style={{ 
                      fontSize: '11px',
                      fontWeight: 'bold'
                    }}>
                      {exp.dates}
                    </div>
                  </div>
                  <div className="space-y-0 ml-0 mt-1">
                    {Array.isArray(exp.achievements) && exp.achievements.length > 0 ? (
                      exp.achievements.map((achievement, idx) => (
                        <div key={idx} className="flex items-start" style={{ fontSize: '11px' }}>
                          <span className="mr-2">•</span>
                          <span className="leading-relaxed" style={{ lineHeight: '1.3' }}>{achievement}</span>
                        </div>
                      ))
                    ) : exp.description ? (
                      // Fallback to description if no achievements array
                      <div className="flex items-start" style={{ fontSize: '11px' }}>
                        <span className="mr-2">•</span>
                        <span className="leading-relaxed" style={{ lineHeight: '1.3' }}>{exp.description}</span>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500" style={{ 
                        fontSize: '11px',
                        lineHeight: '1.3',
                        fontStyle: 'italic'
                      }}>
                        No achievements listed
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-sm text-gray-500" style={{ 
              fontSize: '11px',
              lineHeight: '1.3',
              fontStyle: 'italic'
            }}>
              No experience added yet
            </div>
          )}
        </div>
      </div>

     

      {/* Projects */}
      <div className="mb-2">
        <h2 className="text-left font-bold mb-1 uppercase border-b-2 pb-1" style={{ 
          fontSize: '13px',
          fontWeight: 'bold',
          letterSpacing: '0.5px',
          color: color || '#1f2937',
          borderBottomColor: color || '#1f2937'
        }}>
          PROJECTS
        </h2>
        <div className="space-y-1">
          {Array.isArray(templateData.projects) && templateData.projects.length > 0 ? (
            templateData.projects.map((project, index) => (
              <div key={index}>
                                 <div className="mb-0">
                   <div className="flex justify-between items-center">
                     <div className="flex items-center gap-2">
                       <h3 className="font-bold" style={{ 
                         fontSize: '11px',
                         fontWeight: 'bold'
                       }}>
                         {project.Name}
                       </h3>
                       <span className="text-sm" style={{ 
                         fontSize: '10px',
                         color: '#666'
                       }}>
                         {project.Tech_Stack}
                       </span>
                     </div>
                                           {(project.Start_Date || project.End_Date) && (
                        <div className="font-bold" style={{ 
                          fontSize: '11px',
                          fontWeight: 'bold'
                        }}>
                          {project.Start_Date && project.End_Date 
                            ? `${project.Start_Date} - ${project.End_Date}`
                            : project.Start_Date || project.End_Date
                          }
                        </div>
                      )}
                   </div>
                 </div>
                <div className="space-y-0 ml-0 mt-1">
                  {project.Description ? (
                    <div className="flex items-start" style={{ fontSize: '11px' }}>
                      <span className="mr-2">•</span>
                      <span className="leading-relaxed" style={{ lineHeight: '1.3' }}>{project.Description}</span>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500" style={{ 
                      fontSize: '11px',
                      lineHeight: '1.3',
                      fontStyle: 'italic'
                    }}>
                      No project description available
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-sm text-gray-500" style={{ 
              fontSize: '11px',
              lineHeight: '1.3',
              fontStyle: 'italic'
            }}>
              No projects added yet
            </div>
          )}
        </div>
      </div>
             {/* Education */}
      <div className="mb-2">
        <h2 className="text-left font-bold mb-1 uppercase border-b-2 pb-1" style={{ 
          fontSize: '13px',
          fontWeight: 'bold',
          letterSpacing: '0.5px',
          color: color || '#1f2937',
          borderBottomColor: color || '#1f2937'
        }}>
          EDUCATION
        </h2>
        <div className="space-y-1">
          {Array.isArray(templateData.education) && templateData.education.length > 0 ? (
            templateData.education.map((edu, index) => (
              <div key={index} className="flex justify-between items-start">
                <div>
                  <div className="font-bold" style={{ 
                    fontSize: '11px',
                    fontWeight: 'bold'
                  }}>
                    {edu.institution}
                  </div>
                  <div style={{ fontSize: '11px' }}>
                    {edu.degree}
                  </div>
                </div>
                <div className="font-bold" style={{ 
                  fontSize: '11px',
                  fontWeight: 'bold'
                }}>
                  {edu.dates}
                  </div>
              </div>
            ))
          ) : (
            <div className="text-sm text-gray-500" style={{ 
              fontSize: '11px',
              lineHeight: '1.3',
              fontStyle: 'italic'
            }}>
              No education added yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumePDF;