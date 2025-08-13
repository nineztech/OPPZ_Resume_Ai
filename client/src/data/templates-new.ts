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
}

export const templates: Template[] = [
  {
    id: 'modern-professional',
    name: 'Modern Professional',
    category: 'Professional',
    description: 'Clean and modern design perfect for corporate roles',
    image: '/src/assets/templates/modern-professional-preview.png',
    rating: 4.8,
    downloads: 1247,
    isPopular: true,
    features: ['Clean Layout', 'Professional Design', 'Easy Customization', 'ATS Friendly'],
    colors: ['#2563eb', '#1e40af', '#1e3a8a', '#1e293b'],
    formats: ['PDF', 'DOCX', 'HTML']
  },
  {
    id: 'clean-minimal',
    name: 'Clean Minimal',
    category: 'Minimal',
    description: 'Simple and elegant design for any industry',
    image: '/src/assets/templates/clean-minimal-preview.png',
    rating: 4.6,
    downloads: 892,
    features: ['Minimal Design', 'Easy to Read', 'Professional', 'Clean Layout'],
    colors: ['#374151', '#6b7280', '#9ca3af', '#d1d5db'],
    formats: ['PDF', 'DOCX', 'HTML']
  },
  {
    id: 'creative-designer',
    name: 'Creative Designer',
    category: 'Creative',
    description: 'Bold and creative design for design professionals',
    image: '/src/assets/templates/creative-designer-preview.png',
    rating: 4.7,
    downloads: 756,
    isNew: true,
    features: ['Creative Layout', 'Bold Design', 'Visual Impact', 'Designer Friendly'],
    colors: ['#ec4899', '#be185d', '#9d174d', '#831843'],
    formats: ['PDF', 'DOCX', 'HTML']
  },
  {
    id: 'executive-classic',
    name: 'Executive Classic',
    category: 'Traditional',
    description: 'Timeless design for executive and senior positions',
    image: '/src/assets/templates/executive-classic-preview.png',
    rating: 4.9,
    downloads: 1103,
    isPopular: true,
    features: ['Executive Style', 'Professional Layout', 'Traditional Design', 'Senior Level'],
    colors: ['#1e293b', '#334155', '#475569', '#64748b'],
    formats: ['PDF', 'DOCX', 'HTML']
  },
  {
    id: 'business-professional',
    name: 'Business Professional',
    category: 'Professional',
    description: 'Clean and modern business design with professional layout',
    image: '/src/assets/templates/business-professional-preview.png',
    rating: 4.7,
    downloads: 856,
    isNew: true,
    features: ['Professional Layout', 'Modern Design', 'Business Focus', 'Clean Typography'],
    colors: ['#1e40af', '#1e3a8a', '#1e293b', '#334155'],
    formats: ['PDF', 'DOCX', 'HTML']
  }
];

export const getTemplateById = (id: string): Template | undefined => {
  return templates.find(template => template.id === id);
};

export const getTemplatesByCategory = (category: string): Template[] => {
  return templates.filter(template => template.category === category);
};
