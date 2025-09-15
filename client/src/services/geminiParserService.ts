// geminiParserService.ts
// Service to integrate with Gemini Resume Parser backend

export interface GeminiParsedData {
  basic_details?: {
    fullName?: string;
    professionalTitle?: string;
    phone?: string;
    email?: string;
    location?: string;
    website?: string;
    github?: string;
    linkedin?: string;
    // Allow for different field names that Gemini might return
    [key: string]: any;
  };
  summary?: string;
  skills?: string[];
  education?: Array<{
    institution?: string;
    degree?: string;
    startDate?: string;
    endDate?: string;
    grade?: string;
    description?: string;
    location?: string;
    [key: string]: any;
  }>;
  experience?: Array<{
    company?: string;
    role?: string;
    startDate?: string;
    endDate?: string;
    description?: string;
    location?: string;
    [key: string]: any;
  }>;
  projects?: Array<{
    name?: string;
    techStack?: string;
    startDate?: string;
    endDate?: string;
    description?: string;
    link?: string;
    [key: string]: any;
  }>;
  certifications?: Array<{
    certificateName?: string;
    link?: string;
    startDate?: string;
    endDate?: string;
    institueName?: string;
    [key: string]: any;
  }>;
  languages?: Array<{
    name?: string;
    proficiency?: string;
    [key: string]: any;
  }>;
  references?: Array<{
    name?: string;
    title?: string;
    company?: string;
    phone?: string;
    email?: string;
    relationship?: string;
    [key: string]: any;
  }>;
  other?: string[];
  // Allow for any additional fields that Gemini might return
  [key: string]: any;
}

// AI Suggestions interfaces
export interface AIJobDescription {
  jobTitle?: string;
  companyProfile?: string;
  jobSummary?: string;
  keyResponsibilities?: string[];
  requiredSkills?: {
    technical?: string[];
    soft?: string[];
    programming?: string[];
    tools?: string[];
  };
  educationalRequirements?: string[];
  experienceLevel?: string;
  salaryRange?: string;
  benefits?: string[];
  growthOpportunities?: string[];
  atsKeywords?: string[];
  industryFocus?: string[];
}

export interface AISuggestions {
  overallScore?: number;
  atsCompatibility?: {
    score?: number;
    strengths?: string[];
    improvements?: string[];
  };
  skillsAnalysis?: {
    matchingSkills?: string[];
    missingSkills?: string[];
    skillsToHighlight?: string[];
    skillsToAdd?: string[];
  };
  experienceAnalysis?: {
    relevantExperience?: string[];
    experienceGaps?: string[];
    experienceEnhancements?: string[];
  };
  keywordOptimization?: {
    presentKeywords?: string[];
    missingKeywords?: string[];
    keywordDensityTips?: string[];
  };
  sectionRecommendations?: {
    summary?: {
      current?: string;
      suggested?: string;
      improvements?: string[];
    };
    skills?: {
      additions?: string[];
      reorganization?: string[];
    };
    experience?: {
      bulletPointImprovements?: string[];
      quantificationSuggestions?: string[];
    };
    education?: {
      relevantCertifications?: string[];
      additionalCourses?: string[];
    };
  };
  formatRecommendations?: {
    structure?: string[];
    design?: string[];
    atsOptimization?: string[];
  };
  industrySpecificTips?: string[];
  actionPlan?: {
    immediate?: string[];
    shortTerm?: string[];
    longTerm?: string[];
  };
  confidenceBoost?: {
    strengths?: string[];
    uniqueValue?: string[];
  };
}

export interface AIProcessingResult {
  resumeData?: GeminiParsedData;
  jobDescription?: AIJobDescription;
  suggestions?: AISuggestions;
  processedAt?: string;
  parameters?: {
    sector?: string;
    country?: string;
    designation?: string;
  };
}

class GeminiParserService {
  private baseUrl: string;

  constructor() {
    // Use the parse service backend URL
    this.baseUrl = `${import.meta.env.PYTHON_URL}`;
  }

