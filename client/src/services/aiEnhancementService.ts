import { API_URL } from '@/lib/apiConfig';

export interface EnhancementRequest {
  content: string;
  prompt: string;
  type: 'experience' | 'project';
  title: string;
}

export interface EnhancementResponse {
  success: boolean;
  enhanced_content?: string;
  original_content?: string;
  enhancement_prompt?: string;
  error?: string;
}

class AIEnhancementService {
  private baseUrl: string;

  constructor() {
    // Use Node.js server URL
    this.baseUrl = API_URL;
  }

  /**
   * Enhance content using AI based on user prompt
   */
  async enhanceContent(request: EnhancementRequest): Promise<EnhancementResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/ai/enhance-content`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data: EnhancementResponse = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Enhancement failed');
      }

      return data;
    } catch (error) {
      console.error('AI Enhancement Service Error:', error);
      throw error;
    }
  }

  /**
   * Test the connection to the AI enhancement service
   */
  async testConnection(): Promise<boolean> {
    try {
      // Test Node.js server connection
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      return data.status === 'healthy';
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }
}

export const aiEnhancementService = new AIEnhancementService();
