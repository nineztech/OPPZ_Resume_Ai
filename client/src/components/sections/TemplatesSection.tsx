import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, Download } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { tokenUtils } from '@/lib/utils';
import LoginPromptModal from '@/components/modals/LoginPromptModal';
import TemplatePreviewModal from '@/components/modals/TemplatePreviewModal';
import { templates as templateData } from '@/data/templates';
import TemplateRenderer from '@/components/templates/TemplateRenderer';
import type { Template } from '@/data/templates';

const TemplatesSection = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const user = tokenUtils.getUser();

  const templates = templateData.slice(0, 6); // Show first 6 templates

  const handlePreviewTemplate = (template: Template) => {
    setSelectedTemplate(template);
    setIsModalOpen(true);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6
      }
    }
  };

  return (
    <section id="templates" className="py-16 sm:py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          className="text-center mb-12 sm:mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">
            Pick a{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              CV template
            </span>
          </h2>
          <p className="text-sm sm:text-base text-gray-600 max-w-3xl mx-auto px-4">
            Choose from our professionally designed templates that are optimized for ATS systems
          </p>
        </motion.div>

        {/* Templates Grid */}
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
        >
          {templates.map((template, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              className="group relative"
            >
                             <div className="group relative bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full">
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
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!user) {
                            setShowLoginPrompt(true);
                          } else {
                            handlePreviewTemplate(template);
                          }
                        }}
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
                     onClick={(e) => {
                       e.stopPropagation();
                       if (!user) {
                         setShowLoginPrompt(true);
                       } else {
                         navigate('/resume/templates');
                       }
                     }}
                   >
                     Use Template
                   </Button>
                 </div>
               </div>
            </motion.div>
          ))}
        </motion.div>

        {/* View More Button */}
        <motion.div
          className="text-center mt-8 sm:mt-12"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <Link to="/resume/templates">
            <Button 
              variant="outline"
              size="lg"
              className="border-2 border-gray-300 hover:border-blue-600 text-gray-700 px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-semibold"
            >
              View more templates
            </Button>
          </Link>
        </motion.div>
      </div>
      
             {/* Login Prompt Modal */}
       <LoginPromptModal
         isOpen={showLoginPrompt}
         onClose={() => setShowLoginPrompt(false)}
       />
       
       {/* Template Preview Modal */}
       <TemplatePreviewModal
         template={selectedTemplate}
         isOpen={isModalOpen}
         onClose={() => setIsModalOpen(false)}
         onDownload={(templateId, selectedColor) => {
           const template = templateData.find(t => t.id === templateId);
           if (template) {
             console.log('Download template:', template.name);
             // Handle download logic here
           }
         }}
         onUseTemplate={(templateId, selectedColor) => {
           navigate('/resume/templates');
         }}
       />
     </section>
  );
};

export default TemplatesSection; 