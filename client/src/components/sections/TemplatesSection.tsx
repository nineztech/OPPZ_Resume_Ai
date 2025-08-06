import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, Download } from 'lucide-react';
    import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { tokenUtils } from '@/lib/utils';
import LoginPromptModal from '@/components/modals/LoginPromptModal';

const TemplatesSection = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const navigate = useNavigate();
  const user = tokenUtils.getUser();

  const templates = [
    {
      name: "Professional Classic",
      category: "Business",
      image: "/api/placeholder/400/500",
      description: "Clean and traditional design perfect for corporate roles",
      popular: true
    },
    {
      name: "Modern Creative",
      category: "Design",
      image: "/api/placeholder/400/500",
      description: "Bold and innovative layout for creative professionals",
      popular: false
    },
    {
      name: "Minimalist",
      category: "Tech",
      image: "/api/placeholder/400/500",
      description: "Simple and clean design for tech and startup roles",
      popular: true
    },
    {
      name: "Executive",
      category: "Leadership",
      image: "/api/placeholder/400/500",
      description: "Sophisticated design for senior management positions",
      popular: false
    },
    {
      name: "Creative Portfolio",
      category: "Creative",
      image: "/api/placeholder/400/500",
      description: "Showcase your work with this portfolio-style template",
      popular: false
    },
    {
      name: "Academic",
      category: "Education",
      image: "/api/placeholder/400/500",
      description: "Perfect for academic and research positions",
      popular: false
    }
  ];

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
              <Card className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 h-full">
                {/* Template Image */}
                <div className="relative h-48 sm:h-64 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <div className="w-24 h-32 sm:w-32 sm:h-40 bg-white rounded-lg shadow-md transform rotate-3">
                    <div className="p-3 sm:p-4 space-y-1 sm:space-y-2">
                      <div className="h-2 sm:h-3 bg-gray-200 rounded"></div>
                      <div className="h-2 sm:h-3 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-2 sm:h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                  
                  {/* Popular Badge */}
                  {template.popular && (
                    <div className="absolute top-3 sm:top-4 left-3 sm:left-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold">
                      Popular
                    </div>
                  )}

                  {/* Category Badge */}
                  <div className="absolute top-3 sm:top-4 right-3 sm:right-4 bg-white/90 backdrop-blur-sm text-gray-700 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
                    {template.category}
                  </div>

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 px-4">
                      <Button 
                        size="sm" 
                        className="bg-white text-gray-900 hover:bg-gray-100 text-xs sm:text-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!user) {
                            setShowLoginPrompt(true);
                          } else {
                            // Handle preview logic here
                            console.log('Preview template:', template.name);
                          }
                        }}
                      >
                        <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                        Preview
                      </Button>
                      <Button 
                        size="sm" 
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-xs sm:text-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!user) {
                            setShowLoginPrompt(true);
                          } else {
                            navigate('/resume/templates');
                          }
                        }}
                      >
                        <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                        Use Template
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Template Info */}
                <CardContent className="p-4 sm:p-6">
                  <CardTitle className="text-base sm:text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                    {template.name}
                  </CardTitle>
                  <CardDescription className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                    {template.description}
                  </CardDescription>
                </CardContent>
              </Card>
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
    </section>
  );
};

export default TemplatesSection; 