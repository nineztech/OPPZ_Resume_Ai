import { API_URL } from '@/lib/apiConfig';

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

/**
 * Enhance content using AI based on user prompt
 */
export const enhanceContentWithAI = async (
  content: string,
  prompt: string,
  type: 'experience' | 'project'
): Promise<EnhanceContentResponse> => {
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

    const response = await fetch(`${API_URL}/ai/enhance-content`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: content.trim(),
        prompt: prompt.trim(),
        type
      }),
    });

    const raw = await response.json();

    if (!response.ok) {
      throw new Error(raw.message || raw.error || 'Failed to enhance content');
    }

    // Normalize response to match web_ui.py shape
    // web_ui.py returns: { success, data: { enhanced_content, original_content, type, prompt_used }, timestamp }
    // Python CLI (enhance_content.py) returns: { success, enhanced_content, original_content, type, prompt_used }
    const normalized: EnhanceContentResponse = (() => {
      if (raw && typeof raw === 'object') {
        if (raw.data && typeof raw.data === 'object' && (raw.data.enhanced_content || raw.data.original_content)) {
          return {
            success: Boolean(raw.success !== false),
            data: {
              enhanced_content: raw.data.enhanced_content,
              original_content: raw.data.original_content,
              type: raw.data.type,
              prompt_used: raw.data.prompt_used
            },
            message: raw.message,
            error: raw.error
          };
        }
        if (raw.enhanced_content || raw.original_content) {
          return {
            success: Boolean(raw.success !== false),
            data: {
              enhanced_content: raw.enhanced_content,
              original_content: raw.original_content,
              type: raw.type,
              prompt_used: raw.prompt_used
            },
            message: raw.message,
            error: raw.error
          };
        }
      }
      return raw as EnhanceContentResponse;
    })();

    return normalized;
  } catch (error) {
    console.error('AI enhancement error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      message: 'Failed to enhance content with AI'
    };
  }
};

/**
 * Get enhancement suggestions for common prompts
 */
export const getEnhancementSuggestions = (type: 'experience' | 'project'): string[] => {
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
};

/**
 * Validate enhancement prompt
 */
export const validateEnhancementPrompt = (prompt: string): { isValid: boolean; error?: string } => {
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
};

/**
 * Format content for display
 */
export const formatContentForDisplay = (content: string): string => {
  if (!content) return '';
  
  // Clean up common formatting issues
  return content
    .trim()
    .replace(/\n{3,}/g, '\n\n') // Replace multiple newlines with double newlines
    .replace(/^\s+/gm, '') // Remove leading whitespace from lines
    .replace(/\s+$/gm, ''); // Remove trailing whitespace from lines
};
