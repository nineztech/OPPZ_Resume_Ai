import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Download, Eye, Heart, Share2, ArrowLeft, ArrowRight, X } from 'lucide-react';

interface Template {
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

interface TemplatePreviewModalProps {
  template: Template | null;
  isOpen: boolean;
  onClose: () => void;
  onDownload: (templateId: string) => void;
}

const TemplatePreviewModal = ({ template, isOpen, onClose, onDownload }: TemplatePreviewModalProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const images = template?.image ? [
    `http://localhost:5000/${template.image}`,
    `http://localhost:5000/${template.image}`,
    `http://localhost:5000/${template.image}`,
  ] : [
    '/api/placeholder/600/800',
    '/api/placeholder/600/800',
    '/api/placeholder/600/800',
  ];

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

  // Early return after all hooks
  if (!template || !isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold">{template.name}</h2>
            <p className="text-lg text-gray-600 mt-1">{template.description}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Template Preview */}
            <div className="space-y-4">
              <div className="relative">
                <div className="aspect-[3/4] bg-gray-200 rounded-lg overflow-hidden">
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
                      <div className="w-32 h-40 bg-white rounded shadow-sm mx-auto mb-4"></div>
                      <p className="text-lg text-gray-600">{template.name}</p>
                      <p className="text-sm text-gray-500 mt-2">Template Preview</p>
                    </div>
                  </div>
                </div>
                
                {/* Navigation arrows */}
                <button
                  onClick={() => setCurrentImageIndex(Math.max(0, currentImageIndex - 1))}
                  disabled={currentImageIndex === 0}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 disabled:opacity-50"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCurrentImageIndex(Math.min(images.length - 1, currentImageIndex + 1))}
                  disabled={currentImageIndex === images.length - 1}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 disabled:opacity-50"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Image indicators */}
              <div className="flex justify-center space-x-2">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-2 h-2 rounded-full ${
                      index === currentImageIndex ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Template Details */}
            <div className="space-y-6">
              {/* Stats */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="font-medium">{template.rating}</span>
                  </div>
                  <span className="text-gray-500">{template.downloads} downloads</span>
                </div>
                <div className="flex gap-2">
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

              {/* Features */}
              <div>
                <h3 className="font-semibold text-lg mb-3">Features</h3>
                <div className="grid grid-cols-2 gap-2">
                  {template.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      <span className="text-sm text-gray-600">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Color Options */}
              <div>
                <h3 className="font-semibold text-lg mb-3">Color Options</h3>
                <div className="flex gap-2">
                  {template.colors.map((color, index) => (
                    <div
                      key={index}
                      className="w-8 h-8 rounded-full border-2 border-gray-200 cursor-pointer"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Format Options */}
              <div>
                <h3 className="font-semibold text-lg mb-3">Available Formats</h3>
                <div className="flex gap-2">
                  {template.formats.map((format, index) => (
                    <Badge key={index} variant="outline">
                      {format}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button 
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  onClick={() => onDownload(template.id)}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Template
                </Button>
                
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1">
                    <Heart className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Share2 className="w-4 h-4 mr-2" />
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