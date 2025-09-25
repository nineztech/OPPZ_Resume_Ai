export interface EnhanceContentRequest {
  content: string;
  prompt: string;
  type: 'experience' | 'project';
}

export interface EnhanceContentResponse {
  success: boolean;
  data?: {
    enhanced_content: string;
    original_content: string;
    type: string;
    prompt_used: string;
  };
  message?: string;
  error?: string;
}

class AIEnhancementService {
  private baseUrl: string;

  constructor() {
    // Use the Python service backend URL (same as geminiParserService)
    this.baseUrl = `${import.meta.env.PYTHON_URL}`;
  }

  /**
   * Enhance content using AI based on user prompt
   */
  async enhanceContentWithAI(
    content: string,
    prompt: string,
    type: 'experience' | 'project'
  ): Promise<EnhanceContentResponse> {
    try {
      // Validate input
      if (!content || !content.trim()) {
        throw new Error('Content cannot be empty');
      }

      if (!prompt || !prompt.trim()) {
        throw new Error('Enhancement prompt cannot be empty');
      }

      if (!['experience', 'project'].includes(type)) {
        throw new Error('Type must be either "experience" or "project"');
      }

      const response = await fetch(`${this.baseUrl}/enhance-content`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content_type: type,
        content_data: {
          description: content.trim()
        },
        enhancement_prompt: prompt.trim()
      }),
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
      throw new Error(result.error || 'Failed to enhance content');
    }

    console.log('Content enhancement completed successfully:', result.data);
    return result;
  } catch (error) {
    console.error('AI enhancement error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('Failed to fetch')) {
        throw new Error('Cannot connect to enhancement service. Please ensure the backend is running on port 5000.');
      } else if (error.message.includes('Server error: 500')) {
        throw new Error('Content enhancement failed. Please check your API key and try again.');
      } else {
        throw error;
      }
    }
    
    throw new Error('An unexpected error occurred during content enhancement');
  }
  }

  /**
   * Get enhancement suggestions for common prompts
   */
  getEnhancementSuggestions(type: 'experience' | 'project'): string[] {
    if (type === 'experience') {
      return [
        'Add more metrics and quantifiable achievements',
        'Make it more action-oriented with strong verbs',
        'Emphasize leadership and team collaboration',
        'Focus on business impact and results',
        'Include relevant technologies and tools',
        'Highlight problem-solving abilities',
        'Make it more concise and impactful'
      ];
    } else {
      return [
        'Add more technical details and technologies used',
        'Emphasize problem-solving and innovation',
        'Include project outcomes and impact',
        'Highlight technical challenges overcome',
        'Add metrics about performance or scale',
        'Focus on your specific contributions',
        'Make it more technical and detailed'
      ];
    }
  }

  /**
   * Validate enhancement prompt
   */
  validateEnhancementPrompt(prompt: string): { isValid: boolean; error?: string } {
    if (!prompt || !prompt.trim()) {
      return { isValid: false, error: 'Prompt cannot be empty' };
    }

    if (prompt.trim().length < 5) {
      return { isValid: false, error: 'Prompt must be at least 5 characters long' };
    }

    if (prompt.trim().length > 500) {
      return { isValid: false, error: 'Prompt must be less than 500 characters' };
    }

    return { isValid: true };
  }

  /**
   * Format content for display
   */
  formatContentForDisplay(content: string): string {
    if (!content) return '';
    
    // Clean up common formatting issues
    return content
      .trim()
      .replace(/\n{3,}/g, '\n\n') // Replace multiple newlines with double newlines
      .replace(/^\s+/gm, '') // Remove leading whitespace from lines
      .replace(/\s+$/gm, ''); // Remove trailing whitespace from lines
  }

  /**
   * Check if the backend is available
   */
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

// Export singleton instance and individual functions for backward compatibility
export const aiEnhancementService = new AIEnhancementService();

// Export individual functions for backward compatibility
export const enhanceContentWithAI = (content: string, prompt: string, type: 'experience' | 'project') =>
  aiEnhancementService.enhanceContentWithAI(content, prompt, type);

export const getEnhancementSuggestions = (type: 'experience' | 'project') =>
  aiEnhancementService.getEnhancementSuggestions(type);

export const validateEnhancementPrompt = (prompt: string) =>
  aiEnhancementService.validateEnhancementPrompt(prompt);

export const formatContentForDisplay = (content: string) =>
  aiEnhancementService.formatContentForDisplay(content);

export default aiEnhancementService;