  async parseResume(file: File): Promise<GeminiParsedData> {
    try {
      // Validate file
      if (!file) {
        throw new Error('No file provided');
      }

      // Check file size (16MB limit)
      if (file.size > 16 * 1024 * 1024) {
        throw new Error('File size exceeds 16MB limit');
      }

      // Check file type
      const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
      const allowedExtensions = ['.pdf', '.docx', '.txt'];
      const fileName = file.name.toLowerCase();
      
      if (!allowedTypes.includes(file.type) && !allowedExtensions.some(ext => fileName.endsWith(ext))) {
        throw new Error('Unsupported file type. Please use PDF, DOCX, or TXT files.');
      }

      const formData = new FormData();
      formData.append('resume', file);

      console.log('Sending file to Gemini parser:', file.name, file.size, file.type);

      const response = await fetch(`${this.baseUrl}/parse`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      
      console.log('Raw server response:', result);
      console.log('Response type:', typeof result);
      console.log('Response keys:', Object.keys(result || {}));
      
      // Validate response structure
      if (!result || typeof result !== 'object') {
        throw new Error('Invalid response format from server');
      }
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to parse resume');
      }

      if (!result.data) {
        throw new Error('No data received from server');
      }

      console.log('Gemini parsing successful:', result.data);
      console.log('Raw Gemini response structure:', JSON.stringify(result.data, null, 2));
      return result.data;
    } catch (error) {
      console.error('Error parsing resume with Gemini:', error);
      
      // Provide user-friendly error messages
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch')) {
          throw new Error('Cannot connect to AI parser. Please ensure the backend is running on port 8000.');
        } else if (error.message.includes('Server error: 500')) {
          throw new Error('AI parsing failed. Please check your API key and try again.');
        } else if (error.message.includes('Invalid response format')) {
          throw new Error('Server returned invalid response format. Please try again.');
        } else if (error.message.includes('No data received')) {
          throw new Error('Server did not return any data. Please try again.');
        } else {
          throw error;
        }
      }
      
