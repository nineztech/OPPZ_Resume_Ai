import path from 'path';
import fs from 'fs';

// Sample template data - in production, this would come from a database
export const templates = [
  {
    id: '1',
    name: 'Modern Professional',
    category: 'modern',
    description: 'Clean and contemporary design perfect for corporate roles',
    rating: 4.8,
    downloads: 1250,
    isPopular: true,
    features: ['ATS Friendly', 'Customizable Colors', 'Professional Layout', 'Print Ready'],
    colors: ['#2563eb', '#7c3aed', '#059669', '#dc2626'],
    formats: ['PDF', 'DOCX', 'HTML'],
    filePath: 'templates/modern/professional-blue.json',
    previewPath: 'templates/assets/previews/professional-blue.png',
    cssPath: 'templates/assets/styles/professional-blue.css'
  },
  {
    id: '2',
    name: 'Creative Portfolio',
    category: 'creative',
    description: 'Bold and artistic template for creative professionals',
    rating: 4.6,
    downloads: 890,
    isNew: true,
    features: ['Creative Design', 'Portfolio Section', 'Color Customization', 'Modern Typography'],
    colors: ['#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4'],
    formats: ['PDF', 'DOCX', 'HTML'],
    filePath: 'templates/creative/portfolio-orange.json',
    previewPath: 'templates/assets/previews/portfolio-orange.png',
    cssPath: 'templates/assets/styles/portfolio-orange.css'
  },
  {
    id: '3',
    name: 'Classic Traditional',
    category: 'traditional',
    description: 'Timeless design that works for any industry',
    rating: 4.7,
    downloads: 2100,
    features: ['Traditional Layout', 'Clean Typography', 'Professional Appearance', 'Widely Accepted'],
    colors: ['#374151', '#6b7280', '#9ca3af', '#d1d5db'],
    formats: ['PDF', 'DOCX'],
    filePath: 'templates/traditional/classic-black.json',
    previewPath: 'templates/assets/previews/classic-black.png',
    cssPath: 'templates/assets/styles/classic-black.css'
  },
  {
    id: '4',
    name: 'Minimal Clean',
    category: 'minimal',
    description: 'Simple and elegant template focusing on content',
    rating: 4.5,
    downloads: 750,
    features: ['Minimal Design', 'Clean Layout', 'Focus on Content', 'Easy to Read'],
    colors: ['#000000', '#374151', '#6b7280', '#9ca3af'],
    formats: ['PDF', 'DOCX'],
    filePath: 'templates/minimal/clean-white.json',
    previewPath: 'templates/assets/previews/clean-white.png',
    cssPath: 'templates/assets/styles/clean-white.css'
  },
  {
    id: '5',
    name: 'Executive Suite',
    category: 'professional',
    description: 'Premium template for senior-level positions',
    rating: 4.9,
    downloads: 1800,
    isPopular: true,
    features: ['Executive Design', 'Leadership Focus', 'Premium Layout', 'Industry Standard'],
    colors: ['#1e40af', '#7c2d12', '#374151', '#6b7280'],
    formats: ['PDF', 'DOCX', 'HTML'],
    filePath: 'templates/professional/executive-blue.json',
    previewPath: 'templates/assets/previews/executive-blue.png',
    cssPath: 'templates/assets/styles/executive-blue.css'
  },
  {
    id: '6',
    name: 'Tech Savvy',
    category: 'modern',
    description: 'Perfect for IT and technology professionals',
    rating: 4.4,
    downloads: 650,
    features: ['Tech Focused', 'Skills Section', 'Project Showcase', 'Modern Design'],
    colors: ['#059669', '#0ea5e9', '#7c3aed', '#dc2626'],
    formats: ['PDF', 'DOCX', 'HTML'],
    filePath: 'templates/modern/tech-green.json',
    previewPath: 'templates/assets/previews/tech-green.png',
    cssPath: 'templates/assets/styles/tech-green.css'
  },
  {
    id: '7',
    name: 'Simple Elegant',
    category: 'simple',
    description: 'Clean lines and professional appearance',
    rating: 4.6,
    downloads: 920,
    features: ['Elegant Design', 'Clean Lines', 'Professional Look', 'Easy Customization'],
    colors: ['#374151', '#6b7280', '#9ca3af', '#d1d5db'],
    formats: ['PDF', 'DOCX'],
    filePath: 'templates/simple/elegant-gray.json',
    previewPath: 'templates/assets/previews/elegant-gray.png',
    cssPath: 'templates/assets/styles/elegant-gray.css'
  },
  {
    id: '8',
    name: 'Creative Designer',
    category: 'creative',
    description: 'Showcase your creativity with this artistic template',
    rating: 4.3,
    downloads: 580,
    features: ['Artistic Design', 'Creative Layout', 'Visual Appeal', 'Portfolio Ready'],
    colors: ['#ec4899', '#f59e0b', '#8b5cf6', '#06b6d4'],
    formats: ['PDF', 'DOCX', 'HTML'],
    filePath: 'templates/creative/designer-pink.json',
    previewPath: 'templates/assets/previews/designer-pink.png',
    cssPath: 'templates/assets/styles/designer-pink.css'
  }
];

