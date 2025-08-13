import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
// import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  ArrowLeft, 
  Save, 
  Download, 
  Eye, 
  Edit3, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Globe,
  Briefcase,
  GraduationCap,
  Award,
  Languages,
  Activity,
  Heart,
  FileText,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Code,
  Users,
  Plus
} from 'lucide-react';
import TemplateRenderer from '@/components/templates/TemplateRenderer';
import { templates as templateData, getTemplateById } from '@/data/templates';
import type { Template } from '@/data/templates';
import ResumePreviewModal from '@/components/modals/ResumePreviewModal';
import AddCustomSectionModal from '@/components/modals/AddCustomSectionModal';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface ResumeData {
  basicDetails: {
    fullName: string;
    title: string;
    phone: string;
    email: string;
    location: string;
    website: string;
    github: string;
    linkedin: string;
    profilePicture?: string;
  };
  summary: string;
  objective: string;
  experience: Array<{
    id: string;
    company: string;
    position: string;
    duration: string;
    description: string;
    location: string;
  }>;
  education: Array<{
    id: string;
    institution: string;
    degree: string;
    year: string;
    description: string;
    grade: string;
    location: string;
  }>;
  skills: string[];
  languages: Array<{
    name: string;
    proficiency: string;
  }>;
  activities: Array<{
    id: string;
    title: string;
    description: string;
  }>;
  projects: Array<{
    id: string;
    name: string;
    techStack: string;
    startDate: string;
    endDate: string;
    description: string;
    link: string;
  }>;
  certifications: Array<{
    id: string;
    certificateName: string;
    link: string;
    startDate: string;
    endDate: string;
    instituteName: string;
  }>;
  references: Array<{
    id: string;
    name: string;
    title: string;
    company: string;
    phone: string;
    email: string;
    relationship: string;
  }>;
  customSections: Array<{
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

const ResumeBuilderPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('basic-details');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [templateScrollIndex, setTemplateScrollIndex] = useState(0);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isCustomSectionModalOpen, setIsCustomSectionModalOpen] = useState(false);
  const resumeRef = useRef<HTMLDivElement>(null);
  const [resumeData, setResumeData] = useState<ResumeData>({
    basicDetails: {
      fullName: '',
      title: '',
      phone: '',
      email: '',
      location: '',
      website: '',
      github: '',
      linkedin: ''
    },
    summary: '',
    objective: '',
    experience: [],
    education: [],
    skills: [],
    languages: [],
    activities: [],
    projects: [],
    certifications: [],
    references: [],
    customSections: []
  });

  // Debug log when resumeData changes
  useEffect(() => {
    console.log('ResumeBuilderPage - resumeData updated:', resumeData);
  }, [resumeData]);

  const templateId = location.state?.templateId || 'modern-professional';
  const selectedColor = location.state?.selectedColor || 'blue';

  useEffect(() => {
    // Initialize selected template
    const currentTemplate = getTemplateById(templateId);
    setSelectedTemplate(currentTemplate || templateData[0]);
  }, [templateId]);

  useEffect(() => {
    console.log('ResumeBuilderPage useEffect - location.state:', location.state);
    
    if (location.state?.extractedData && (location.state?.mode === 'raw' || location.state?.mode === 'ai')) {
      // Handle Gemini parsed data directly
      const extractedData = location.state.extractedData;
      console.log('Setting resume data from Gemini parser:', extractedData);
      
      // Ensure all required fields are present with proper defaults
      const processedData = {
        basicDetails: {
          fullName: extractedData.basicDetails?.fullName || '',
          title: extractedData.basicDetails?.title || '',
          phone: extractedData.basicDetails?.phone || '',
          email: extractedData.basicDetails?.email || '',
          location: extractedData.basicDetails?.location || '',
          website: extractedData.basicDetails?.website || '',
          github: extractedData.basicDetails?.github || '',
          linkedin: extractedData.basicDetails?.linkedin || ''
        },
        summary: extractedData.summary || '',
        objective: extractedData.objective || '',
        experience: extractedData.experience || [],
        education: extractedData.education || [],
        skills: extractedData.skills || [],
        languages: extractedData.languages || [],
        activities: extractedData.activities || [],
        projects: extractedData.projects || [],
        certifications: extractedData.certifications || [],
        references: extractedData.references || [],
        customSections: extractedData.customSections || []
      };
      
      console.log('Processed resume data:', processedData);
      setResumeData(processedData);
    } else if (location.state?.defaultData && location.state?.mode === 'default') {
      // Use default template data
      const defaultData = location.state.defaultData;
      setResumeData({
        basicDetails: {
          fullName: defaultData.personalInfo.name || '',
          title: defaultData.personalInfo.title || '',
          phone: defaultData.personalInfo.phone || '',
          email: defaultData.personalInfo.email || '',
          location: defaultData.personalInfo.address || '',
          website: defaultData.personalInfo.website || '',
          github: defaultData.personalInfo.github || '',
          linkedin: defaultData.personalInfo.linkedin || ''
        },
        summary: defaultData.summary || '',
        objective: '',
        experience: defaultData.experience?.map((exp: any) => ({
          id: Date.now().toString() + Math.random(),
          company: exp.company || '',
          position: exp.title || '',
          duration: exp.dates || '',
          description: exp.achievements?.join('\n') || '',
          location: exp.location || ''
        })) || [],
        education: defaultData.education?.map((edu: any) => ({
          id: Date.now().toString() + Math.random(),
          institution: edu.institution || '',
          degree: edu.degree || '',
          year: edu.dates || '',
          description: edu.details?.join('\n') || '',
          grade: edu.grade || '',
          location: edu.location || ''
        })) || [],
        skills: defaultData.skills?.technical || [],
        languages: defaultData.additionalInfo?.languages || [],
        activities: [],
        projects: [],
        certifications: [],
        references: [],
        customSections: []
      });
    }
  }, [location.state]);









  const updateResumeData = (section: keyof ResumeData, data: any) => {
    setResumeData(prev => ({
      ...prev,
      [section]: data
    }));
  };

  const addExperience = () => {
    const newExperience = {
      id: Date.now().toString(),
      company: '',
      position: '',
      duration: '',
      description: '',
      location: ''
    };
    setResumeData(prev => ({
      ...prev,
      experience: [...prev.experience, newExperience]
    }));
  };

  const updateExperience = (id: string, field: string, value: string) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.map(exp => 
        exp.id === id ? { ...exp, [field]: value } : exp
      )
    }));
  };

  const removeExperience = (id: string) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.filter(exp => exp.id !== id)
    }));
  };

  const addEducation = () => {
    const newEducation = {
      id: Date.now().toString(),
      institution: '',
      degree: '',
      year: '',
      description: '',
      grade: '',
      location: ''
    };
    setResumeData(prev => ({
      ...prev,
      education: [...prev.education, newEducation]
    }));
  };

  const updateEducation = (id: string, field: string, value: string) => {
    setResumeData(prev => ({
      ...prev,
      education: prev.education.map(edu => 
        edu.id === id ? { ...edu, [field]: value } : edu
      )
    }));
  };

  const removeEducation = (id: string) => {
    setResumeData(prev => ({
      ...prev,
      education: prev.education.filter(edu => edu.id !== id)
    }));
  };

  const addActivity = () => {
    const newActivity = {
      id: Date.now().toString(),
      title: '',
      description: ''
    };
    setResumeData(prev => ({
      ...prev,
      activities: [...prev.activities, newActivity]
    }));
  };

  const updateActivity = (id: string, field: string, value: string) => {
    setResumeData(prev => ({
      ...prev,
      activities: prev.activities.map(activity => 
        activity.id === id ? { ...activity, [field]: value } : activity
      )
    }));
  };

  const removeActivity = (id: string) => {
    setResumeData(prev => ({
      ...prev,
      activities: prev.activities.filter(activity => activity.id !== id)
    }));
  };

  const addProject = () => {
    const newProject = {
      id: Date.now().toString(),
      name: '',
      techStack: '',
      startDate: '',
      endDate: '',
      description: '',
      link: ''
    };
    setResumeData(prev => ({
      ...prev,
      projects: [...prev.projects, newProject]
    }));
  };

  const updateProject = (id: string, field: string, value: string) => {
    setResumeData(prev => ({
      ...prev,
      projects: prev.projects.map(project => 
        project.id === id ? { ...project, [field]: value } : project
      )
    }));
  };

  const removeProject = (id: string) => {
    setResumeData(prev => ({
      ...prev,
      projects: prev.projects.filter(project => project.id !== id)
    }));
  };

  const addCertification = () => {
    const newCertification = {
      id: Date.now().toString(),
      certificateName: '',
      link: '',
      startDate: '',
      endDate: '',
      instituteName: ''
    };
    setResumeData(prev => ({
      ...prev,
      certifications: [...prev.certifications, newCertification]
    }));
  };

  const updateCertification = (id: string, field: string, value: string) => {
    setResumeData(prev => ({
      ...prev,
      certifications: prev.certifications.map(cert => 
        cert.id === id ? { ...cert, [field]: value } : cert
      )
    }));
  };

  const removeCertification = (id: string) => {
    setResumeData(prev => ({
      ...prev,
      certifications: prev.certifications.filter(cert => cert.id !== id)
    }));
  };

  const addReference = () => {
    const newReference = {
      id: Date.now().toString(),
      name: '',
      title: '',
      company: '',
      phone: '',
      email: '',
      relationship: ''
    };
    setResumeData(prev => ({
      ...prev,
      references: [...prev.references, newReference]
    }));
  };

  const updateReference = (id: string, field: string, value: string) => {
    setResumeData(prev => ({
      ...prev,
      references: prev.references.map(ref => 
        ref.id === id ? { ...ref, [field]: value } : ref
      )
    }));
  };

  const removeReference = (id: string) => {
    setResumeData(prev => ({
      ...prev,
      references: prev.references.filter(ref => ref.id !== id)
    }));
  };

  // Custom Section Management
  const addCustomSection = (sectionData: any) => {
    const newSection = {
      id: Date.now().toString() + Math.random(),
      title: sectionData.title,
      type: sectionData.type,
      position: resumeData.customSections.length,
      content: sectionData.content,
      styling: sectionData.styling
    };
    setResumeData(prev => ({
      ...prev,
      customSections: [...prev.customSections, newSection]
    }));
    setIsCustomSectionModalOpen(false);
  };

  const updateCustomSection = (id: string, field: string, value: any) => {
    setResumeData(prev => ({
      ...prev,
      customSections: prev.customSections.map(section => 
        section.id === id ? { ...section, [field]: value } : section
      )
    }));
  };

  const removeCustomSection = (id: string) => {
    setResumeData(prev => ({
      ...prev,
      customSections: prev.customSections.filter(section => section.id !== id)
    }));
  };

  const moveCustomSection = (id: string, direction: 'up' | 'down') => {
    setResumeData(prev => {
      const sections = [...prev.customSections];
      const currentIndex = sections.findIndex(section => section.id === id);
      
      if (direction === 'up' && currentIndex > 0) {
        [sections[currentIndex], sections[currentIndex - 1]] = [sections[currentIndex - 1], sections[currentIndex]];
      } else if (direction === 'down' && currentIndex < sections.length - 1) {
        [sections[currentIndex], sections[currentIndex + 1]] = [sections[currentIndex + 1], sections[currentIndex]];
      }
      
      // Update positions
      sections.forEach((section, index) => {
        section.position = index;
      });
      
      return { ...prev, customSections: sections };
    });
  };

  const handleTemplateChange = (template: Template) => {
    setSelectedTemplate(template);
  };

  const scrollTemplates = (direction: 'left' | 'right') => {
    if (direction === 'left' && templateScrollIndex > 0) {
      setTemplateScrollIndex(templateScrollIndex - 1);
    } else if (direction === 'right' && templateScrollIndex < templateData.length - 4) {
      setTemplateScrollIndex(templateScrollIndex + 1);
    }
  };

  const handleDownloadPDF = async () => {
    if (!resumeRef.current) return;

    try {
      // Create a temporary container for the resume
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.top = '0';
      tempContainer.style.width = '800px';
      tempContainer.style.backgroundColor = 'white';
      tempContainer.style.padding = '40px';
      document.body.appendChild(tempContainer);

      // Clone the resume content
      const resumeClone = resumeRef.current.cloneNode(true) as HTMLElement;
      tempContainer.appendChild(resumeClone);

      // Wait for any images to load
      await new Promise(resolve => setTimeout(resolve, 100));

      // Convert to canvas
      const canvas = await html2canvas(tempContainer, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: 800,
        height: tempContainer.scrollHeight
      });

      // Remove temporary container
      document.body.removeChild(tempContainer);

      // Create PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add additional pages if needed
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Download the PDF
      const fileName = `${resumeData.basicDetails.fullName.replace(/\s+/g, '_')}_Resume.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  const sections = [
    { id: 'basic-details', label: 'Basic details', icon: User },
    { id: 'summary', label: 'Summary & Objective', icon: FileText },
    { id: 'skills', label: 'Skills and expertise', icon: Award },
    { id: 'education', label: 'Education', icon: GraduationCap },
    { id: 'experience', label: 'Experience', icon: Briefcase },
    { id: 'activities', label: 'Activities', icon: Activity },
    { id: 'projects', label: 'Projects', icon: Code },
    { id: 'certifications', label: 'Certifications', icon: Award },
    { id: 'references', label: 'References', icon: Users }
  ];

  // Add custom sections to the sections array
  const allSections = [
    ...sections,
    ...resumeData.customSections.map(section => ({
      id: `custom-${section.id}`,
      label: section.title,
      icon: FileText,
      isCustom: true,
      customData: section
    }))
  ] as Array<{
    id: string;
    label: string;
    icon: any;
    isCustom?: boolean;
    customData?: any;
  }>;

  return (
    <>
      <style>
        {`
          .custom-scrollbar::-webkit-scrollbar {
            width: 12px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: #f7fafc;
            border-radius: 6px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #cbd5e0;
            border-radius: 6px;
            border: 2px solid #f7fafc;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #a0aec0;
          }
          .custom-scrollbar {
            scrollbar-width: thick;
            scrollbar-color: #cbd5e0 #f7fafc;
          }
        `}
      </style>
      <div className="min-h-screen bg-gray-50 mt-14">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-3">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate('/resume/templates')}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Templates
            </Button>
            
            {/* Centered Template Selector */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => scrollTemplates('left')}
                disabled={templateScrollIndex === 0}
                className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              
              <div className="flex items-center gap-1">
                {templateData.slice(templateScrollIndex, templateScrollIndex + 4).map((template) => (
                  <button
                    key={template.id}
                    onClick={() => handleTemplateChange(template)}
                    className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap transition-all duration-200 ${
                      selectedTemplate?.id === template.id
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900'
                    }`}
                  >
                    {template.name}
                  </button>
                ))}
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => scrollTemplates('right')}
                disabled={templateScrollIndex >= templateData.length - 4}
                className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsPreviewModalOpen(true)}
              >
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
              <Button variant="outline" size="sm">
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
              <Button size="sm" onClick={handleDownloadPDF}>
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </div>

        <div className="flex h-[calc(100vh-140px)]">
          {/* Left Panel - Resume Preview */}
          <div className="w-[60%] bg-white border-r border-gray-200 overflow-auto custom-scrollbar">
            <div className="p-6" ref={resumeRef}>
              <TemplateRenderer
                templateId={selectedTemplate?.id || templateId}
                data={{
                  personalInfo: {
                    name: resumeData.basicDetails.fullName,
                    title: resumeData.basicDetails.title,
                    address: resumeData.basicDetails.location,
                    email: resumeData.basicDetails.email,
                    website: resumeData.basicDetails.website,
                    phone: resumeData.basicDetails.phone
                  },
                  summary: resumeData.summary,
                  skills: {
                    technical: resumeData.skills,
                    professional: resumeData.languages.map(lang => lang.name)
                  },
                  experience: resumeData.experience.map(exp => ({
                    title: exp.position,
                    company: exp.company,
                    dates: exp.duration,
                    achievements: [exp.description]
                  })),
                  education: resumeData.education.map(edu => ({
                    degree: edu.degree,
                    institution: edu.institution,
                    dates: edu.year,
                    details: [edu.description]
                  })),
                  additionalInfo: {
                    languages: resumeData.languages.map(lang => lang.name)
                  },
                  customSections: resumeData.customSections
                }}
                color={selectedColor}
              />
            </div>
          </div>

          {/* Right Panel - Editing Panel */}
          <div className="w-[40%] bg-gray-50 overflow-auto custom-scrollbar">
            <div className="p-6">
              {/* Navigation */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Edit Resume</h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsCustomSectionModalOpen(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Section
                  </Button>
                </div>
                <div className="space-y-1">
                  {allSections.map((section) => {
                    const Icon = section.icon;
                    return (
                      <div key={section.id}>
                        <button
                          onClick={() => setActiveSection(activeSection === section.id ? '' : section.id)}
                          className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
                            activeSection === section.id
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'hover:bg-gray-100 text-gray-700'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Icon className="w-4 h-4" />
                            <span className="font-medium">{section.label}</span>
                          </div>
                          <div className={`w-4 h-4 transition-transform ${activeSection === section.id ? 'rotate-90' : ''}`}>→</div>
                        </button>
                        
                        {/* Dropdown Content */}
                        {activeSection === section.id && (
                          <div className="mt-2 bg-white rounded-lg border border-gray-200 p-4">
                            {section.id === 'basic-details' && (
                              <BasicDetailsSection
                                data={resumeData.basicDetails}
                                onChange={(data) => updateResumeData('basicDetails', data)}
                              />
                            )}

                            {section.id === 'skills' && (
                              <SkillsSection
                                skills={resumeData.skills}
                                languages={resumeData.languages}
                                onChange={(skills, languages) => {
                                  updateResumeData('skills', skills);
                                  updateResumeData('languages', languages);
                                }}
                              />
                            )}

                            {section.id === 'experience' && (
                              <ExperienceSection
                                experience={resumeData.experience}
                                onAdd={addExperience}
                                onUpdate={updateExperience}
                                onRemove={removeExperience}
                              />
                            )}

                            {section.id === 'education' && (
                              <EducationSection
                                education={resumeData.education}
                                onAdd={addEducation}
                                onUpdate={updateEducation}
                                onRemove={removeEducation}
                              />
                            )}

                            {section.id === 'activities' && (
                              <ActivitiesSection
                                activities={resumeData.activities}
                                onAdd={addActivity}
                                onUpdate={updateActivity}
                                onRemove={removeActivity}
                              />
                            )}

                            {section.id === 'projects' && (
                              <ProjectsSection
                                projects={resumeData.projects}
                                onAdd={addProject}
                                onUpdate={updateProject}
                                onRemove={removeProject}
                              />
                            )}

                            {section.id === 'certifications' && (
                              <CertificationsSection
                                certifications={resumeData.certifications}
                                onAdd={addCertification}
                                onUpdate={updateCertification}
                                onRemove={removeCertification}
                              />
                            )}

                            {section.id === 'references' && (
                              <ReferencesSection
                                references={resumeData.references}
                                onAdd={addReference}
                                onUpdate={updateReference}
                                onRemove={removeReference}
                              />
                            )}

                            {section.id === 'summary' && (
                              <SummarySection
                                summary={resumeData.summary}
                                objective={resumeData.objective}
                                onChange={(summary, objective) => {
                                  updateResumeData('summary', summary);
                                  updateResumeData('objective', objective);
                                }}
                              />
                            )}

                            {/* Custom Section Handling */}
                            {section.isCustom && section.customData && (
                              <CustomSectionEditor
                                section={section.customData}
                                onUpdate={(field, value) => updateCustomSection(section.customData.id, field, value)}
                                onRemove={() => removeCustomSection(section.customData.id)}
                                onMoveUp={() => moveCustomSection(section.customData.id, 'up')}
                                onMoveDown={() => moveCustomSection(section.customData.id, 'down')}
                                totalSections={resumeData.customSections.length}
                              />
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Resume Preview Modal */}
      <ResumePreviewModal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        templateId={selectedTemplate?.id || templateId}
        data={{
          personalInfo: {
            name: resumeData.basicDetails.fullName,
            title: resumeData.basicDetails.title,
            address: resumeData.basicDetails.location,
            email: resumeData.basicDetails.email,
            website: resumeData.basicDetails.website,
            phone: resumeData.basicDetails.phone
          },
          summary: resumeData.summary,
          skills: {
            technical: resumeData.skills,
            professional: resumeData.languages.map(lang => lang.name)
          },
          experience: resumeData.experience.map(exp => ({
            title: exp.position,
            company: exp.company,
            dates: exp.duration,
            achievements: [exp.description]
          })),
          education: resumeData.education.map(edu => ({
            degree: edu.degree,
            institution: edu.institution,
            dates: edu.year,
            details: [edu.description]
          })),
          additionalInfo: {
            languages: resumeData.languages.map(lang => lang.name)
          },
          customSections: resumeData.customSections
        }}
        color={selectedColor}
      />

      {/* Add Custom Section Modal */}
      <AddCustomSectionModal 
        isOpen={isCustomSectionModalOpen} 
        onClose={() => setIsCustomSectionModalOpen(false)} 
        onAdd={addCustomSection} 
      />
    </>
  );
};

// Basic Details Section Component
const BasicDetailsSection = ({ data, onChange }: { data: any; onChange: (data: any) => void }) => {
  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="fullName">Full Name</Label>
        <Input
          id="fullName"
          value={data.fullName}
          onChange={(e) => onChange({ ...data, fullName: e.target.value })}
          placeholder="Enter your full name"
        />
      </div>

      <div>
        <Label htmlFor="title">Professional Title</Label>
        <Input
          id="title"
          value={data.title}
          onChange={(e) => onChange({ ...data, title: e.target.value })}
          placeholder="e.g., Frontend Developer"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={data.phone}
            onChange={(e) => onChange({ ...data, phone: e.target.value })}
            placeholder="+1 234 567 8900"
          />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={data.email}
            onChange={(e) => onChange({ ...data, email: e.target.value })}
            placeholder="your.email@example.com"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          value={data.location}
          onChange={(e) => onChange({ ...data, location: e.target.value })}
          placeholder="City, Country"
        />
      </div>

      <div>
        <Label htmlFor="website">Website</Label>
        <Input
          id="website"
          value={data.website}
          onChange={(e) => onChange({ ...data, website: e.target.value })}
          placeholder="www.yourwebsite.com"
        />
      </div>
      <div>
        <Label htmlFor="github">GitHub</Label>
        <Input
          id="github"
          value={data.github}
          onChange={(e) => onChange({ ...data, github: e.target.value })}
          placeholder="https://github.com/yourusername"
        />
      </div>
      <div>
        <Label htmlFor="linkedin">LinkedIn</Label>
        <Input
          id="linkedin"
          value={data.linkedin}
          onChange={(e) => onChange({ ...data, linkedin: e.target.value })}
          placeholder="https://linkedin.com/in/yourusername"
        />
      </div>
    </div>
  );
};

// Skills Section Component
const SkillsSection = ({ skills, languages, onChange }: { skills: string[]; languages: Array<{ name: string; proficiency: string }>; onChange: (skills: string[], languages: Array<{ name: string; proficiency: string }>) => void }) => {
  const addSkill = () => {
    onChange([...skills, ''], languages);
  };

  const updateSkill = (index: number, value: string) => {
    const newSkills = [...skills];
    newSkills[index] = value;
    onChange(newSkills, languages);
  };

  const removeSkill = (index: number) => {
    const newSkills = skills.filter((_, i) => i !== index);
    onChange(newSkills, languages);
  };

  const addLanguage = () => {
    onChange(skills, [...languages, { name: '', proficiency: '' }]);
  };

  const updateLanguage = (index: number, field: string, value: string) => {
    const newLanguages = [...languages];
    newLanguages[index] = { ...newLanguages[index], [field]: value };
    onChange(skills, newLanguages);
  };

  const removeLanguage = (index: number) => {
    const newLanguages = languages.filter((_, i) => i !== index);
    onChange(skills, newLanguages);
  };

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-base font-medium">Skills</Label>
        <div className="space-y-2 mt-2">
          {skills.map((skill, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={skill}
                onChange={(e) => updateSkill(index, e.target.value)}
                placeholder="Enter skill"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => removeSkill(index)}
              >
                Remove
              </Button>
            </div>
          ))}
          <Button variant="outline" onClick={addSkill}>
            Add Skill
          </Button>
        </div>
      </div>

      <Separator />

      <div>
        <Label className="text-base font-medium">Languages</Label>
        <div className="space-y-2 mt-2">
          {languages.map((language, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={language.name}
                onChange={(e) => updateLanguage(index, 'name', e.target.value)}
                placeholder="Enter language"
              />
              <Input
                value={language.proficiency}
                onChange={(e) => updateLanguage(index, 'proficiency', e.target.value)}
                placeholder="e.g., Fluent"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => removeLanguage(index)}
              >
                Remove
              </Button>
            </div>
          ))}
          <Button variant="outline" onClick={addLanguage}>
            Add Language
          </Button>
        </div>
      </div>
    </div>
  );
};

// Experience Section Component
const ExperienceSection = ({ experience, onAdd, onUpdate, onRemove }: { 
  experience: any[]; 
  onAdd: () => void; 
  onUpdate: (id: string, field: string, value: string) => void;
  onRemove: (id: string) => void;
}) => {
  return (
    <div className="space-y-4">
      {experience.map((exp) => (
        <Card key={exp.id} className="p-4">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Company</Label>
                <Input
                  value={exp.company}
                  onChange={(e) => onUpdate(exp.id, 'company', e.target.value)}
                  placeholder="Company name"
                />
              </div>
              <div>
                <Label>Position</Label>
                <Input
                  value={exp.position}
                  onChange={(e) => onUpdate(exp.id, 'position', e.target.value)}
                  placeholder="Job title"
                />
              </div>
            </div>
            
            <div>
              <Label>Duration</Label>
              <Input
                value={exp.duration}
                onChange={(e) => onUpdate(exp.id, 'duration', e.target.value)}
                placeholder="e.g., Jan 2020 - Present"
              />
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={exp.description}
                onChange={(e) => onUpdate(exp.id, 'description', e.target.value)}
                placeholder="Describe your responsibilities and achievements"
                rows={3}
              />
            </div>

            <div>
              <Label>Location</Label>
              <Input
                value={exp.location}
                onChange={(e) => onUpdate(exp.id, 'location', e.target.value)}
                placeholder="City, Country"
              />
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onRemove(exp.id)}
              className="text-red-600 hover:text-red-700"
            >
              Remove Experience
            </Button>
          </div>
        </Card>
      ))}

      <Button variant="outline" onClick={onAdd}>
        Add Experience
      </Button>
    </div>
  );
};

// Education Section Component
const EducationSection = ({ education, onAdd, onUpdate, onRemove }: { 
  education: any[]; 
  onAdd: () => void; 
  onUpdate: (id: string, field: string, value: string) => void;
  onRemove: (id: string) => void;
}) => {
  return (
    <div className="space-y-4">
      {education.map((edu) => (
        <Card key={edu.id} className="p-4">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Institution</Label>
                <Input
                  value={edu.institution}
                  onChange={(e) => onUpdate(edu.id, 'institution', e.target.value)}
                  placeholder="University name"
                />
              </div>
              <div>
                <Label>Degree</Label>
                <Input
                  value={edu.degree}
                  onChange={(e) => onUpdate(edu.id, 'degree', e.target.value)}
                  placeholder="e.g., Bachelor of Science"
                />
              </div>
            </div>
            
            <div>
              <Label>Year</Label>
              <Input
                value={edu.year}
                onChange={(e) => onUpdate(edu.id, 'year', e.target.value)}
                placeholder="e.g., 2020"
              />
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={edu.description}
                onChange={(e) => onUpdate(edu.id, 'description', e.target.value)}
                placeholder="Additional details about your education"
                rows={3}
              />
            </div>

            <div>
              <Label>Grade</Label>
              <Input
                value={edu.grade}
                onChange={(e) => onUpdate(edu.id, 'grade', e.target.value)}
                placeholder="e.g., A"
              />
            </div>

            <div>
              <Label>Location</Label>
              <Input
                value={edu.location}
                onChange={(e) => onUpdate(edu.id, 'location', e.target.value)}
                placeholder="City, Country"
              />
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onRemove(edu.id)}
              className="text-red-600 hover:text-red-700"
            >
              Remove Education
            </Button>
          </div>
        </Card>
      ))}

      <Button variant="outline" onClick={onAdd}>
        Add Education
      </Button>
    </div>
  );
};

// Activities Section Component
const ActivitiesSection = ({ activities, onAdd, onUpdate, onRemove }: { 
  activities: any[]; 
  onAdd: () => void; 
  onUpdate: (id: string, field: string, value: string) => void;
  onRemove: (id: string) => void;
}) => {
  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <Card key={activity.id} className="p-4">
          <div className="space-y-4">
            <div>
              <Label>Activity Title</Label>
              <Input
                value={activity.title}
                onChange={(e) => onUpdate(activity.id, 'title', e.target.value)}
                placeholder="Activity name"
              />
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={activity.description}
                onChange={(e) => onUpdate(activity.id, 'description', e.target.value)}
                placeholder="Describe the activity"
                rows={3}
              />
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onRemove(activity.id)}
              className="text-red-600 hover:text-red-700"
            >
              Remove Activity
            </Button>
          </div>
        </Card>
      ))}

      <Button variant="outline" onClick={onAdd}>
        Add Activity
      </Button>
    </div>
  );
};

