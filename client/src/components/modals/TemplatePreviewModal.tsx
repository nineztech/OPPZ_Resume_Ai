import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Download, Eye, Heart, Share2, X, Palette } from 'lucide-react';
import { templates, getTemplateById, type Template } from '@/data/templates';
import TemplateRenderer from '@/components/templates/TemplateRenderer';

interface TemplatePreviewModalProps {
  template: Template | null;
  isOpen: boolean;
  onClose: () => void;
  onDownload: (templateId: string, selectedColor?: string) => void;
  onUseTemplate?: (templateId: string, selectedColor?: string) => void;
}

const TemplatePreviewModal = ({ template, isOpen, onClose, onDownload, onUseTemplate }: TemplatePreviewModalProps) => {
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedFormat, setSelectedFormat] = useState<string>('PDF');

  // Set initial selected color when template changes
  useEffect(() => {
    if (template && template.colors.length > 0) {
      setSelectedColor(template.colors[0]);
    }
  }, [template]);

  // Set initial selected format when template changes
  useEffect(() => {
    if (template && template.formats.length > 0) {
      setSelectedFormat('PDF'); // Default to PDF
    }
  }, [template]);

  // Update preview when color changes
  useEffect(() => {
    if (template && selectedColor) {
      // For frontend templates, the preview updates automatically with color changes
      console.log('Template color changed to:', selectedColor);
    }
  }, [template, selectedColor]);

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
  };

  const handleDownload = async () => {
    try {
      // For frontend templates, we'll simulate download
      console.log('Downloading template:', template!.id, 'with color:', selectedColor, 'format:', selectedFormat);
      
      // Call the parent handler for any additional actions
      onDownload(template!.id, selectedColor);
    } catch (error) {
      console.error('Error downloading template:', error);
      alert('Failed to download template. Please try again.');
    }
  };

  const handleUseTemplate = () => {
    if (onUseTemplate) {
      onUseTemplate(template!.id, selectedColor);
    }
    // Navigate to use-template page with template and color parameters
    const params = new URLSearchParams({
      templateId: template!.id,
      color: selectedColor
    });
    window.location.href = `/resume/templates/use-template?${params.toString()}`;
  };

  // Early return after all hooks
  if (!template || !isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content - Size increased by 10% */}
      <div className="relative bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[85vh] overflow-hidden font-sans">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50/50">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 tracking-tight">{template.name}</h2>
            <p className="text-sm text-gray-600 mt-0.5 font-normal">{template.description}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto max-h-[calc(85vh-80px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Template Preview - Improved UI */}
            <div className="space-y-3">
              <div className="relative">
                <div className="aspect-[210/297] bg-gradient-to-b from-gray-50 to-gray-100 rounded-lg overflow-hidden shadow-sm border border-gray-200">
                  {template && (
                    <div className="w-full h-full bg-white relative">
                      {/* Professional document frame */}
                      <div className="absolute inset-2 bg-white rounded shadow-inner border border-gray-100 overflow-hidden">
                        <div className="w-full h-full p-3 overflow-y-auto overflow-x-hidden scrollbar-hide">
                          <div className="transform scale-[0.65] origin-top-left" style={{ width: '153.8%', height: '153.8%' }}>
                            <TemplateRenderer 
                              templateId={template.id} 
                              color={selectedColor}
                            />
                          </div>
                        </div>
                      </div>
                      
                      {/* Subtle page shadow effect */}
                      <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
                        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
                        <div className="absolute top-0 bottom-0 left-0 w-px bg-gradient-to-b from-transparent via-gray-200 to-transparent"></div>
                        <div className="absolute top-0 bottom-0 right-0 w-px bg-gradient-to-b from-transparent via-gray-200 to-transparent"></div>
                      </div>
                    </div>
                  )}
                </div>
                

                
                {/* Page indicator */}
                <div className="absolute top-3 right-3 bg-white/90 text-gray-600 text-xs px-2 py-1 rounded-md backdrop-blur-sm font-medium border border-gray-200">
                  Page 1 of 1
                </div>
              </div>
            </div>

            {/* Template Details - 50% */}
            <div className="space-y-4">
              {/* Stats */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-amber-400 fill-current" />
                    <span className="font-medium text-sm">{template.rating}</span>
                  </div>
                  <span className="text-gray-500 text-sm">{template.downloads} downloads</span>
                </div>
                <div className="flex gap-1.5">
                  {template.isPopular && (
                    <Badge variant="secondary" className="bg-orange-50 text-orange-700 text-xs px-2 py-0.5 font-medium">
                      Popular
                    </Badge>
                  )}
                  {template.isNew && (
                    <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 text-xs px-2 py-0.5 font-medium">
                      New
                    </Badge>
                  )}
                </div>
              </div>

              {/* Features */}
              <div>
                <h3 className="font-semibold text-base mb-2 text-gray-900">Features</h3>
                <div className="grid grid-cols-2 gap-1.5">
                  {template.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-600 rounded-full flex-shrink-0"></div>
                      <span className="text-sm text-gray-600 font-normal">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Color Options - Compact */}
              <div>
                <h3 className="font-semibold text-base mb-2 flex items-center gap-2 text-gray-900">
                  <Palette className="w-4 h-4" />
                  Colors
                </h3>
                <div className="flex gap-1.5 flex-wrap">
                  {template.colors.map((color, index) => (
                    <button
                      key={index}
                      onClick={() => handleColorSelect(color)}
                      className={`w-6 h-6 rounded-full border cursor-pointer transition-all hover:scale-110 ${
                        selectedColor === color 
                          ? 'border-gray-800 ring-2 ring-blue-500 ring-offset-1' 
                          : 'border-gray-200 hover:border-gray-400'
                      }`}
                      style={{ backgroundColor: color }}
                      title={`Select ${color}`}
                    />
                  ))}
                </div>
                {selectedColor && (
                  <p className="text-xs text-gray-500 mt-1.5">
                    Selected: <span className="font-medium text-gray-700">{selectedColor}</span>
                  </p>
                )}
              </div>

              {/* Format Options - Compact */}
              <div>
                <h3 className="font-semibold text-base mb-2 text-gray-900">Format</h3>
                <div className="flex gap-1.5 flex-wrap">
                  {template.formats.map((format, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedFormat(format)}
                      className={`px-3 py-1 rounded-md text-xs font-medium cursor-pointer transition-all ${
                        selectedFormat === format 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {format}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons - Compact */}
              <div className="space-y-2 pt-2">
                <div className="flex gap-2">
                  <Button 
                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-sm font-medium h-9"
                    onClick={handleDownload}
                  >
                    <Download className="w-4 h-4 mr-1.5" />
                    Download
                  </Button>
                  {onUseTemplate && (
                    <Button 
                      variant="outline"
                      className="flex-1 text-sm font-medium h-9 border-gray-300"
                      onClick={handleUseTemplate}
                    >
                      <Eye className="w-4 h-4 mr-1.5" />
                      Use Template
                    </Button>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1 text-sm font-medium h-8 border-gray-200 text-gray-600">
                    <Heart className="w-3.5 h-3.5 mr-1.5" />
                    Save
                  </Button>
                  <Button variant="outline" className="flex-1 text-sm font-medium h-8 border-gray-200 text-gray-600">
                    <Share2 className="w-3.5 h-3.5 mr-1.5" />
                    Share
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplatePreviewModal;