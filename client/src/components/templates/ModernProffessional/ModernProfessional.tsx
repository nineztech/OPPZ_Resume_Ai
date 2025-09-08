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
    <>

      <div className="max-w-4xl mx-auto p-6 bg-white" style={{ 
        fontFamily: 'Arial, sans-serif',
        fontSize: '11px',
        lineHeight: '1.3',
        padding: '15px',
        margin: '0',
        maxWidth: '100%'
      }}>
      {/* Header */}
      <div className="text-center mb-3">
        <h1 className="text-2xl font-bold mb-1" style={{ 
          fontSize: '22px',
          fontWeight: 'bold',
          letterSpacing: '1px',
          color: color || '#1f2937',
          marginTop: '0',
          marginBottom: '4px'
        }}>
          {templateData.personalInfo?.name || 'Your Name'}
        </h1>
        <div className="text-lg font-semibold mb-1" style={{ fontSize: '14px', fontWeight: '600', color: color || '#374151', marginBottom: '4px' }}>
          {templateData.personalInfo?.title || 'Your Title'}
        </div>
        <div className="text-sm" style={{ fontSize: '11px', marginBottom: '0' }}>
          {templateData.personalInfo?.address || 'Your Address'} | {templateData.personalInfo?.phone || 'Your Phone'} | {templateData.personalInfo?.email || 'your.email@example.com'} | {templateData.personalInfo?.website || 'your-website.com'}
        </div>
      </div>

      {/* Summary */}
      <div className="mb-2">
        <h2 className="text-left font-bold mb-1 uppercase" style={{ 
          fontSize: '13px',
          fontWeight: 'bold',
          letterSpacing: '0.5px',
          paddingBottom: '2px',
          marginBottom: '4px',
          color: color || '#1f2937',
          borderBottom: `2px solid ${color || '#d1d5db'}`
        }}>
          SUMMARY
        </h2>
        <p className="text-justify leading-relaxed" style={{ 
          fontSize: '11px',
          lineHeight: '1.3',
          textAlign: 'justify',
          marginBottom: '0'
        }}>
          {templateData.summary || 'No summary provided yet. Please add your professional summary in the sidebar.'}
        </p>

      </div>

      {/* Technical Skills */}
      <div className="mb-2">
        <h2 className="text-left font-bold mb-1 uppercase" style={{ 
          fontSize: '13px',
          fontWeight: 'bold',
          letterSpacing: '0.5px',
          paddingBottom: '2px',
          marginBottom: '4px',
          color: color || '#1f2937',
          borderBottom: `2px solid ${color || '#d1d5db'}`
        }}>
          TECHNICAL SKILLS
        </h2>
        <div className="space-y-0">
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
                  lineHeight: '1.3',
                  marginBottom: '4px'
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
      <div className="mb-2">
        <h2 className="text-left font-bold mb-1 uppercase" style={{ 
          fontSize: '13px',
          fontWeight: 'bold',
          letterSpacing: '0.5px',
          paddingBottom: '2px',
          marginBottom: '4px',
          color: color || '#1f2937',
          borderBottom: `2px solid ${color || '#d1d5db'}`
        }}>
          PROFESSIONAL EXPERIENCE
        </h2>
        <div className="space-y-0">
          {Array.isArray(templateData.experience) && templateData.experience.length > 0 ? (
            templateData.experience.map((exp, index) => {
              return (
                <div key={index}>
                  
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex-1">
                      <h3 className="font-bold" style={{ 
                        fontSize: '11px',
                        fontWeight: 'bold'
                      }}>
                        {exp.title}
                      </h3>
                      {exp.company && (
                        <p className="text-gray-600" style={{ 
                          fontSize: '10px',
                          fontWeight: '500'
                        }}>
                          {exp.company}
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
                  <div className="space-y-0 ml-0">
                    {Array.isArray(exp.achievements) && exp.achievements.length > 0 ? (
                      exp.achievements.map((achievement, idx) => (
                        <div key={idx} className="flex items-start" style={{ fontSize: '11px', marginBottom: '2px' }}>
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
        <h2 className="text-left font-bold mb-1 uppercase" style={{ 
          fontSize: '13px',
          fontWeight: 'bold',
          letterSpacing: '0.5px',
          paddingBottom: '2px',
          marginBottom: '4px',
          color: color || '#1f2937',
          borderBottom: `2px solid ${color || '#d1d5db'}`
        }}>
          PROJECTS
        </h2>
        <div className="space-y-0">
          {Array.isArray(templateData.projects) && templateData.projects.length > 0 ? (
            templateData.projects.map((project, index) => {
              return (
              <div key={index}>
                                 <div className="mb-1">
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
                <div className="space-y-0 ml-0">
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
              );
            })
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
        <h2 className="text-left font-bold mb-1 uppercase" style={{ 
          fontSize: '13px',
          fontWeight: 'bold',
          letterSpacing: '0.5px',
          paddingBottom: '2px',
          marginBottom: '4px',
          color: color || '#1f2937',
          borderBottom: `2px solid ${color || '#d1d5db'}`
        }}>
          EDUCATION
        </h2>
        <div className="space-y-1">
          {Array.isArray(templateData.education) && templateData.education.length > 0 ? (
            templateData.education.map((edu, index) => {
              return (
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
              );
            })
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
      
      {/* Certifications */}
      {Array.isArray(templateData.additionalInfo.certifications) && templateData.additionalInfo.certifications.length > 0 && (
        <div className="mb-3">
          <h2 className="text-left font-bold mb-2 uppercase" style={{ 
            fontSize: '12px',
            fontWeight: 'bold',
            color: color || '#374151',
            borderBottom: `2px solid ${color || '#d1d5db'}`
          }}>
            CERTIFICATIONS
          </h2>
          <div className="space-y-2">
            {templateData.additionalInfo.certifications.map((cert, index) => {
              return (
                <div key={index}>
                  <div className="font-bold" style={{ 
                    fontSize: '11px',
                    fontWeight: 'bold'
                  }}>
                    {cert}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      </div>
    </>
  );
};

export default ResumePDF;