// Projects Section Component
const ProjectsSection = ({ projects, onAdd, onUpdate, onRemove }: { 
  projects: any[]; 
  onAdd: () => void; 
  onUpdate: (id: string, field: string, value: string) => void;
  onRemove: (id: string) => void;
}) => {
  return (
    <div className="space-y-4">
      {projects.map((project) => (
        <Card key={project.id} className="p-4">
          <div className="space-y-4">
            <div>
              <Label>Project Name</Label>
              <Input
                value={project.name}
                onChange={(e) => onUpdate(project.id, 'name', e.target.value)}
                placeholder="Project name"
              />
            </div>

            <div>
              <Label>Tech Stack</Label>
              <Input
                value={project.techStack}
                onChange={(e) => onUpdate(project.id, 'techStack', e.target.value)}
                placeholder="e.g., React, Node.js, MongoDB"
              />
            </div>

                         <div className="grid grid-cols-2 gap-4">
               <div>
                 <Label>Start Date</Label>
                 <Input
                   value={project.startDate}
                   onChange={(e) => onUpdate(project.id, 'startDate', e.target.value)}
                   placeholder="e.g., Jan 2022"
                 />
               </div>
               <div>
                 <Label>End Date</Label>
                 <Input
                   value={project.endDate}
                   onChange={(e) => onUpdate(project.id, 'endDate', e.target.value)}
                   placeholder="e.g., Dec 2022"
                 />
               </div>
             </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={project.description}
                onChange={(e) => onUpdate(project.id, 'description', e.target.value)}
                placeholder="Describe the project"
                rows={3}
              />
            </div>

            <div>
              <Label>Link</Label>
              <Input
                value={project.link}
                onChange={(e) => onUpdate(project.id, 'link', e.target.value)}
                placeholder="https://example.com/project"
              />
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onRemove(project.id)}
              className="text-red-600 hover:text-red-700"
            >
              Remove Project
            </Button>
          </div>
        </Card>
      ))}

      <Button variant="outline" onClick={onAdd}>
        Add Project
      </Button>
    </div>
  );
};

