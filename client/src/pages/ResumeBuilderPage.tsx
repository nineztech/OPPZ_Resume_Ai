import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { fileExtractionService } from '@/services/fileExtractionService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
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
  ChevronRight
} from 'lucide-react';
import TemplateRenderer from '@/components/templates/TemplateRenderer';
import { templates as templateData, getTemplateById } from '@/data/templates';
import type { Template } from '@/data/templates';
import ResumePreviewModal from '@/components/modals/ResumePreviewModal';
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
  }>;
  education: Array<{
    id: string;
    institution: string;
    degree: string;
    year: string;
    description: string;
  }>;
  skills: string[];
  languages: string[];
  activities: Array<{
    id: string;
    title: string;
    description: string;
  }>;
  volunteering: Array<{
    id: string;
    organization: string;
    role: string;
    description: string;
  }>;
}

const ResumeBuilderPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('basic-details');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [templateScrollIndex, setTemplateScrollIndex] = useState(0);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const resumeRef = useRef<HTMLDivElement>(null);
  const [resumeData, setResumeData] = useState<ResumeData>({
    basicDetails: {
      fullName: '',
      title: '',
      phone: '',
      email: '',
      location: '',
      website: ''
    },
    summary: '',
    objective: '',
    experience: [],
    education: [],
    skills: [],
    languages: [],
    activities: [],
    volunteering: []
  });

  const templateId = location.state?.templateId || 'modern-professional';
  const selectedColor = location.state?.selectedColor || 'blue';

  useEffect(() => {
    // Initialize selected template
    const currentTemplate = getTemplateById(templateId);
    setSelectedTemplate(currentTemplate || templateData[0]);
  }, [templateId]);

  useEffect(() => {
    if (location.state?.extractedData && location.state?.mode === 'raw') {
      parseExtractedText(location.state.extractedData);
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
          website: defaultData.personalInfo.website || ''
        },
        summary: defaultData.summary || '',
        objective: '',
        experience: defaultData.experience?.map((exp: any) => ({
          id: Date.now().toString() + Math.random(),
          company: exp.company || '',
          position: exp.title || '',
          duration: exp.dates || '',
          description: exp.achievements?.join('\n') || ''
        })) || [],
        education: defaultData.education?.map((edu: any) => ({
          id: Date.now().toString() + Math.random(),
          institution: edu.institution || '',
          degree: edu.degree || '',
          year: edu.dates || '',
          description: edu.details?.join('\n') || ''
        })) || [],
        skills: defaultData.skills?.technical || [],
        languages: defaultData.additionalInfo?.languages || [],
        activities: [],
        volunteering: []
      });
    }
  }, [location.state]);

  const extractTextFromFile = async (file: File) => {
    try {
      console.log('Starting text extraction from file:', file.name, file.type);
      const extractedData = await fileExtractionService.extractTextFromFile(file);
      console.log('Extracted data:', extractedData);
      parseExtractedText(extractedData);
    } catch (error) {
      console.error('Error extracting text:', error);
    }
  };

  const parseExtractedText = (extractedData: any) => {
    console.log('Parsing extracted text:', extractedData);
    // Parse extracted text and update resume data
    const { text, sections, contact } = extractedData;
    const contactInfo = contact || fileExtractionService.extractContactInfo(text);
    console.log('Extracted contact info:', contactInfo);
    
    const updatedData = { ...resumeData };
    
    // Update basic details from extracted contact info
    if (contactInfo?.name) {
      updatedData.basicDetails.fullName = contactInfo.name;
    }
    if (contactInfo?.title) {
      updatedData.basicDetails.title = contactInfo.title;
    }
    if (contactInfo?.email) {
      updatedData.basicDetails.email = contactInfo.email;
    }
    if (contactInfo?.phone) {
      updatedData.basicDetails.phone = contactInfo.phone;
    }
    if (contactInfo?.location) {
      updatedData.basicDetails.location = contactInfo.location;
    }

    console.log('Updated basic details:', updatedData.basicDetails);

    // Update summary section
    if (sections?.summary) {
      updatedData.summary = sections.summary;
    } else if (sections?.profile) {
      updatedData.summary = sections.profile;
    } else if (sections?.about) {
      updatedData.summary = sections.about;
    }

    // Try to extract additional information from the full text if sections are missing
    if (!sections?.experience && text) {
      const experienceSection = extractSectionFromText(text, 'experience');
      if (experienceSection) {
        sections.experience = experienceSection;
      }
    }

    if (!sections?.education && text) {
      const educationSection = extractSectionFromText(text, 'education');
      if (educationSection) {
        sections.education = educationSection;
      }
    }

    // Update objective section
    if (sections?.objective) {
      updatedData.objective = sections.objective;
    }

    // Parse experience section with improved logic
    if (sections?.experience) {
      console.log('Parsing experience section:', sections.experience);
      const experienceLines = sections.experience.split('\n').filter((line: string) => line.trim());
      const experiences = [];
      let currentExp: any = { id: Date.now().toString() + Math.random() };

      for (let i = 0; i < experienceLines.length; i++) {
        const trimmedLine = experienceLines[i].trim();
        
        // Skip empty lines
        if (!trimmedLine) continue;
        
        // Try to detect if this is a new experience entry
        if (isNewExperienceEntry(trimmedLine, i, experienceLines)) {
          // Save previous experience if it has meaningful data
          if (currentExp.company || currentExp.position) {
            experiences.push(currentExp);
          }
          currentExp = { id: Date.now().toString() + Math.random() };
        }
        
        // Check if this line contains company information
        if (isCompanyLine(trimmedLine)) {
          currentExp.company = extractCompanyName(trimmedLine);
        }
        // Check if this line contains position/title information
        else if (isPositionLine(trimmedLine)) {
          currentExp.position = extractPosition(trimmedLine);
        }
        // Check if this line contains date/duration information
        else if (isDateLine(trimmedLine)) {
          currentExp.duration = extractDuration(trimmedLine);
        }
        // Otherwise, treat as description
        else {
          if (currentExp.description) {
            currentExp.description += ' ' + trimmedLine;
          } else {
            currentExp.description = trimmedLine;
          }
        }
      }
      
      // Add the last experience if it has meaningful data
      if (currentExp.company || currentExp.position) {
        experiences.push(currentExp);
      }
      
      updatedData.experience = experiences;
      console.log('Parsed experiences:', experiences);
    }

    // Parse education section with improved logic
    if (sections?.education) {
      console.log('Parsing education section:', sections.education);
      const educationLines = sections.education.split('\n').filter((line: string) => line.trim());
      const educations = [];
      let currentEdu: any = { id: Date.now().toString() + Math.random() };

      for (let i = 0; i < educationLines.length; i++) {
        const trimmedLine = educationLines[i].trim();
        
        // Skip empty lines
        if (!trimmedLine) continue;
        
        // Try to detect if this is a new education entry
        if (isNewEducationEntry(trimmedLine, i, educationLines)) {
          // Save previous education if it has meaningful data
          if (currentEdu.institution || currentEdu.degree) {
            educations.push(currentEdu);
          }
          currentEdu = { id: Date.now().toString() + Math.random() };
        }
        
        // Check if this line contains institution information
        if (isInstitutionLine(trimmedLine)) {
          currentEdu.institution = extractInstitution(trimmedLine);
        }
        // Check if this line contains degree information
        else if (isDegreeLine(trimmedLine)) {
          currentEdu.degree = extractDegree(trimmedLine);
        }
        // Check if this line contains year/date information
        else if (isYearLine(trimmedLine)) {
          currentEdu.year = extractYear(trimmedLine);
        }
        // Otherwise, treat as description
        else {
          if (currentEdu.description) {
            currentEdu.description += ' ' + trimmedLine;
          } else {
            currentEdu.description = trimmedLine;
          }
        }
      }
      
      // Add the last education if it has meaningful data
      if (currentEdu.institution || currentEdu.degree) {
        educations.push(currentEdu);
      }
      
      updatedData.education = educations;
      console.log('Parsed education:', educations);
    }

    // Parse skills section with improved extraction
    if (sections?.skills) {
      const skillsText = sections.skills.toLowerCase();
      const commonSkills = [
        'javascript', 'html', 'css', 'react', 'angular', 'vue', 'node.js', 'python', 'java', 'c++', 'c#',
        'php', 'ruby', 'go', 'swift', 'kotlin', 'typescript', 'sql', 'mongodb', 'mysql', 'postgresql',
        'aws', 'azure', 'docker', 'kubernetes', 'git', 'agile', 'scrum', 'leadership', 'communication',
        'project management', 'ui/ux', 'figma', 'adobe', 'photoshop', 'illustrator', 'wordpress', 'drupal',
        'jira', 'confluence', 'slack', 'teams', 'zoom', 'skype', 'excel', 'powerpoint', 'word', 'outlook'
      ];
      
      const extractedSkills = commonSkills.filter(skill => skillsText.includes(skill));
      
      // Also extract skills from the text that might not be in the common list
      const skillLines = sections.skills.split('\n').filter((line: string) => line.trim());
      const additionalSkills = skillLines
        .map((line: string) => line.trim())
        .filter((line: string) => line.length > 0 && line.length < 50)
        .slice(0, 10); // Limit to 10 additional skills
      
      updatedData.skills = [...new Set([...extractedSkills, ...additionalSkills])];
      console.log('Parsed skills:', updatedData.skills);
    }

    // Parse languages section
    if (sections?.languages) {
      const languagesText = sections.languages.toLowerCase();
      const commonLanguages = [
        'english', 'spanish', 'french', 'german', 'italian', 'portuguese', 'russian', 'chinese', 'japanese',
        'korean', 'arabic', 'hindi', 'urdu', 'bengali', 'tamil', 'telugu', 'marathi', 'gujarati'
      ];
      
      const extractedLanguages = commonLanguages.filter(lang => languagesText.includes(lang));
      
      // Also extract languages from the text
      const languageLines = sections.languages.split('\n').filter((line: string) => line.trim());
      const additionalLanguages = languageLines
        .map((line: string) => line.trim())
        .filter((line: string) => line.length > 0 && line.length < 30)
        .slice(0, 5); // Limit to 5 additional languages
      
      updatedData.languages = [...new Set([...extractedLanguages, ...additionalLanguages])];
      console.log('Parsed languages:', updatedData.languages);
    }

    // Parse activities section
    if (sections?.activities) {
      const activitiesLines = sections.activities.split('\n').filter((line: string) => line.trim());
      const activities = activitiesLines.map((line: string, index: number) => ({
        id: (Date.now() + index).toString(),
        title: line.trim(),
        description: ''
      }));
      updatedData.activities = activities;
      console.log('Parsed activities:', activities);
    }

    // Parse volunteering section
    if (sections?.volunteering) {
      const volunteeringLines = sections.volunteering.split('\n').filter((line: string) => line.trim());
      const volunteering = [];
      let currentVol: any = { id: Date.now().toString() + Math.random() };

      for (const line of volunteeringLines) {
        const trimmedLine = line.trim();
        
        if (!trimmedLine) continue;
        
        if (isOrganizationLine(trimmedLine)) {
          if (currentVol.organization && currentVol.role) {
            volunteering.push(currentVol);
            currentVol = { id: Date.now().toString() + Math.random() };
          }
          currentVol.organization = extractOrganization(trimmedLine);
        } else if (isRoleLine(trimmedLine)) {
          currentVol.role = extractRole(trimmedLine);
        } else {
          if (currentVol.description) {
            currentVol.description += ' ' + trimmedLine;
          } else {
            currentVol.description = trimmedLine;
          }
        }
      }
      
      if (currentVol.organization && currentVol.role) {
        volunteering.push(currentVol);
      }
      
      updatedData.volunteering = volunteering;
      console.log('Parsed volunteering:', volunteering);
    }

    console.log('Final updated resume data:', updatedData);
    setResumeData(updatedData);
  };

  // Helper methods for parsing different sections
  const isCompanyLine = (line: string): boolean => {
    const lower = line.toLowerCase();
    return !lower.includes('university') && !lower.includes('college') && !lower.includes('school') &&
           (lower.includes('inc') || lower.includes('corp') || lower.includes('ltd') || 
            lower.includes('company') || lower.includes('llc') || lower.includes('group') ||
            lower.includes('technologies') || lower.includes('solutions') || lower.includes('systems') ||
            /^[A-Z][a-zA-Z\s&.,]+(?:Inc|Corp|Ltd|LLC|Company|Group|Technologies|Solutions|Systems)$/i.test(line));
  };

  const extractCompanyName = (line: string): string => {
    return line.replace(/Company|Employer|Inc|Corp|Ltd|LLC|Group|Technologies|Solutions|Systems|:/gi, '').trim();
  };

  const isPositionLine = (line: string): boolean => {
    const lower = line.toLowerCase();
    return lower.includes('developer') || lower.includes('engineer') || lower.includes('manager') ||
           lower.includes('analyst') || lower.includes('specialist') || lower.includes('coordinator') ||
           lower.includes('assistant') || lower.includes('director') || lower.includes('lead') ||
           lower.includes('senior') || lower.includes('junior') || lower.includes('position') ||
           lower.includes('title') || lower.includes('role') || lower.includes('consultant') ||
           lower.includes('architect') || lower.includes('designer') || lower.includes('programmer') ||
           lower.includes('administrator') || lower.includes('supervisor') || lower.includes('executive');
  };

  const extractPosition = (line: string): string => {
    return line.replace(/Position|Title|Role|:/gi, '').trim();
  };

  const isDateLine = (line: string): boolean => {
    return /\d{4}/.test(line) && (line.includes('20') || line.includes('19') || 
           line.includes('present') || line.includes('current') || line.includes('to'));
  };

  const extractDuration = (line: string): string => {
    return line.replace(/Duration|Date|Period|:/gi, '').trim();
  };

  const isInstitutionLine = (line: string): boolean => {
    const lower = line.toLowerCase();
    return lower.includes('university') || lower.includes('college') || lower.includes('school') ||
           lower.includes('institute') || lower.includes('academy') || lower.includes('institution') ||
           lower.includes('polytechnic') || lower.includes('university of') || lower.includes('college of') ||
           /^[A-Z][a-zA-Z\s&.,]+(?:University|College|School|Institute|Academy|Polytechnic)$/i.test(line);
  };

  const extractInstitution = (line: string): string => {
    return line.replace(/Institution|University|School|College|Institute|Academy|Polytechnic|:/gi, '').trim();
  };

  const isDegreeLine = (line: string): boolean => {
    const lower = line.toLowerCase();
    return lower.includes('bachelor') || lower.includes('master') || lower.includes('phd') ||
           lower.includes('degree') || lower.includes('diploma') || lower.includes('certificate') ||
           lower.includes('b.tech') || lower.includes('m.tech') || lower.includes('b.sc') ||
           lower.includes('m.sc') || lower.includes('mba') || lower.includes('ba') || lower.includes('ma') ||
           lower.includes('b.e') || lower.includes('m.e') || lower.includes('b.com') || lower.includes('m.com') ||
           lower.includes('b.a') || lower.includes('m.a') || lower.includes('b.s') || lower.includes('m.s') ||
           lower.includes('associate') || lower.includes('high school') || lower.includes('secondary');
  };

  const extractDegree = (line: string): string => {
    return line.replace(/Degree|Qualification|Diploma|Certificate|:/gi, '').trim();
  };

  const isYearLine = (line: string): boolean => {
    return /\d{4}/.test(line) && (line.includes('20') || line.includes('19') || 
           line.includes('graduated') || line.includes('completed'));
  };

  const extractYear = (line: string): string => {
    return line.replace(/Year|Date|Graduated|Completed|:/gi, '').trim();
  };

  const isOrganizationLine = (line: string): boolean => {
    const lower = line.toLowerCase();
    return lower.includes('organization') || lower.includes('ngo') || lower.includes('foundation') ||
           lower.includes('charity') || lower.includes('association') || lower.includes('society');
  };

  const extractOrganization = (line: string): string => {
    return line.replace(/Organization|NGO|Foundation|Charity|Association|Society|:/gi, '').trim();
  };

  const isRoleLine = (line: string): boolean => {
    const lower = line.toLowerCase();
    return lower.includes('volunteer') || lower.includes('member') || lower.includes('coordinator') ||
           lower.includes('assistant') || lower.includes('helper') || lower.includes('role') ||
           lower.includes('position') || lower.includes('title');
  };

  const extractRole = (line: string): string => {
    return line.replace(/Role|Position|Title|:/gi, '').trim();
  };

  // Helper function to extract sections from full text
  const extractSectionFromText = (text: string, sectionName: string): string | null => {
    const lines = text.split('\n');
    const sectionKeywords = {
      experience: ['experience', 'work experience', 'employment', 'work history', 'professional experience'],
      education: ['education', 'academic', 'qualifications', 'degrees', 'academic background']
    };
    
    const keywords = sectionKeywords[sectionName as keyof typeof sectionKeywords];
    if (!keywords) return null;
    
    let startIndex = -1;
    let endIndex = lines.length;
    
    // Find the start of the section
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].toLowerCase();
      if (keywords.some(keyword => line.includes(keyword))) {
        startIndex = i;
        break;
      }
    }
    
    if (startIndex === -1) return null;
    
    // Find the end of the section (next major section)
    for (let i = startIndex + 1; i < lines.length; i++) {
      const line = lines[i].toLowerCase();
      // Check if this line starts a new major section
      if (line.includes('skills') || line.includes('projects') || line.includes('certificates') ||
          line.includes('activities') || line.includes('volunteering') || line.includes('awards') ||
          line.includes('publications') || line.includes('languages')) {
        endIndex = i;
        break;
      }
    }
    
    return lines.slice(startIndex + 1, endIndex).join('\n');
  };

  // Helper functions for detecting new entries
  const isNewExperienceEntry = (line: string, index: number, allLines: string[]): boolean => {
    const lower = line.toLowerCase();
    
    // Check if this line looks like a company name (starts with capital letters, contains business keywords)
    const isCompanyName = /^[A-Z][a-zA-Z\s&.,]+(?:Inc|Corp|Ltd|LLC|Company|Group|Technologies|Solutions|Systems)$/i.test(line);
    
    // Check if this line contains date patterns (indicating a new job entry)
    const hasDatePattern = /\d{4}/.test(line) && (line.includes('20') || line.includes('19'));
    
    // Check if this line is significantly shorter than the previous line (likely a header)
    const prevLine = index > 0 ? allLines[index - 1] : '';
    const isShorterThanPrev = Boolean(prevLine && line.length < prevLine.length * 0.7);
    
    // Check if this line contains job-related keywords
    const hasJobKeywords = lower.includes('developer') || lower.includes('engineer') || 
                          lower.includes('manager') || lower.includes('analyst') ||
                          lower.includes('specialist') || lower.includes('coordinator');
    
    return isCompanyName || (hasDatePattern && hasJobKeywords) || (isShorterThanPrev && hasJobKeywords);
  };

  const isNewEducationEntry = (line: string, index: number, allLines: string[]): boolean => {
    const lower = line.toLowerCase();
    
    // Check if this line looks like an institution name
    const isInstitutionName = /^[A-Z][a-zA-Z\s&.,]+(?:University|College|School|Institute|Academy)$/i.test(line);
    
    // Check if this line contains degree patterns
    const hasDegreePattern = lower.includes('bachelor') || lower.includes('master') || 
                            lower.includes('phd') || lower.includes('degree') ||
                            lower.includes('diploma') || lower.includes('certificate');
    
    // Check if this line contains date patterns (graduation year)
    const hasDatePattern = /\d{4}/.test(line) && (line.includes('20') || line.includes('19'));
    
    // Check if this line is significantly shorter than the previous line (likely a header)
    const prevLine = index > 0 ? allLines[index - 1] : '';
    const isShorterThanPrev = Boolean(prevLine && line.length < prevLine.length * 0.7);
    
    return isInstitutionName || (hasDegreePattern && hasDatePattern) || (isShorterThanPrev && hasDegreePattern);
  };

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
      description: ''
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
    { id: 'volunteering', label: 'Volunteering', icon: Heart }
  ];

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
      <Header />
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
                    professional: resumeData.languages
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
                    languages: resumeData.languages
                  }
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
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Edit Resume</h2>
                <div className="space-y-1">
                  {sections.map((section) => {
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
                                onChange={(education) => updateResumeData('education', education)}
                              />
                            )}

                            {section.id === 'activities' && (
                              <ActivitiesSection
                                activities={resumeData.activities}
                                onChange={(activities) => updateResumeData('activities', activities)}
                              />
                            )}

                            {section.id === 'volunteering' && (
                              <VolunteeringSection
                                volunteering={resumeData.volunteering}
                                onChange={(volunteering) => updateResumeData('volunteering', volunteering)}
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
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Content Area - Remove this section since content now appears in dropdowns */}
              {/* <div className="bg-white rounded-lg border border-gray-200 p-6">
                {activeSection === 'basic-details' && (
                  <BasicDetailsSection
                    data={resumeData.basicDetails}
                    onChange={(data) => updateResumeData('basicDetails', data)}
                  />
                )}

                {activeSection === 'skills' && (
                  <SkillsSection
                    skills={resumeData.skills}
                    languages={resumeData.languages}
                    onChange={(skills, languages) => {
                      updateResumeData('skills', skills);
                      updateResumeData('languages', languages);
                    }}
                  />
                )}

                {activeSection === 'experience' && (
                  <ExperienceSection
                    experience={resumeData.experience}
                    onAdd={addExperience}
                    onUpdate={updateExperience}
                    onRemove={removeExperience}
                  />
                )}

                {activeSection === 'education' && (
                  <EducationSection
                    education={resumeData.education}
                    onChange={(education) => updateResumeData('education', education)}
                  />
                )}

                {activeSection === 'activities' && (
                  <ActivitiesSection
                    activities={resumeData.activities}
                    onChange={(activities) => updateResumeData('activities', activities)}
                  />
                )}

                {activeSection === 'volunteering' && (
                  <VolunteeringSection
                    volunteering={resumeData.volunteering}
                    onChange={(volunteering) => updateResumeData('volunteering', volunteering)}
                  />
                )}

                {activeSection === 'summary' && (
                  <SummarySection
                    summary={resumeData.summary}
                    objective={resumeData.objective}
                    onChange={(summary, objective) => {
                      updateResumeData('summary', summary);
                      updateResumeData('objective', objective);
                    }}
                  />
                )}
              </div> */}
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
            professional: resumeData.languages
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
            languages: resumeData.languages
          }
        }}
        color={selectedColor}
      />
      
      <Footer />
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
    </div>
  );
};

