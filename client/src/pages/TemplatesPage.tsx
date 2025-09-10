import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Filter, Star, Download, Eye, FileText } from 'lucide-react';
import TemplatePreviewModal from '@/components/modals/TemplatePreviewModal';
import TemplateRenderer from '@/components/templates/TemplateRenderer';
import { templates as templateData, getTemplateById } from '@/data/templates';
import type { Template } from '@/data/templates';
import { generatePDF, downloadPDF } from '@/services/pdfService';
import { createRoot } from 'react-dom/client';

const TemplatesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const categories = [
    { id: 'all', name: 'All Templates' },
    { id: 'Professional', name: 'Professional' },
    { id: 'Minimal', name: 'Minimal' },
    { id: 'Creative', name: 'Creative' },
    { id: 'Traditional', name: 'Traditional' },
  ];

  // Load templates from frontend data
  useEffect(() => {
    setLoading(true);
    try {
      setTemplates(templateData);
      setError(null);
    } catch (err) {
      setError('Failed to load templates. Please try again later.');
      console.error('Error loading templates:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handlePreviewTemplate = (template: Template) => {
    setSelectedTemplate(template);
    setIsModalOpen(true);
  };

    const generateResumePreview = async (template: Template, selectedColor?: string) => {
    try {
      // Create a temporary div to render the template
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '0';
      tempDiv.style.width = '800px';
      tempDiv.style.backgroundColor = 'white';
      tempDiv.style.padding = '40px';
      document.body.appendChild(tempDiv);

      // Use the template data directly from the template object
      const templateDataObj = template.templateData;
      
      // Create the template renderer
      const root = createRoot(tempDiv);
      root.render(
        <TemplateRenderer
          templateId={template.id}
          data={templateDataObj}
          color={selectedColor || template.colors[0]}
        />
      );

      // Wait for rendering
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Get the HTML content
      const htmlContent = tempDiv.innerHTML;

      // Clean up
      document.body.removeChild(tempDiv);

      // Generate PDF using the service
      const blob = await generatePDF({
        htmlContent,
        templateId: template.id,
        resumeData: templateDataObj
      });

      // Download the PDF
      const filename = `${template.name.replace(/\s+/g, '_')}_Template.pdf`;
      downloadPDF(blob, filename);

    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  const handleUseTemplate = (templateId: string, selectedColor?: string) => {
    console.log('Using template:', templateId, 'with color:', selectedColor);
    // Navigate to use-template page with template and color parameters
    const template = templateData.find(t => t.id === templateId);
    const defaultColor = template?.colors[0] || '';
    const params = new URLSearchParams({
      templateId,
      color: selectedColor || defaultColor
    });
    window.location.href = `/resume/templates/use-template?${params.toString()}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-white border-b">
        <div className="container mx-auto px-6 py-16">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Resume Templates
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Choose from hundreds of professional resume templates designed to help you stand out
            </p>
            
            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <Input
                  placeholder="Search templates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter size={16} />
                Filter
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="bg-white border-b">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className="rounded-full"
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Templates Grid */}
      <section className="container mx-auto px-6 py-16">
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading templates...</p>
          </div>
        )}
        
        {error && (
          <div className="text-center py-12">
            <p className="text-red-600 text-lg mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        )}
        
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {filteredTemplates.map((template) => (
              <div key={template.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-300">
                {/* Template Preview */}
                <div className="relative bg-gradient-to-b from-gray-50 to-white p-6 group">
                  {/* Badges */}
                  <div className="absolute top-4 left-4 flex gap-2 z-10">
                    {template.isPopular && (
                      <Badge className="bg-orange-100 text-orange-700 text-xs font-medium px-2 py-1 rounded-md border-0">
                        Popular
                      </Badge>
                    )}
                    {template.isNew && (
                      <Badge className="bg-green-100 text-green-700 text-xs font-medium px-2 py-1 rounded-md border-0">
                        New
                      </Badge>
                    )}
                  </div>

                  {/* Hover Preview Button */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-20">
                    <Button 
                      onClick={() => handlePreviewTemplate(template)}
                      className="bg-white text-gray-900 hover:bg-gray-100 font-medium px-6 py-3 rounded-lg shadow-lg"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Preview
                    </Button>
                  </div>

                  {/* Resume Preview - Fixed styling */}
                  <div className="aspect-[3/4] bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden flex items-center justify-center">
                    <div 
                      className="transform origin-center" 
                      style={{ 
                        transform: 'scale(0.4)',
                        width: '250%', 
                        height: '250%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <div style={{ width: '210mm', height: '297mm' }}>
                        <TemplateRenderer 
                          templateId={template.id} 
                          color={template.colors[0]}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Template Info */}
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {template.name}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed mb-6">
                    {template.description}
                  </p>

                  {/* Use Template Button */}
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg"
                    onClick={() => handleUseTemplate(template.id, template.colors[0])}
                  >
                    Use Template
                  </Button>
                </div>
              </div>
            ))}
            
            {filteredTemplates.length === 0 && (
              <div className="text-center py-12 col-span-full">
                <p className="text-gray-500 text-lg">No templates found matching your criteria.</p>
              </div>
            )}
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 text-white">
        <div className="container mx-auto px-6 py-20 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Create Your Resume?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Choose a template and start building your professional resume today
          </p>
          <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
            Get Started Now
          </Button>
        </div>
      </section>
    
      {/* Template Preview Modal */}
      <TemplatePreviewModal
        template={selectedTemplate}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onDownload={(templateId, selectedColor) => {
          const template = templateData.find(t => t.id === templateId);
          if (template) {
            generateResumePreview(template, selectedColor);
          }
        }}
        onUseTemplate={handleUseTemplate}
      />
    </div>
  );
};

export default TemplatesPage;