const API_BASE_URL = 'http://localhost:5000/api';

export interface Template {
  id: string;
  name: string;
  category: string;
  description: string;
  image: string;
  rating: number;
  downloads: number;
  isPopular?: boolean;
  isNew?: boolean;
  features: string[];
  colors: string[];
  formats: string[];
  filePath?: string;
  previewPath?: string;
  cssPath?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  count?: number;
  message?: string;
  error?: string;
}

class TemplateService {
  private async makeRequest<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    try {
      const url = `${API_BASE_URL}${endpoint}`;
      console.log('🌐 Making API request to:', url);
      
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', response.headers);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('📦 Response data:', data);
      return data;
    } catch (error) {
      console.error('❌ API request failed:', error);
      throw error;
    }
  }

  // Get all templates
  async getAllTemplates(): Promise<Template[]> {
    const response = await this.makeRequest<Template[]>('/templates');
    return response.data;
  }

  // Get template by ID
  async getTemplateById(id: string): Promise<Template> {
    const response = await this.makeRequest<Template>(`/templates/${id}`);
    return response.data;
  }

  // Get templates by category
  async getTemplatesByCategory(category: string): Promise<Template[]> {
    const response = await this.makeRequest<Template[]>(`/templates/category/${category}`);
    return response.data;
  }

  // Search templates
  async searchTemplates(query: string): Promise<Template[]> {
    const response = await this.makeRequest<Template[]>(`/templates/search/${encodeURIComponent(query)}`);
    return response.data;
  }

  // Get popular templates
  async getPopularTemplates(): Promise<Template[]> {
    const response = await this.makeRequest<Template[]>('/templates/popular');
    return response.data;
  }

  // Get new templates
  async getNewTemplates(): Promise<Template[]> {
    const response = await this.makeRequest<Template[]>('/templates/new');
    return response.data;
  }

  // Download template
  async downloadTemplate(id: string, token?: string): Promise<{ downloadUrl: string; templateName: string }> {
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await this.makeRequest<{ downloadUrl: string; templateName: string }>(
      `/templates/${id}/download`,
      { headers }
    );
    return response.data;
  }

  // Get template preview
  async getTemplatePreview(id: string): Promise<{ previewUrl: string; cssUrl: string }> {
    const response = await this.makeRequest<{ previewUrl: string; cssUrl: string }>(
      `/templates/${id}/preview`
    );
    return response.data;
  }

  // Get template CSS
  async getTemplateCSS(cssPath: string): Promise<string> {
    try {
      const response = await fetch(`${API_BASE_URL}/templates/css/${encodeURIComponent(cssPath)}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.text();
    } catch (error) {
      console.error('Failed to fetch template CSS:', error);
      throw error;
    }
  }

  // Get template preview image
  async getTemplatePreviewImage(previewPath: string): Promise<string> {
    try {
      const response = await fetch(`${API_BASE_URL}/templates/preview/${encodeURIComponent(previewPath)}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const blob = await response.blob();
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error('Failed to fetch template preview:', error);
      throw error;
    }
  }
}

export const templateService = new TemplateService(); 