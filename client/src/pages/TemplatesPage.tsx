import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Filter, Star, Download, Eye, FileText } from 'lucide-react';
import TemplatePreviewModal from '@/components/modals/TemplatePreviewModal';
import TemplateRenderer from '@/components/templates/TemplateRenderer';
import { templates as templateData, getTemplateById } from '@/data/templates';
import type { Template } from '@/data/templates';

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

  const handleDownloadTemplate = (templateId: string, selectedColor?: string) => {
    console.log('Downloading template:', templateId, 'with color:', selectedColor);
    // In a real implementation, you would handle the download with the selected color
    // For now, we'll just log the action
    alert(`Downloading template ${templateId} with color ${selectedColor || 'default'}`);
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
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-white border-b">
          <div className="container mx-auto px-4 py-12">
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
          <div className="container mx-auto px-4 py-6">
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
        <section className="container mx-auto px-4 py-12">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {filteredTemplates.map((template) => (
                <Card key={template.id} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-md">
                  <div className="relative">
                    {/* Template Preview Container */}
                    <div className="aspect-[3/2] bg-gradient-to-br from-gray-50 to-gray-100 rounded-t-lg overflow-hidden border-b">
                      <div className="w-full h-full bg-white p-1 sm:p-2 lg:p-3 overflow-hidden">
                        {/* Resume Preview with smaller scaling for better visibility */}
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="w-full h-full transform scale-75 origin-center">
                            <TemplateRenderer 
                              templateId={template.id} 
                              data={template.templateData} 
                              color={template.colors[0]}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Badges */}
                    <div className="absolute top-2 sm:top-3 left-2 sm:left-3 flex gap-1 sm:gap-2">
                      {template.isPopular && (
                        <Badge variant="secondary" className="bg-orange-500 text-white text-xs font-medium px-2 py-1">
                          Popular
                        </Badge>
                      )}
                      {template.isNew && (
                        <Badge variant="secondary" className="bg-green-500 text-white text-xs font-medium px-2 py-1">
                          New
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <CardHeader className="pb-3 sm:pb-4 pt-4 sm:pt-6">
                    <CardTitle className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">{template.name}</CardTitle>
                    <CardDescription className="text-sm text-gray-600 leading-relaxed">
                      {template.description}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    {/* Rating and Downloads */}
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm font-semibold text-gray-700">{template.rating}</span>
                      </div>
                      <span className="text-sm text-gray-500 font-medium">{template.downloads} downloads</span>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      {/* Use Template Button - Primary Action */}
                      <Button 
                        size="sm"
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs sm:text-sm"
                        onClick={() => handleUseTemplate(template.id, template.colors[0])}
                      >
                        <FileText className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                        Use
                      </Button>
                      
                      {/* Secondary Actions */}
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="border-gray-300 hover:bg-gray-50 text-xs sm:text-sm"
                        onClick={() => handlePreviewTemplate(template)}
                      >
                        <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="border-gray-300 hover:bg-gray-50 text-xs sm:text-sm"
                        onClick={() => handleDownloadTemplate(template.id)}
                      >
                        <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
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
          <div className="container mx-auto px-4 py-16 text-center">
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
      </main>
      
      {/* Template Preview Modal */}
      <TemplatePreviewModal
        template={selectedTemplate}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onDownload={handleDownloadTemplate}
        onUseTemplate={handleUseTemplate}
      />
      
      <Footer />
    </>
  );
};

export default TemplatesPage; 