// Certifications Section Component
const CertificationsSection = ({ certifications, onAdd, onUpdate, onRemove }: { 
  certifications: any[]; 
  onAdd: () => void; 
  onUpdate: (id: string, field: string, value: string) => void;
  onRemove: (id: string) => void;
}) => {
  return (
    <div className="space-y-4">
      {certifications.map((cert) => (
        <Card key={cert.id} className="p-4">
          <div className="space-y-4">
            <div>
              <Label>Certificate Name</Label>
              <Input
                value={cert.certificateName}
                onChange={(e) => onUpdate(cert.id, 'certificateName', e.target.value)}
                placeholder="e.g., AWS Certified Developer"
              />
            </div>

                         <div className="grid grid-cols-2 gap-4">
               <div>
                 <Label>Start Date</Label>
                 <Input
                   value={cert.startDate}
                   onChange={(e) => onUpdate(cert.id, 'startDate', e.target.value)}
                   placeholder="e.g., Jan 2023"
                 />
               </div>
               <div>
                 <Label>End Date</Label>
                 <Input
                   value={cert.endDate}
                   onChange={(e) => onUpdate(cert.id, 'endDate', e.target.value)}
                   placeholder="e.g., Present"
                 />
               </div>
             </div>

            <div>
              <Label>Institute</Label>
              <Input
                value={cert.instituteName}
                onChange={(e) => onUpdate(cert.id, 'instituteName', e.target.value)}
                placeholder="e.g., Amazon Web Services"
              />
            </div>

            <div>
              <Label>Link</Label>
              <Input
                value={cert.link}
                onChange={(e) => onUpdate(cert.id, 'link', e.target.value)}
                placeholder="https://example.com/certificate"
              />
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onRemove(cert.id)}
              className="text-red-600 hover:text-red-700"
            >
              Remove Certification
            </Button>
          </div>
        </Card>
      ))}

      <Button variant="outline" onClick={onAdd}>
        Add Certification
      </Button>
    </div>
  );
};

