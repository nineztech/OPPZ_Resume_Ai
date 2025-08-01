import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Filter, Star, Download, Eye } from 'lucide-react';
import TemplatePreviewModal from '@/components/TemplatePreviewModal';
import { templateService } from '@/services/templateService';
import type { Template } from '@/services/templateService';

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
    { id: 'creative', name: 'Creative' },
    { id: 'traditional', name: 'Traditional' },
    { id: 'modern', name: 'Modern' },
    { id: 'simple', name: 'Simple' },
    { id: 'professional', name: 'Professional' },
    { id: 'minimal', name: 'Minimal' },
  ];

  // Fetch templates from API
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setLoading(true);
        const data = await templateService.getAllTemplates();
        setTemplates(data);
        setError(null);
      } catch (err) {
        setError('Failed to load templates. Please try again later.');
        console.error('Error fetching templates:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
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

  const handleDownloadTemplate = (templateId: string) => {
    // Handle template download logic here
    console.log('Downloading template:', templateId);
    setIsModalOpen(false);
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredTemplates.map((template) => (
                <Card key={template.id} className="group hover:shadow-lg transition-shadow duration-300">
                  <div className="relative">
                    <div className="aspect-[3/4] bg-gray-200 rounded-t-lg overflow-hidden">
                      {template.image ? (
                        <img 
                          src={`http://localhost:5000/${template.image}`}
                          alt={template.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Fallback to placeholder if image fails to load
                            e.currentTarget.style.display = 'none';
                            const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                            if (nextElement) {
                              nextElement.style.display = 'flex';
                            }
                          }}
                        />
                      ) : null}
                      <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center" style={{ display: template.image ? 'none' : 'flex' }}>
                        <div className="text-center">
                          <div className="w-16 h-20 bg-white rounded shadow-sm mx-auto mb-2"></div>
                          <p className="text-sm text-gray-600">{template.name}</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Badges */}
                    <div className="absolute top-2 left-2 flex gap-1">
                      {template.isPopular && (
                        <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                          Popular
                        </Badge>
                      )}
                      {template.isNew && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          New
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <CardDescription className="text-sm text-gray-600">
                      {template.description}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm font-medium">{template.rating}</span>
                      </div>
                      <span className="text-sm text-gray-500">{template.downloads} downloads</span>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handlePreviewTemplate(template)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Preview
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleDownloadTemplate(template.id)}
                      >
                        <Download className="w-4 h-4" />
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
      />
      
      <Footer />
    </>
  );
};

export default TemplatesPage; 