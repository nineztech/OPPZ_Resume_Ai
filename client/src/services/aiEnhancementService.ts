import { API_URL } from '@/lib/apiConfig';

// Types for the enhancement service
export interface EnhancementRequest {
  content: string;
  prompt: string;
  type: 'experience' | 'project';
}

export interface EnhancementResponse {
  success: boolean;
  data?: {
    enhanced_content: string;
    original_content: string;
    type: string;
    prompt_used: string;
  };
  error?: string;
  message?: string;
}

// Enhancement suggestions based on content type
export const getEnhancementSuggestions = (type: 'experience' | 'project'): string[] => {
  if (type === 'experience') {
    return [
      'Add more technical details and quantify achievements',
      'Make it more results-oriented with metrics',
      'Focus on leadership and team management aspects',
      'Highlight problem-solving and innovation',
      'Emphasize collaboration and communication skills',
      'Add industry-specific keywords and terminology'
    ];
  } else {
    return [
      'Add more technical implementation details',
      'Include specific technologies and frameworks used',
      'Highlight challenges overcome and solutions implemented',
      'Quantify project impact and results',
      'Add more about the development process',
      'Include performance optimizations and best practices'
    ];
  }
};

// Validate enhancement prompt
export const validateEnhancementPrompt = (prompt: string): { isValid: boolean; error?: string } => {
  if (!prompt || !prompt.trim()) {
    return { isValid: false, error: 'Enhancement prompt is required' };
  }
  
  if (prompt.trim().length < 10) {
    return { isValid: false, error: 'Enhancement prompt must be at least 10 characters long' };
  }
  
  if (prompt.length > 500) {
    return { isValid: false, error: 'Enhancement prompt must be less than 500 characters' };
  }
  
  return { isValid: true };
};

// Format content for display (handle line breaks and formatting)
export const formatContentForDisplay = (content: string): string => {
  if (!content) return '';
  
  // Replace \n with actual line breaks for display
  return content.replace(/\\n/g, '\n').trim();
};

// Main function to enhance content with AI
export const enhanceContentWithAI = async (
  content: string,
  prompt: string,
  type: 'experience' | 'project'
): Promise<EnhancementResponse> => {
  try {
    // Validate inputs
    if (!content || !content.trim()) {
      return {
        success: false,
        error: 'Content cannot be empty'
      };
    }

    if (!prompt || !prompt.trim()) {
      return {
        success: false,
        error: 'Enhancement prompt cannot be empty'
      };
    }

    if (!type || !['experience', 'project'].includes(type)) {
      return {
        success: false,
        error: 'Type must be either "experience" or "project"'
      };
    }

    // Prepare request data
    const requestData: EnhancementRequest = {
      content: content.trim(),
      prompt: prompt.trim(),
      type
    };

    console.log('Sending enhancement request:', { type, promptLength: prompt.length });

    // Make API request
    const response = await fetch(`${API_URL}/ai/enhance-content`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });

    // Check if response is ok
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    // Parse response
    const result: EnhancementResponse = await response.json();
    
    console.log('Enhancement response:', { success: result.success, hasData: !!result.data });

    // Validate response structure
    if (!result.success) {
      return {
        success: false,
        error: result.error || result.message || 'Enhancement failed'
      };
    }

    if (!result.data || !result.data.enhanced_content) {
      return {
        success: false,
        error: 'Invalid response: enhanced content not found'
      };
    }

    return result;

  } catch (error) {
    console.error('Enhancement service error:', error);
    
    // Handle different types of errors
    if (error instanceof Error) {
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        return {
          success: false,
          error: 'Network error. Please check your connection and try again.'
        };
      }
      
      return {
        success: false,
        error: error.message
      };
    }
    
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.'
    };
  }
};

// Utility function to check if enhancement is available
export const isEnhancementAvailable = (): boolean => {
  // Check if API URL is configured
  return !!API_URL;
};

// Utility function to get enhancement statistics
export const getEnhancementStats = (originalContent: string, enhancedContent: string) => {
  const originalWords = originalContent.split(/\s+/).length;
  const enhancedWords = enhancedContent.split(/\s+/).length;
  const originalLines = originalContent.split('\n').filter(line => line.trim()).length;
  const enhancedLines = enhancedContent.split('\n').filter(line => line.trim()).length;
  
  return {
    wordCount: {
      original: originalWords,
      enhanced: enhancedWords,
      difference: enhancedWords - originalWords
    },
    lineCount: {
      original: originalLines,
      enhanced: enhancedLines,
      difference: enhancedLines - originalLines
    },
    improvementRatio: originalWords > 0 ? ((enhancedWords - originalWords) / originalWords * 100).toFixed(1) : '0'
  };
};

export default {
  enhanceContentWithAI,
  getEnhancementSuggestions,
  validateEnhancementPrompt,
  formatContentForDisplay,
  isEnhancementAvailable,
  getEnhancementStats
};