// References Section Component
const ReferencesSection = ({ references, onAdd, onUpdate, onRemove }: { 
  references: any[]; 
  onAdd: () => void; 
  onUpdate: (id: string, field: string, value: string) => void;
  onRemove: (id: string) => void;
}) => {
  return (
    <div className="space-y-4">
      {references.map((ref) => (
        <Card key={ref.id} className="p-4">
          <div className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input
                value={ref.name}
                onChange={(e) => onUpdate(ref.id, 'name', e.target.value)}
                placeholder="Reference name"
              />
            </div>

            <div>
              <Label>Title</Label>
              <Input
                value={ref.title}
                onChange={(e) => onUpdate(ref.id, 'title', e.target.value)}
                placeholder="e.g., CEO"
              />
            </div>

            <div>
              <Label>Company</Label>
              <Input
                value={ref.company}
                onChange={(e) => onUpdate(ref.id, 'company', e.target.value)}
                placeholder="Company name"
              />
            </div>

            <div>
              <Label>Phone</Label>
              <Input
                value={ref.phone}
                onChange={(e) => onUpdate(ref.id, 'phone', e.target.value)}
                placeholder="+1 234 567 8900"
              />
            </div>

            <div>
              <Label>Email</Label>
              <Input
                value={ref.email}
                onChange={(e) => onUpdate(ref.id, 'email', e.target.value)}
                placeholder="reference@example.com"
              />
            </div>

            <div>
              <Label>Relationship</Label>
              <Input
                value={ref.relationship}
                onChange={(e) => onUpdate(ref.id, 'relationship', e.target.value)}
                placeholder="e.g., Previous Employer"
              />
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onRemove(ref.id)}
              className="text-red-600 hover:text-red-700"
            >
              Remove Reference
            </Button>
          </div>
        </Card>
      ))}

      <Button variant="outline" onClick={onAdd}>
        Add Reference
      </Button>
    </div>
  );
};