      throw new Error('An unexpected error occurred during AI parsing');
    }
  }

  // Convert Gemini parsed data to the format expected by ResumeBuilderPage
  convertToResumeData(geminiData: GeminiParsedData) {
          console.log('Converting Gemini data:', geminiData);
      console.log('Raw Gemini data structure:', JSON.stringify(geminiData, null, 2));
    
    // Handle different possible field names from Gemini response
    const basicDetails = geminiData.basic_details || {};
    
    return {
      basicDetails: {
        fullName: basicDetails.fullName || basicDetails.full_name || basicDetails.name || basicDetails.Full_Name || basicDetails['Full Name'] || '',
        professionalTitle: basicDetails.professionalTitle || basicDetails.professional_title || basicDetails.title || basicDetails.Title || basicDetails['Professional Title'] || '',
        phone: basicDetails.phone || basicDetails.Phone || basicDetails['Phone'] || '',
        email: basicDetails.email || basicDetails.Email || basicDetails['Email'] || '',
        location: basicDetails.location || basicDetails.Location || basicDetails['Location'] || basicDetails.address || basicDetails.Address || '',
        website: basicDetails.website || basicDetails.Website || basicDetails['Website'] || '',
        github: basicDetails.github || basicDetails.GitHub || basicDetails['GitHub'] || '',
        linkedin: basicDetails.linkedin || basicDetails.LinkedIn || basicDetails['LinkedIn'] || ''
      },
      summary: geminiData.summary || '',
      objective: '', // Not provided by Gemini parser
      experience: (Array.isArray(geminiData.experience) ? geminiData.experience : []).map(exp => ({
        id: Date.now().toString() + Math.random(),
        company: exp.company || exp.Company || exp.company_name || exp['Company Name'] || '',
        position: exp.role || exp.Role || exp.position || exp.Position || exp.title || exp.Title || exp['Job Title'] || '',
        startDate: exp.startDate || exp.start_date || exp.Start_Date || exp['Start Date'] || '',
        endDate: exp.endDate || exp.end_date || exp.End_Date || exp['End Date'] || '',
        description: exp.description || exp.Description || exp.responsibilities || exp.Responsibilities || exp.achievements || exp.Achievements || '',
        location: exp.location || exp.Location || exp['Location'] || ''
      })),
      education: (Array.isArray(geminiData.education) ? geminiData.education : []).map(edu => ({
        id: Date.now().toString() + Math.random(),
        institution: edu.institution || edu.Institution || edu.school || edu.School || edu.university || edu.University || edu['Institution Name'] || '',
        degree: edu.degree || edu.Degree || edu.qualification || edu.Qualification || edu['Degree Name'] || '',
        year: edu.year || edu.graduationYear || edu.endDate || edu.end_date || edu.End_Date || edu['End Date'] || '',
        description: edu.description || edu.Description || edu.details || edu.Details || '',
        grade: edu.grade || edu.Grade || edu['Grade'] || '',
        location: edu.location || edu.Location || edu['Location'] || ''
      })),
      skills: geminiData.skills || [],
      languages: (Array.isArray(geminiData.languages) ? geminiData.languages : []).map(lang => ({
        name: lang.name || lang.Name || lang.language || lang.Language || '',
        proficiency: lang.proficiency || lang.Proficiency || lang.level || lang.Level || ''
      })),
      activities: (Array.isArray(geminiData.activities) ? geminiData.activities : []).map((activity: any) => ({
        id: Date.now().toString() + Math.random(),
        title: activity.title || activity.Title || activity.name || activity.Name || '',
        description: activity.description || activity.Description || activity.details || activity.Details || ''
      })),
      projects: (Array.isArray(geminiData.projects) ? geminiData.projects : []).map((project: any) => ({
        id: Date.now().toString() + Math.random(),
        name: project.name || project.Name || project.title || project.Title || project['Project Name'] || '',
        techStack: project.techStack || project.tech_stack || project.Tech_Stack || project['Tech Stack'] || project.technologies || project.Technologies || '',
        startDate: project.startDate || project.start_date || project.Start_Date || project['Start Date'] || '',
        endDate: project.endDate || project.end_date || project.End_Date || project['End Date'] || '',
        description: project.description || project.Description || project.details || project.Details || project.summary || project.Summary || '',
        link: project.link || project.Link || project.url || project.URL || project.website || project.Website || ''
      })),
      certifications: (Array.isArray(geminiData.certifications) ? geminiData.certifications : []).map((cert: any) => ({
        id: Date.now().toString() + Math.random(),
        certificateName: cert.certificateName || cert.certificate_name || cert.Certificate_Name || cert['Certificate Name'] || cert.name || cert.Name || '',
        link: cert.link || cert.Link || cert.url || cert.URL || cert.website || cert.Website || '',
        issueDate: cert.issueDate || cert.startDate || cert.start_date || cert.Start_Date || cert['Start Date'] || cert['Issue Date'] || '',
        instituteName: cert.instituteName || cert.institute_name || cert.Institute_Name || cert['Institute Name'] || cert.institution || cert.Institution || cert.provider || cert.Provider || ''
      })),
      references: (Array.isArray(geminiData.references) ? geminiData.references : []).map((ref: any) => ({
        id: Date.now().toString() + Math.random(),
        name: ref.name || ref.Name || ref.fullName || ref.full_name || ref.Full_Name || ref['Full Name'] || '',
        title: ref.title || ref.Title || ref.jobTitle || ref.job_title || ref.Job_Title || ref['Job Title'] || ref.position || ref.Position || '',
        company: ref.company || ref.Company || ref.employer || ref.Employer || ref.organization || ref.Organization || '',
        phone: ref.phone || ref.Phone || ref.telephone || ref.Telephone || ref.contact || ref.Contact || '',
        email: ref.email || ref.Email || ref.contactEmail || ref.contact_email || ref.Contact_Email || ref['Contact Email'] || '',
        relationship: ref.relationship || ref.Relationship || ref.relation || ref.Relation || ref.connection || ref.Connection || ''
      }))
    };
    
    const convertedData = {
      basicDetails: {
        fullName: basicDetails.fullName || basicDetails.full_name || basicDetails.name || basicDetails.Full_Name || basicDetails['Full Name'] || '',
        professionalTitle: basicDetails.professionalTitle || basicDetails.professional_title || basicDetails.title || basicDetails.Title || basicDetails['Professional Title'] || '',
        phone: basicDetails.phone || basicDetails.Phone || basicDetails['Phone'] || '',
        email: basicDetails.email || basicDetails.Email || basicDetails['Email'] || '',
        location: basicDetails.location || basicDetails.Location || basicDetails['Location'] || basicDetails.address || basicDetails.Address || '',
        website: basicDetails.website || basicDetails.Website || basicDetails['Website'] || '',
        github: basicDetails.github || basicDetails.GitHub || basicDetails['GitHub'] || '',
        linkedin: basicDetails.linkedin || basicDetails.LinkedIn || basicDetails['LinkedIn'] || ''
      },
      summary: geminiData.summary || '',
      objective: '', // Not provided by Gemini parser
      experience: (geminiData.experience || []).map((exp: any) => ({
        id: Date.now().toString() + Math.random(),
        company: exp.company || exp.Company || exp.company_name || exp['Company Name'] || '',
        position: exp.role || exp.Role || exp.position || exp.Position || exp.title || exp.Title || exp['Job Title'] || '',
        startDate: exp.startDate || exp.start_date || exp.Start_Date || exp['Start Date'] || '',
        endDate: exp.endDate || exp.end_date || exp.End_Date || exp['End Date'] || '',
        description: exp.description || exp.Description || exp.responsibilities || exp.Responsibilities || exp.achievements || exp.Achievements || '',
        location: exp.location || exp.Location || exp['Location'] || ''
      })),
      education: (geminiData.education || []).map((edu: any) => ({
        id: Date.now().toString() + Math.random(),
        institution: edu.institution || edu.Institution || edu.school || edu.School || edu.university || edu.University || edu['Institution Name'] || '',
        degree: edu.degree || edu.Degree || edu.qualification || edu.Qualification || edu['Degree Name'] || '',
        year: edu.year || edu.graduationYear || edu.endDate || edu.end_date || edu.End_Date || edu['End Date'] || '',
        description: edu.description || edu.Description || edu.details || edu.Details || '',
        grade: edu.grade || edu.Grade || edu['Grade'] || '',
        location: edu.location || edu.Location || edu['Location'] || ''
      })),
      skills: geminiData.skills || geminiData.Skills || geminiData.technical_skills || geminiData['Technical Skills'] || [],
      languages: (geminiData.languages || []).map((lang: any) => ({
        name: lang.name || lang.Name || lang.language || lang.Language || '',
        proficiency: lang.proficiency || lang.Proficiency || lang.level || lang.Level || ''
      })),
      activities: (geminiData.activities || []).map((activity: any) => ({
        id: Date.now().toString() + Math.random(),
        title: activity.title || activity.Title || activity.name || activity.Name || '',
        description: activity.description || activity.Description || activity.details || activity.Details || ''
      })),
      projects: (Array.isArray(geminiData.projects) ? geminiData.projects : []).map((project: any) => ({
        id: Date.now().toString() + Math.random(),
        name: project.name || project.Name || project.title || project.Title || project['Project Name'] || '',
        techStack: project.techStack || project.tech_stack || project.Tech_Stack || project['Tech Stack'] || project.technologies || project.Technologies || '',
        startDate: project.startDate || project.start_date || project.Start_Date || project['Start Date'] || '',
        endDate: project.endDate || project.end_date || project.End_Date || project['End Date'] || '',
        description: project.description || project.Description || project.details || project.Details || project.summary || project.Summary || '',
        link: project.link || project.Link || project.url || project.URL || project.website || project.Website || ''
      })),
      certifications: (Array.isArray(geminiData.certifications) ? geminiData.certifications : []).map((cert: any) => ({
        id: Date.now().toString() + Math.random(),
        certificateName: cert.certificateName || cert.certificate_name || cert.Certificate_Name || cert['Certificate Name'] || cert.name || cert.Name || '',
        link: cert.link || cert.Link || cert.url || cert.URL || cert.website || cert.Website || '',
        issueDate: cert.issueDate || cert.startDate || cert.start_date || cert.Start_Date || cert['Start Date'] || cert['Issue Date'] || '',
        instituteName: cert.instituteName || cert.institute_name || cert.Institute_Name || cert['Institute Name'] || cert.institution || cert.Institution || cert.provider || cert.Provider || ''
      })),
      references: (Array.isArray(geminiData.references) ? geminiData.references : []).map((ref: any) => ({
        id: Date.now().toString() + Math.random(),
        name: ref.name || ref.Name || ref.fullName || ref.full_name || ref.Full_Name || ref['Full Name'] || '',
        title: ref.title || ref.Title || ref.jobTitle || ref.job_title || ref.Job_Title || ref['Job Title'] || ref.position || ref.Position || '',
        company: ref.company || ref.Company || ref.employer || ref.Employer || ref.organization || ref.Organization || '',
        phone: ref.phone || ref.Phone || ref.telephone || ref.Telephone || ref.contact || ref.Contact || '',
        email: ref.email || ref.Email || ref.contactEmail || ref.contact_email || ref.Contact_Email || ref['Contact Email'] || '',
        relationship: ref.relationship || ref.Relationship || ref.relation || ref.Relation || ref.connection || ref.Connection || ''
      }))
    };
    
    console.log('Final converted data for ResumeBuilderPage:', convertedData);
    return convertedData;
  }

  // AI Suggestions: Get comprehensive AI-powered resume suggestions
  async getAISuggestions(file: File, sector: string, country: string, designation: string): Promise<AIProcessingResult> {
    try {
      // Validate inputs
      if (!file || !sector.trim() || !country.trim() || !designation.trim()) {
        throw new Error('All parameters (file, sector, country, designation) are required');
      }

      // Validate file
      if (file.size > 16 * 1024 * 1024) {
        throw new Error('File size exceeds 16MB limit');
      }

      const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
      const allowedExtensions = ['.pdf', '.docx', '.txt'];
      const fileName = file.name.toLowerCase();
      
      if (!allowedTypes.includes(file.type) && !allowedExtensions.some(ext => fileName.endsWith(ext))) {
        throw new Error('Unsupported file type. Please use PDF, DOCX, or TXT files.');
      }

      const formData = new FormData();
      formData.append('resume', file);
      formData.append('sector', sector);
      formData.append('country', country);
      formData.append('designation', designation);

      console.log('Requesting AI suggestions for:', { fileName: file.name, sector, country, designation });

      const response = await fetch(`${this.baseUrl}/ai/suggestions`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      
      if (!result || typeof result !== 'object') {
        throw new Error('Invalid response format from server');
      }
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to get AI suggestions');
      }

      if (!result.data) {
        throw new Error('No data received from server');
      }

      console.log('AI suggestions generated successfully:', result.data);
      return result.data;
    } catch (error) {
      console.error('Error getting AI suggestions:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch')) {
          throw new Error('Cannot connect to AI service. Please ensure the backend is running on port 5000.');
        } else if (error.message.includes('Server error: 500')) {
          throw new Error('AI processing failed. Please check your API key and try again.');
        } else {
          throw error;
        }
      }
      
      throw new Error('An unexpected error occurred during AI processing');
    }
  }

  // Standard ATS Analysis
  async getStandardATSAnalysis(file: File): Promise<any> {
    try {
      if (!file) {
        throw new Error('No file provided');
      }

      if (file.size > 16 * 1024 * 1024) {
        throw new Error('File size exceeds 16MB limit');
      }

      const formData = new FormData();
      formData.append('resume', file);

      console.log('Requesting standard ATS analysis for:', file.name);

      const response = await fetch(`${this.baseUrl}/ats/standard`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to get ATS analysis');
      }

      console.log('Standard ATS analysis completed:', result.data);
      return result.data;
    } catch (error) {
      console.error('Error getting standard ATS analysis:', error);
      throw error;
    }
  }

  // JD-Specific ATS Analysis
  async getJDSpecificATSAnalysis(file: File, jobDescription: string): Promise<any> {
    try {
      if (!file || !jobDescription.trim()) {
        throw new Error('Both file and job description are required');
      }

      if (file.size > 16 * 1024 * 1024) {
        throw new Error('File size exceeds 16MB limit');
      }

      const formData = new FormData();
      formData.append('resume', file);
      formData.append('job_description', jobDescription);

      console.log('Requesting JD-specific ATS analysis for:', file.name);

      const response = await fetch(`${this.baseUrl}/ats/jd-specific`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to get JD-specific ATS analysis');
      }

      console.log('JD-specific ATS analysis completed:', result.data);
      return result.data;
    } catch (error) {
      console.error('Error getting JD-specific ATS analysis:', error);
      throw error;
    }
  }

  // Check if the backend is available
  async checkBackendHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      return response.ok;
    } catch (error) {
      console.error('Backend health check failed:', error);
      return false;
    }
  }
}

export const geminiParserService = new GeminiParserService();
export default geminiParserService;
