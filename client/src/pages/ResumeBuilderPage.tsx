import { useState, useEffect } from 'react';
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
  FileText
} from 'lucide-react';
import TemplateRenderer from '@/components/templates/TemplateRenderer';

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
    if (location.state?.extractedData && location.state?.mode === 'raw') {
      parseExtractedText(location.state.extractedData);
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
    const { text, sections } = extractedData;
    const contactInfo = fileExtractionService.extractContactInfo(text);
    console.log('Extracted contact info:', contactInfo);
    
    const updatedData = { ...resumeData };
    
    // Update basic details from extracted contact info
    if (contactInfo.name) {
      updatedData.basicDetails.fullName = contactInfo.name;
    }
    if (contactInfo.title) {
      updatedData.basicDetails.title = contactInfo.title;
    }
    if (contactInfo.email) {
      updatedData.basicDetails.email = contactInfo.email;
    }
    if (contactInfo.phone) {
      updatedData.basicDetails.phone = contactInfo.phone;
    }
    if (contactInfo.location) {
      updatedData.basicDetails.location = contactInfo.location;
    }

    console.log('Updated basic details:', updatedData.basicDetails);

    // Update sections based on parsed data
    if (sections.summary) {
      updatedData.summary = sections.summary;
    }
    if (sections.objective) {
      updatedData.objective = sections.objective;
    }

    // Parse experience section
    if (sections.experience) {
      console.log('Parsing experience section:', sections.experience);
      const experienceLines = sections.experience.split('\n').filter((line: string) => line.trim());
      const experiences = [];
      let currentExp: any = { id: Date.now().toString() };

      for (const line of experienceLines) {
        if (line.includes('Company') || line.includes('Employer')) {
          if (currentExp.company) {
            experiences.push(currentExp);
            currentExp = { id: Date.now().toString() };
          }
          currentExp.company = line.replace(/Company|Employer|:/gi, '').trim();
        } else if (line.includes('Position') || line.includes('Title') || line.includes('Role')) {
          currentExp.position = line.replace(/Position|Title|Role|:/gi, '').trim();
        } else if (line.includes('Duration') || line.includes('Date') || line.includes('Period')) {
          currentExp.duration = line.replace(/Duration|Date|Period|:/gi, '').trim();
        } else if (currentExp.description) {
          currentExp.description += ' ' + line.trim();
        } else {
          currentExp.description = line.trim();
        }
      }
      
      if (currentExp.company) {
        experiences.push(currentExp);
      }
      
      updatedData.experience = experiences;
      console.log('Parsed experiences:', experiences);
    }

    // Parse education section
    if (sections.education) {
      console.log('Parsing education section:', sections.education);
      const educationLines = sections.education.split('\n').filter((line: string) => line.trim());
      const educations = [];
      let currentEdu: any = { id: Date.now().toString() };

      for (const line of educationLines) {
        if (line.includes('Institution') || line.includes('University') || line.includes('School')) {
          if (currentEdu.institution) {
            educations.push(currentEdu);
            currentEdu = { id: Date.now().toString() };
          }
          currentEdu.institution = line.replace(/Institution|University|School|:/gi, '').trim();
        } else if (line.includes('Degree') || line.includes('Qualification')) {
          currentEdu.degree = line.replace(/Degree|Qualification|:/gi, '').trim();
        } else if (line.includes('Year') || line.includes('Date')) {
          currentEdu.year = line.replace(/Year|Date|:/gi, '').trim();
        } else if (currentEdu.description) {
          currentEdu.description += ' ' + line.trim();
        } else {
          currentEdu.description = line.trim();
        }
      }
      
      if (currentEdu.institution) {
        educations.push(currentEdu);
      }
      
      updatedData.education = educations;
      console.log('Parsed education:', educations);
    }

    // Parse skills section
    if (sections.skills) {
      const skillsText = sections.skills.toLowerCase();
      const commonSkills = [
        'javascript', 'html', 'css', 'react', 'angular', 'vue', 'node.js', 'python', 'java', 'c++', 'c#',
        'php', 'ruby', 'go', 'swift', 'kotlin', 'typescript', 'sql', 'mongodb', 'mysql', 'postgresql',
        'aws', 'azure', 'docker', 'kubernetes', 'git', 'agile', 'scrum', 'leadership', 'communication',
        'project management', 'ui/ux', 'figma', 'adobe', 'photoshop', 'illustrator'
      ];
      
      const extractedSkills = commonSkills.filter(skill => skillsText.includes(skill));
      updatedData.skills = extractedSkills;
      console.log('Parsed skills:', extractedSkills);
    }

    // Parse languages section
    if (sections.languages) {
      const languagesText = sections.languages.toLowerCase();
      const commonLanguages = [
        'english', 'spanish', 'french', 'german', 'italian', 'portuguese', 'russian', 'chinese', 'japanese',
        'korean', 'arabic', 'hindi', 'urdu', 'bengali', 'tamil', 'telugu', 'marathi', 'gujarati'
      ];
      
      const extractedLanguages = commonLanguages.filter(lang => languagesText.includes(lang));
      updatedData.languages = extractedLanguages;
      console.log('Parsed languages:', extractedLanguages);
    }

    // Parse activities section
    if (sections.activities) {
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
    if (sections.volunteering) {
      const volunteeringLines = sections.volunteering.split('\n').filter((line: string) => line.trim());
      const volunteering = [];
      let currentVol: any = { id: Date.now().toString() };

      for (const line of volunteeringLines) {
        if (line.includes('Organization') || line.includes('NGO')) {
          if (currentVol.organization) {
            volunteering.push(currentVol);
            currentVol = { id: Date.now().toString() };
          }
          currentVol.organization = line.replace(/Organization|NGO|:/gi, '').trim();
        } else if (line.includes('Role') || line.includes('Position')) {
          currentVol.role = line.replace(/Role|Position|:/gi, '').trim();
        } else if (currentVol.description) {
          currentVol.description += ' ' + line.trim();
        } else {
          currentVol.description = line.trim();
        }
      }
      
      if (currentVol.organization) {
        volunteering.push(currentVol);
      }
      
      updatedData.volunteering = volunteering;
      console.log('Parsed volunteering:', volunteering);
    }

    console.log('Final updated resume data:', updatedData);
    setResumeData(updatedData);
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
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
              <Button variant="outline" size="sm">
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
              <Button size="sm">
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </div>

        <div className="flex h-[calc(100vh-140px)]">
          {/* Left Panel - Resume Preview */}
          <div className="w-1/2 bg-white border-r border-gray-200 overflow-auto">
            <div className="p-6">
              <TemplateRenderer
                templateId={templateId}
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
          <div className="w-1/2 bg-gray-50 overflow-auto">
            <div className="p-6">
              {/* Navigation */}
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Edit Resume</h2>
                <div className="space-y-1">
                  {sections.map((section) => {
                    const Icon = section.icon;
                    return (
                      <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
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
                        <div className="w-4 h-4">→</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Content Area */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
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
              </div>
            </div>
          </div>
        </div>
      </div>
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