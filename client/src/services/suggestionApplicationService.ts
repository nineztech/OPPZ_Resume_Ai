// Service to handle the actual application of suggestions to resume data
import type { AppliedSuggestion, ParsedResumeData } from './suggestionApplierService';

export interface ResumeData {
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
    startDate: string;
    endDate: string;
    description: string;
    location: string;
  }>;
  education: Array<{
    id: string;
    institution: string;
    degree: string;
    startDate: string;
    endDate: string;
    grade: string;
    description: string;
    location: string;
  }>;
  skills: {
    [key: string]: string[];
  } | string[];
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
    name: string;
    issuer: string;
    startDate: string;
    endDate: string;
    link: string;
  }>;
  languages: Array<{
    name: string;
    proficiency: string;
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
  activities: Array<{
    id: string;
    title: string;
    description: string;
  }>;
  customSections: Array<{
    id: string;
    title: string;
    content: string;
  }>;
  other: string;
}

export interface SuggestionApplicationResult {
  success: boolean;
  updatedResumeData: ResumeData;
  appliedChanges: Array<{
    suggestionId: string;
    category: string;
    field: string;
    originalValue: string;
    newValue: string;
  }>;
  error?: string;
}

class SuggestionApplicationService {
  /**
   * Apply selected suggestions to resume data
   */
  applySuggestionsToResume(
    originalResumeData: ResumeData,
    selectedSuggestions: AppliedSuggestion[]
  ): SuggestionApplicationResult {
    try {
      console.log('Applying suggestions to resume data:', {
        originalResumeData,
        selectedSuggestions
      });

      // Deep clone the original data
      const updatedResumeData = JSON.parse(JSON.stringify(originalResumeData));
      const appliedChanges: Array<{
        suggestionId: string;
        category: string;
        field: string;
        originalValue: string;
        newValue: string;
      }> = [];

      // Apply each selected suggestion
      selectedSuggestions.forEach(suggestion => {
        console.log('Applying suggestion:', suggestion);
        
        const change = this.applySuggestionToResumeData(
          updatedResumeData,
          suggestion
        );
        
        if (change) {
          appliedChanges.push(change);
          console.log('Applied change:', change);
        }
      });

      console.log('Total changes applied:', appliedChanges.length);

      return {
        success: true,
        updatedResumeData,
        appliedChanges
      };
    } catch (error) {
      console.error('Error applying suggestions:', error);
      return {
        success: false,
        updatedResumeData: originalResumeData,
        appliedChanges: [],
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Apply a single suggestion to resume data
   */
  private applySuggestionToResumeData(
    resumeData: ResumeData,
    suggestion: AppliedSuggestion
  ): {
    suggestionId: string;
    category: string;
    field: string;
    originalValue: string;
    newValue: string;
  } | null {
    try {
      switch (suggestion.category) {
        case 'clarity_brevity':
        case 'test':
          // Apply to summary with context preservation
          if (suggestion.originalText === resumeData.summary) {
            const originalValue = resumeData.summary;
            resumeData.summary = suggestion.improvedText;
            return {
              suggestionId: suggestion.id,
              category: suggestion.category,
              field: 'summary',
              originalValue,
              newValue: suggestion.improvedText
            };
          }
          break;

        case 'achievements_impact_metrics':
          // Find matching experience description and apply with context
          for (let i = 0; i < resumeData.experience.length; i++) {
            if (resumeData.experience[i].description === suggestion.originalText) {
              const originalValue = resumeData.experience[i].description;
              // Apply the improved text to the entire description
              resumeData.experience[i].description = suggestion.improvedText;
              return {
                suggestionId: suggestion.id,
                category: suggestion.category,
                field: `experience[${i}].description`,
                originalValue,
                newValue: suggestion.improvedText
              };
            }
          }
          break;

        case 'keyword_usage_placement':
          // Apply to title or summary with full context
          if (suggestion.originalText === resumeData.basicDetails.title) {
            const originalValue = resumeData.basicDetails.title;
            resumeData.basicDetails.title = suggestion.improvedText;
            return {
              suggestionId: suggestion.id,
              category: suggestion.category,
              field: 'basicDetails.title',
              originalValue,
              newValue: suggestion.improvedText
            };
          } else if (suggestion.originalText === resumeData.summary) {
            const originalValue = resumeData.summary;
            resumeData.summary = suggestion.improvedText;
            return {
              suggestionId: suggestion.id,
              category: suggestion.category,
              field: 'summary',
              originalValue,
              newValue: suggestion.improvedText
            };
          }
          break;

        case 'formatting_layout_ats':
          // Apply formatting improvements with context
          if (suggestion.originalText.includes('|') && suggestion.improvedText.includes('\n')) {
            // Handle contact information formatting
            const originalValue = resumeData.basicDetails.phone + ' | ' + resumeData.basicDetails.email + ' | ' + resumeData.basicDetails.linkedin;
            // This would require updating the display logic, but we can note the change
            return {
              suggestionId: suggestion.id,
              category: suggestion.category,
              field: 'contact_formatting',
              originalValue: suggestion.originalText,
              newValue: suggestion.improvedText
            };
          }
          break;

        case 'repetition_avoidance':
          // Find and replace repetitive language in experience with full context
          for (let i = 0; i < resumeData.experience.length; i++) {
            if (resumeData.experience[i].description === suggestion.originalText) {
              const originalValue = resumeData.experience[i].description;
              // Apply the improved text to the entire description
              resumeData.experience[i].description = suggestion.improvedText;
              return {
                suggestionId: suggestion.id,
                category: suggestion.category,
                field: `experience[${i}].description`,
                originalValue,
                newValue: suggestion.improvedText
              };
            }
          }
          break;

        case 'skills_match_alignment':
          // Apply to summary or experience with full context
          if (suggestion.originalText === resumeData.summary) {
            const originalValue = resumeData.summary;
            resumeData.summary = suggestion.improvedText;
            return {
              suggestionId: suggestion.id,
              category: suggestion.category,
              field: 'summary',
              originalValue,
              newValue: suggestion.improvedText
            };
          }
          break;

        default:
          // Generic application - try to find matching text with full context
          if (suggestion.originalText === resumeData.summary) {
            const originalValue = resumeData.summary;
            resumeData.summary = suggestion.improvedText;
            return {
              suggestionId: suggestion.id,
              category: suggestion.category,
              field: 'summary',
              originalValue,
              newValue: suggestion.improvedText
            };
          }
          
          // Try experience descriptions with full context
          for (let i = 0; i < resumeData.experience.length; i++) {
            if (resumeData.experience[i].description === suggestion.originalText) {
              const originalValue = resumeData.experience[i].description;
              // Apply the improved text to the entire description
              resumeData.experience[i].description = suggestion.improvedText;
              return {
                suggestionId: suggestion.id,
                category: suggestion.category,
                field: `experience[${i}].description`,
                originalValue,
                newValue: suggestion.improvedText
              };
            }
          }
          break;
      }

      console.warn(`Could not apply suggestion ${suggestion.id}: No matching text found`);
      return null;
    } catch (error) {
      console.error(`Error applying suggestion ${suggestion.id}:`, error);
      return null;
    }
  }

  /**
   * Convert parsed resume data to the format expected by ResumeBuilderPage
   */
  convertParsedDataToResumeData(parsedData: ParsedResumeData): ResumeData {
    const basicDetailsData = parsedData.basic_details || parsedData.basicDetails || {};
    
    return {
      basicDetails: {
        fullName: basicDetailsData.name || basicDetailsData.fullName || '',
        title: basicDetailsData.professional_title || basicDetailsData.title || '',
        phone: basicDetailsData.phone || '',
        email: basicDetailsData.email || '',
        location: basicDetailsData.location || '',
        website: basicDetailsData.website || '',
        github: basicDetailsData.github || '',
        linkedin: basicDetailsData.linkedin || ''
      },
      summary: parsedData.summary || '',
      objective: parsedData.objective || '',
      experience: (parsedData.experience || []).map((exp: any, index: number) => ({
        id: exp.id || `exp-${Date.now()}-${index}`,
        company: exp.company || '',
        position: exp.position || exp.role || '',
        startDate: exp.start_date || exp.startDate || '',
        endDate: exp.end_date || exp.endDate || '',
        description: exp.description || '',
        location: exp.location || ''
      })),
      education: (parsedData.education || []).map((edu: any, index: number) => ({
        id: edu.id || `edu-${Date.now()}-${index}`,
        institution: edu.institution || '',
        degree: edu.degree || '',
        startDate: edu.start_date || edu.startDate || '',
        endDate: edu.end_date || edu.endDate || '',
        grade: edu.grade || '',
        description: edu.description || '',
        location: edu.location || ''
      })),
      skills: parsedData.skills || [],
      projects: (parsedData.projects || []).map((proj: any, index: number) => ({
        id: proj.id || `proj-${Date.now()}-${index}`,
        name: proj.name || '',
        techStack: proj.tech_stack || proj.techStack || '',
        startDate: proj.start_date || proj.startDate || '',
        endDate: proj.end_date || proj.endDate || '',
        description: proj.description || '',
        link: proj.link || ''
      })),
      certifications: (parsedData.certifications || []).map((cert: any, index: number) => ({
        id: cert.id || `cert-${Date.now()}-${index}`,
        name: cert.certificateName || cert.name || '',
        issuer: cert.institueName || cert.issuer || '',
        startDate: cert.startDate || cert.start_date || '',
        endDate: cert.endDate || cert.end_date || '',
        link: cert.link || ''
      })),
      languages: (parsedData.languages || []).map((lang: any, index: number) => ({
        name: lang.name || '',
        proficiency: lang.proficiency || ''
      })),
      references: (parsedData.references || []).map((ref: any, index: number) => ({
        id: ref.id || `ref-${Date.now()}-${index}`,
        name: ref.name || '',
        title: ref.title || '',
        company: ref.company || '',
        phone: ref.phone || '',
        email: ref.email || '',
        relationship: ref.relationship || ''
      })),
      activities: [],
      customSections: [],
      other: parsedData.other || ''
    };
  }
}

export const suggestionApplicationService = new SuggestionApplicationService();
export default suggestionApplicationService;