// Skills Section Component
const SkillsSection = ({ skills, languages, onChange }: { skills: string[]; languages: string[]; onChange: (skills: string[], languages: string[]) => void }) => {
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
    onChange(skills, [...languages, '']);
  };

  const updateLanguage = (index: number, value: string) => {
    const newLanguages = [...languages];
    newLanguages[index] = value;
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
                value={language}
                onChange={(e) => updateLanguage(index, e.target.value)}
                placeholder="Enter language"
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
const EducationSection = ({ education, onChange }: { education: any[]; onChange: (education: any[]) => void }) => {
  const addEducation = () => {
    onChange([...education, {
      id: Date.now().toString(),
      institution: '',
      degree: '',
      year: '',
      description: ''
    }]);
  };

  const updateEducation = (id: string, field: string, value: string) => {
    onChange(education.map(edu => 
      edu.id === id ? { ...edu, [field]: value } : edu
    ));
  };

  const removeEducation = (id: string) => {
    onChange(education.filter(edu => edu.id !== id));
  };

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
                  onChange={(e) => updateEducation(edu.id, 'institution', e.target.value)}
                  placeholder="University name"
                />
              </div>
              <div>
                <Label>Degree</Label>
                <Input
                  value={edu.degree}
                  onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                  placeholder="e.g., Bachelor of Science"
                />
              </div>
            </div>
            
            <div>
              <Label>Year</Label>
              <Input
                value={edu.year}
                onChange={(e) => updateEducation(edu.id, 'year', e.target.value)}
                placeholder="e.g., 2020"
              />
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={edu.description}
                onChange={(e) => updateEducation(edu.id, 'description', e.target.value)}
                placeholder="Additional details about your education"
                rows={3}
              />
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => removeEducation(edu.id)}
              className="text-red-600 hover:text-red-700"
            >
              Remove Education
            </Button>
          </div>
        </Card>
      ))}

      <Button variant="outline" onClick={addEducation}>
        Add Education
      </Button>
    </div>
  );
};

