// ATS Service for connecting with Gemini Resume Parser API
// Provides functionality similar to Resume Worded's "Score My Resume" feature

export interface FeedbackSection {
  score: number;
  title: string;
  description: string;
  positives: string[];
  negatives: string[];
  suggestions: string[];
}

export interface ATSAnalysisResult {
  overall_score: number;
  category_scores: {
    formatting_readability: number;
    keyword_coverage_general: number;
    section_completeness: number;
    achievements_metrics: number;
    spelling_grammar: number;
    parse_accuracy: number;
  };
  detailed_feedback: {
    formatting_readability: FeedbackSection;
    keyword_coverage_general: FeedbackSection;
    section_completeness: FeedbackSection;
    achievements_metrics: FeedbackSection;
    spelling_grammar: FeedbackSection;
    parse_accuracy: FeedbackSection;
  };
  extracted_text: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}

export interface JDSpecificATSResult {
  overall_score: number;
  match_percentage: number;
  missing_keywords: string[];
  category_scores: {
    keyword_match_skills: number;
    experience_relevance: number;
    education_certifications: number;
    achievements_impact: number;
    formatting_structure: number;
    soft_skills_match: number;
  };
  detailed_feedback: {
    keyword_match_skills: FeedbackSection;
    experience_relevance: FeedbackSection;
    education_certifications: FeedbackSection;
    achievements_impact: FeedbackSection;
    formatting_structure: FeedbackSection;
    soft_skills_match: FeedbackSection;
  };
  extracted_text: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}

export interface ATSResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

class ATSService {
  private baseUrl: string;

  constructor(baseUrl: string = `${process.env.PYTHON_URL}`) {
    this.baseUrl = baseUrl;
  }

  /**
   * Analyze resume using standard ATS criteria (similar to Resume Worded)
   * @param file - Resume file (PDF, DOCX, or TXT)
   * @returns Promise with ATS analysis results
   */
  async analyzeResumeStandard(file: File): Promise<ATSResponse<ATSAnalysisResult>> {
    try {
      const formData = new FormData();
      formData.append('resume', file);

      const response = await fetch(`${this.baseUrl}/ats/standard`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Standard ATS analysis failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Analyze resume against specific job description
   * @param file - Resume file (PDF, DOCX, or TXT)
   * @param jobDescription - Job description text to match against
   * @returns Promise with job-specific ATS analysis results
   */
  async analyzeResumeForJob(file: File, jobDescription: string): Promise<ATSResponse<JDSpecificATSResult>> {
    try {
      const formData = new FormData();
      formData.append('resume', file);
      formData.append('job_description', jobDescription);

      const response = await fetch(`${this.baseUrl}/ats/jd-specific`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Job-specific ATS analysis failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Analyze resume against job description file
   * @param resumeFile - Resume file (PDF, DOCX, or TXT)
   * @param jobDescriptionFile - Job description file (PDF, DOCX, or TXT)
   * @returns Promise with job-specific ATS analysis results
   */
  async analyzeResumeForJobFile(resumeFile: File, jobDescriptionFile: File): Promise<ATSResponse<JDSpecificATSResult>> {
    try {
      const formData = new FormData();
      formData.append('resume', resumeFile);
      formData.append('job_description_file', jobDescriptionFile);

      const response = await fetch(`${this.baseUrl}/ats/jd-specific`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Job-specific ATS analysis with file failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Parse resume using Gemini API
   * @param file - Resume file (PDF, DOCX, or TXT)
   * @returns Promise with parsed resume data
   */
  async parseResume(file: File): Promise<ATSResponse<any>> {
    try {
      const formData = new FormData();
      formData.append('resume', file);

      const response = await fetch(`${this.baseUrl}/parse`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Resume parsing failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Check if the ATS service is healthy and available
   * @returns Promise with health status
   */
  async checkHealth(): Promise<ATSResponse<any>> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return {
        success: true,
        data: result
      };
    } catch (error) {
      console.error('Health check failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'ATS service unavailable'
      };
    }
  }

  /**
   * Apply ATS suggestions to improve resume
   * @param parsedResumeData - The structured resume data from parsing
   * @param atsAnalysis - The ATS analysis results with suggestions
   * @returns Promise with improved resume data
   */
  async applyATSSuggestions(parsedResumeData: any, atsAnalysis: ATSAnalysisResult | JDSpecificATSResult): Promise<ATSResponse<any>> {
    try {
      const response = await fetch(`${this.baseUrl}/improve-resume`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          parsed_resume_data: parsedResumeData,
          ats_analysis: atsAnalysis
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Resume improvement failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Get score interpretation based on score value
   * @param score - Score from 0-100
   * @returns Object with score interpretation
   */
  getScoreInterpretation(score: number): {
    level: 'Poor' | 'Fair' | 'Good' | 'Excellent';
    color: string;
    message: string;
  } {
    if (score >= 80) {
      return {
        level: 'Excellent',
        color: 'text-green-600',
        message: 'Your resume is well-optimized for ATS systems!'
      };
    } else if (score >= 65) {
      return {
        level: 'Good',
        color: 'text-blue-600',
        message: 'Your resume is good, but there\'s room for improvement.'
      };
    } else if (score >= 45) {
      return {
        level: 'Fair',
        color: 'text-yellow-600',
        message: 'Your resume needs significant improvements for better ATS compatibility.'
      };
    } else {
      return {
        level: 'Poor',
        color: 'text-red-600',
        message: 'Your resume requires major improvements to pass ATS systems.'
      };
    }
  }

  /**
   * Format category names for display
   * @param categoryKey - Category key from API response
   * @returns Formatted display name
   */
  formatCategoryName(categoryKey: string): string {
    const categoryMap: { [key: string]: string } = {
      formatting_readability: 'Formatting & Readability',
      keyword_coverage_general: 'Keyword Coverage',
      section_completeness: 'Section Completeness',
      achievements_metrics: 'Achievements & Metrics',
      spelling_grammar: 'Spelling & Grammar',
      parse_accuracy: 'Parse Accuracy',
      keyword_match_skills: 'Keyword Match & Skills',
      experience_relevance: 'Experience Relevance',
      education_certifications: 'Education & Certifications',
      achievements_impact: 'Achievements & Impact',
      formatting_structure: 'Formatting & Structure',
      soft_skills_match: 'Soft Skills Match'
    };

    return categoryMap[categoryKey] || categoryKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }
}

export const atsService = new ATSService();
export default atsService;