// Summary Section Component
const SummarySection = ({ summary, objective, onChange }: { 
  summary: string; 
  objective: string; 
  onChange: (summary: string, objective: string) => void;
}) => {
  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="summary">Professional Summary</Label>
        <Textarea
          id="summary"
          value={summary}
          onChange={(e) => onChange(e.target.value, objective)}
          placeholder="Write a compelling summary of your professional background and key strengths..."
          rows={4}
        />
      </div>

      <div>
        <Label htmlFor="objective">Career Objective</Label>
        <Textarea
          id="objective"
          value={objective}
          onChange={(e) => onChange(summary, e.target.value)}
          placeholder="Describe your career goals and what you hope to achieve..."
          rows={4}
        />
      </div>
    </div>
  );
};

// Custom Section Editor Component
const CustomSectionEditor = ({ 
  section, 
  onUpdate, 
  onRemove, 
  onMoveUp, 
  onMoveDown, 
  totalSections 
}: { 
  section: any; 
  onUpdate: (field: string, value: any) => void; 
  onRemove: () => void; 
  onMoveUp: () => void; 
  onMoveDown: () => void; 
  totalSections: number;
}) => {
  const addItem = () => {
    const newItem = {
      id: Date.now().toString() + Math.random(),
      title: '',
      subtitle: '',
      description: '',
      startDate: '',
      endDate: '',
      location: '',
      link: '',
      bullets: [''],
      tags: ['']
    };
    
    const currentItems = section.content.items || [];
    onUpdate('content', { ...section.content, items: [...currentItems, newItem] });
  };

  const updateItem = (itemId: string, field: string, value: any) => {
    const updatedItems = (section.content.items || []).map((item: any) =>
      item.id === itemId ? { ...item, [field]: value } : item
    );
    onUpdate('content', { ...section.content, items: updatedItems });
  };

  const removeItem = (itemId: string) => {
    const updatedItems = (section.content.items || []).filter((item: any) => item.id !== itemId);
    onUpdate('content', { ...section.content, items: updatedItems });
  };

  const addBullet = (itemId: string) => {
    const item = (section.content.items || []).find((i: any) => i.id === itemId);
    if (item) {
      const updatedBullets = [...(item.bullets || []), ''];
      updateItem(itemId, 'bullets', updatedBullets);
    }
  };

  const updateBullet = (itemId: string, bulletIndex: number, value: string) => {
    const item = (section.content.items || []).find((i: any) => i.id === itemId);
    if (item) {
      const updatedBullets = [...(item.bullets || [])];
      updatedBullets[bulletIndex] = value;
      updateItem(itemId, 'bullets', updatedBullets);
    }
  };

  const removeBullet = (itemId: string, bulletIndex: number) => {
    const item = (section.content.items || []).find((i: any) => i.id === itemId);
    if (item) {
      const updatedBullets = (item.bullets || []).filter((_: any, index: number) => index !== bulletIndex);
      updateItem(itemId, 'bullets', updatedBullets);
    }
  };

  const addTag = (itemId: string) => {
    const item = (section.content.items || []).find((i: any) => i.id === itemId);
    if (item) {
      const updatedTags = [...(item.tags || []), ''];
      updateItem(itemId, 'tags', updatedTags);
    }
  };

  const updateTag = (itemId: string, tagIndex: number, value: string) => {
    const item = (section.content.items || []).find((i: any) => i.id === itemId);
    if (item) {
      const updatedTags = [...(item.tags || [])];
      updatedTags[tagIndex] = value;
      updateItem(itemId, 'tags', updatedTags);
    }
  };

  const removeTag = (itemId: string, tagIndex: number) => {
    const item = (section.content.items || []).find((i: any) => i.id === itemId);
    if (item) {
      const updatedTags = (item.tags || []).filter((_: any, index: number) => index !== tagIndex);
      updateItem(itemId, 'tags', updatedTags);
    }
  };

  return (
    <div className="space-y-6">
      {/* Section Title */}
      <div>
        <Label>Section Title</Label>
        <Input
          value={section.title}
          onChange={(e) => onUpdate('title', e.target.value)}
          placeholder="Enter section title"
        />
      </div>

      {/* Section Type */}
      <div>
        <Label>Section Type</Label>
        <select
          value={section.type}
          onChange={(e) => onUpdate('type', e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md"
        >
          <option value="text">Text Only</option>
          <option value="list">List Items</option>
          <option value="timeline">Timeline</option>
          <option value="grid">Grid Layout</option>
          <option value="mixed">Mixed Content</option>
        </select>
      </div>

      {/* Styling Options */}
      <div className="space-y-3">
        <Label>Styling Options</Label>
        <div className="grid grid-cols-2 gap-3">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={section.styling?.showBullets || false}
              onChange={(e) => onUpdate('styling', { ...section.styling, showBullets: e.target.checked })}
              className="rounded"
            />
            <span className="text-sm">Show Bullets</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={section.styling?.showDates || false}
              onChange={(e) => onUpdate('styling', { ...section.styling, showDates: e.target.checked })}
              className="rounded"
            />
            <span className="text-sm">Show Dates</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={section.styling?.showLocation || false}
              onChange={(e) => onUpdate('styling', { ...section.styling, showLocation: e.target.checked })}
              className="rounded"
            />
            <span className="text-sm">Show Location</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={section.styling?.showLinks || false}
              onChange={(e) => onUpdate('styling', { ...section.styling, showLinks: e.target.checked })}
              className="rounded"
            />
            <span className="text-sm">Show Links</span>
          </label>
        </div>
      </div>

      {/* Text Content (for text type) */}
      {section.type === 'text' && (
        <div>
          <Label>Content</Label>
          <Textarea
            value={section.content.text || ''}
            onChange={(e) => onUpdate('content', { ...section.content, text: e.target.value })}
            placeholder="Enter section content..."
            rows={4}
          />
        </div>
      )}

      {/* Items Content (for list, timeline, grid, mixed types) */}
      {(section.type === 'list' || section.type === 'timeline' || section.type === 'grid' || section.type === 'mixed') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Items</Label>
            <Button variant="outline" size="sm" onClick={addItem}>
              Add Item
            </Button>
          </div>
          
          {(section.content.items || []).map((item: any, index: number) => (
            <Card key={item.id} className="p-4">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Title</Label>
                    <Input
                      value={item.title || ''}
                      onChange={(e) => updateItem(item.id, 'title', e.target.value)}
                      placeholder="Item title"
                    />
                  </div>
                  <div>
                    <Label>Subtitle</Label>
                    <Input
                      value={item.subtitle || ''}
                      onChange={(e) => updateItem(item.id, 'subtitle', e.target.value)}
                      placeholder="Item subtitle"
                    />
                  </div>
                </div>

                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={item.description || ''}
                    onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                    placeholder="Item description"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Start Date</Label>
                    <Input
                      value={item.startDate || ''}
                      onChange={(e) => updateItem(item.id, 'startDate', e.target.value)}
                      placeholder="e.g., Jan 2020"
                    />
                  </div>
                  <div>
                    <Label>End Date</Label>
                    <Input
                      value={item.endDate || ''}
                      onChange={(e) => updateItem(item.id, 'endDate', e.target.value)}
                      placeholder="e.g., Present"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Location</Label>
                    <Input
                      value={item.location || ''}
                      onChange={(e) => updateItem(item.id, 'location', e.target.value)}
                      placeholder="City, Country"
                    />
                  </div>
                  <div>
                    <Label>Link</Label>
                    <Input
                      value={item.link || ''}
                      onChange={(e) => updateItem(item.id, 'link', e.target.value)}
                      placeholder="https://example.com"
                    />
                  </div>
                </div>

                {/* Bullets */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Bullet Points</Label>
                    <Button variant="outline" size="sm" onClick={() => addBullet(item.id)}>
                      Add Bullet
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {(item.bullets || []).map((bullet: string, bulletIndex: number) => (
                      <div key={bulletIndex} className="flex gap-2">
                        <Input
                          value={bullet}
                          onChange={(e) => updateBullet(item.id, bulletIndex, e.target.value)}
                          placeholder="Enter bullet point"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeBullet(item.id, bulletIndex)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Tags</Label>
                    <Button variant="outline" size="sm" onClick={() => addTag(item.id)}>
                      Add Tag
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {(item.tags || []).map((tag: string, tagIndex: number) => (
                      <div key={tagIndex} className="flex gap-2">
                        <Input
                          value={tag}
                          onChange={(e) => updateTag(item.id, tagIndex, e.target.value)}
                          placeholder="Enter tag"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeTag(item.id, tagIndex)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeItem(item.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  Remove Item
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Section Controls */}
      <div className="flex items-center justify-between pt-4 border-t">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onMoveUp}
            disabled={section.position === 0}
          >
            ↑ Move Up
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onMoveDown}
            disabled={section.position === totalSections - 1}
          >
            ↓ Move Down
          </Button>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onRemove}
          className="text-red-600 hover:text-red-700"
        >
          Remove Section
        </Button>
      </div>
    </div>
  );
};



export default ResumeBuilderPage; 