// Activities Section Component
const ActivitiesSection = ({ activities, onChange }: { activities: any[]; onChange: (activities: any[]) => void }) => {
  const addActivity = () => {
    onChange([...activities, {
      id: Date.now().toString(),
      title: '',
      description: ''
    }]);
  };

  const updateActivity = (id: string, field: string, value: string) => {
    onChange(activities.map(activity => 
      activity.id === id ? { ...activity, [field]: value } : activity
    ));
  };

  const removeActivity = (id: string) => {
    onChange(activities.filter(activity => activity.id !== id));
  };

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <Card key={activity.id} className="p-4">
          <div className="space-y-4">
            <div>
              <Label>Activity Title</Label>
              <Input
                value={activity.title}
                onChange={(e) => updateActivity(activity.id, 'title', e.target.value)}
                placeholder="Activity name"
              />
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={activity.description}
                onChange={(e) => updateActivity(activity.id, 'description', e.target.value)}
                placeholder="Describe the activity"
                rows={3}
              />
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => removeActivity(activity.id)}
              className="text-red-600 hover:text-red-700"
            >
              Remove Activity
            </Button>
          </div>
        </Card>
      ))}

      <Button variant="outline" onClick={addActivity}>
        Add Activity
      </Button>
    </div>
  );
};