// Get all templates
export const getAllTemplates = async (req, res) => {
  try {
    console.log('📋 getAllTemplates called');
    console.log('📊 Templates count:', templates.length);
    
    // Map previewPath to image for frontend compatibility
    const templatesWithImage = templates.map(template => ({
      ...template,
      image: template.previewPath || '/api/placeholder/600/800'
    }));
    
    res.json({
      success: true,
      data: templatesWithImage,
      count: templatesWithImage.length
    });
  } catch (error) {
    console.error('❌ Error in getAllTemplates:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching templates',
      error: error.message
    });
  }
};

// Get template by ID
export const getTemplateById = async (req, res) => {
  try {
    const { id } = req.params;
    const template = templates.find(t => t.id === id);
    
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }

    // Map previewPath to image for frontend compatibility
    const templateWithImage = {
      ...template,
      image: template.previewPath || '/api/placeholder/600/800'
    };

    res.json({
      success: true,
      data: templateWithImage
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching template',
      error: error.message
    });
  }
};

// Get templates by category
export const getTemplatesByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const filteredTemplates = templates.filter(t => t.category === category);
    
    // Map previewPath to image for frontend compatibility
    const templatesWithImage = filteredTemplates.map(template => ({
      ...template,
      image: template.previewPath || '/api/placeholder/600/800'
    }));
    
    res.json({
      success: true,
      data: templatesWithImage,
      count: templatesWithImage.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching templates by category',
      error: error.message
    });
  }
};

// Search templates
export const searchTemplates = async (req, res) => {
  try {
    const { query } = req.params;
    const searchTerm = query.toLowerCase();
    
    const filteredTemplates = templates.filter(template => 
      template.name.toLowerCase().includes(searchTerm) ||
      template.description.toLowerCase().includes(searchTerm) ||
      template.category.toLowerCase().includes(searchTerm)
    );
    
    // Map previewPath to image for frontend compatibility
    const templatesWithImage = filteredTemplates.map(template => ({
      ...template,
      image: template.previewPath || '/api/placeholder/600/800'
    }));
    
    res.json({
      success: true,
      data: templatesWithImage,
      count: templatesWithImage.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error searching templates',
      error: error.message
    });
  }
};

// Download template
export const downloadTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const template = templates.find(t => t.id === id);
    
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }

    // In a real implementation, you would:
    // 1. Check if user has permission to download
    // 2. Generate the template file
    // 3. Stream the file to the client
    
    // For now, we'll return the template data
    res.json({
      success: true,
      message: 'Template download initiated',
      data: {
        templateId: id,
        templateName: template.name,
        downloadUrl: `/api/templates/${id}/file`
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error downloading template',
      error: error.message
    });
  }
};

// Get template preview
export const getTemplatePreview = async (req, res) => {
  try {
    const { id } = req.params;
    const template = templates.find(t => t.id === id);
    
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }

    // Generate preview image on-demand
    const { generateTemplatePreview } = await import('../utils/templateRenderer.js');
    const previewPath = `templates/assets/previews/${template.id}.png`;
    
    await generateTemplatePreview(template, previewPath);
    
    res.json({
      success: true,
      data: {
        templateId: id,
        previewUrl: previewPath,
        cssUrl: template.cssPath
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching template preview',
      error: error.message
    });
  }
};

// Get popular templates
export const getPopularTemplates = async (req, res) => {
  try {
    const popularTemplates = templates.filter(t => t.isPopular);
    
    // Map previewPath to image for frontend compatibility
    const templatesWithImage = popularTemplates.map(template => ({
      ...template,
      image: template.previewPath || '/api/placeholder/600/800'
    }));
    
    res.json({
      success: true,
      data: templatesWithImage,
      count: templatesWithImage.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching popular templates',
      error: error.message
    });
  }
};

// Get new templates
export const getNewTemplates = async (req, res) => {
  try {
    const newTemplates = templates.filter(t => t.isNew);
    
    // Map previewPath to image for frontend compatibility
    const templatesWithImage = newTemplates.map(template => ({
      ...template,
      image: template.previewPath || '/api/placeholder/600/800'
    }));
    
    res.json({
      success: true,
      data: templatesWithImage,
      count: templatesWithImage.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching new templates',
      error: error.message
    });
  }
};

