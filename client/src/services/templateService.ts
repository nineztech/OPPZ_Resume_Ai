import { templates, getTemplateById, getTemplatesByCategory } from '@/data/templates';
import type { Template } from '@/data/templates';

export interface TemplateService {
  getAllTemplates(): Promise<Template[]>;
  getTemplateById(id: string): Promise<Template | undefined>;
  getTemplatesByCategory(category: string): Promise<Template[]>;
  downloadTemplate(templateId: string, color?: string, format?: string): Promise<void>;
  getTemplatePreviewWithColor(templateId: string, color: string): Promise<{ previewUrl: string }>;
      }

class FrontendTemplateService implements TemplateService {
  async getAllTemplates(): Promise<Template[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));
    return templates;
  }

  async getTemplateById(id: string): Promise<Template | undefined> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 50));
    return getTemplateById(id);
  }

  async getTemplatesByCategory(category: string): Promise<Template[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));
    return getTemplatesByCategory(category);
  }

  async downloadTemplate(templateId: string, color?: string, format?: string): Promise<void> {
    // Simulate download process
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log(`Downloading template ${templateId} with color ${color} in format ${format}`);
    
    // In a real implementation, this would trigger a file download
    // For now, we'll just log the action
    alert(`Template ${templateId} download started with color ${color || 'default'} in ${format || 'PDF'} format`);
  }

  async getTemplatePreviewWithColor(templateId: string, color: string): Promise<{ previewUrl: string }> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Return a placeholder preview URL
    return {
      previewUrl: `/api/templates/${templateId}/preview?color=${color}`
    };
  }
}

export const templateService = new FrontendTemplateService(); 