// Volunteering Section Component
const VolunteeringSection = ({ volunteering, onChange }: { volunteering: any[]; onChange: (volunteering: any[]) => void }) => {
  const addVolunteering = () => {
    onChange([...volunteering, {
      id: Date.now().toString(),
      organization: '',
      role: '',
      description: ''
    }]);
  };

  const updateVolunteering = (id: string, field: string, value: string) => {
    onChange(volunteering.map(vol => 
      vol.id === id ? { ...vol, [field]: value } : vol
    ));
  };

  const removeVolunteering = (id: string) => {
    onChange(volunteering.filter(vol => vol.id !== id));
  };

  return (
    <div className="space-y-4">
      {volunteering.map((vol) => (
        <Card key={vol.id} className="p-4">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Organization</Label>
                <Input
                  value={vol.organization}
                  onChange={(e) => updateVolunteering(vol.id, 'organization', e.target.value)}
                  placeholder="Organization name"
                />
              </div>
              <div>
                <Label>Role</Label>
                <Input
                  value={vol.role}
                  onChange={(e) => updateVolunteering(vol.id, 'role', e.target.value)}
                  placeholder="Your role"
                />
              </div>
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={vol.description}
                onChange={(e) => updateVolunteering(vol.id, 'description', e.target.value)}
                placeholder="Describe your volunteer work"
                rows={3}
              />
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => removeVolunteering(vol.id)}
              className="text-red-600 hover:text-red-700"
            >
              Remove Volunteering
            </Button>
          </div>
        </Card>
      ))}

      <Button variant="outline" onClick={addVolunteering}>
        Add Volunteering
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

export default ResumeBuilderPage; 