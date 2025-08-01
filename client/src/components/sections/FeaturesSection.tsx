import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { 
  FileText, 
  Palette, 
  Lightbulb, 
  Shield, 
  TrendingUp, 
  Users 
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const FeaturesSection = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const features = [
    {
      icon: FileText,
      title: "Expert Content Library",
      description: "Choose from thousands of top-rated phrases for your CV. Click to insert them directly. Use the star rating system to indicate your skill level.",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: Palette,
      title: "CV & Cover Letter Combo",
      description: "Create a brand for yourself with a matching CV and cover letter. You can count on expert suggestions and professional cover letter templates.",
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: Shield,
      title: "ATS-Optimized Templates",
      description: "Our expert-designed templates are ready to pass applicant tracking systems (ATS) used by companies to scan CVs.",
      color: "from-green-500 to-green-600"
    },
    {
      icon: Lightbulb,
      title: "Expert Tips & Guidance",
      description: "Detailed CV-building tips and advice every step of the way. CV pro or beginner—we've got you covered.",
      color: "from-orange-500 to-orange-600"
    },
    {
      icon: TrendingUp,
      title: "Apply with Confidence",
      description: "From a quick polish to a full makeover, our CV tools are here to help you shine in every application.",
      color: "from-red-500 to-red-600"
    },
    {
      icon: Users,
      title: "Professional Community",
      description: "Join thousands of professionals who trust our platform to advance their careers with standout CVs.",
      color: "from-indigo-500 to-indigo-600"
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut" as const
      }
    }
  };

  return (
    <section id="features" className="py-12 sm:py-16 lg:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          className="text-center mb-12 sm:mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-4 sm:mb-6 px-4">
            Enhance your CV with our{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              expert features
            </span>
          </h2>
          <p className="text-sm sm:text-base text-gray-600 max-w-3xl mx-auto px-4">
            Everything you need to create a professional CV that stands out from the crowd
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              className="group relative"
            >
              <Card className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-blue-200 overflow-hidden h-full">
                <CardHeader className="pb-4 p-4 sm:p-6">
                  {/* Icon */}
                  <div className={`w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                  </div>
                  <CardTitle className="text-base sm:text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 p-4 sm:p-6">
                  <CardDescription className="text-gray-600 leading-relaxed text-sm">
                    {feature.description}
                  </CardDescription>
                </CardContent>
                {/* Hover Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          className="text-center mt-12 sm:mt-16"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-3xl p-6 sm:p-8 lg:p-12 mx-4">
                            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-4">
              Ready to create your professional CV?
            </h3>
                          <p className="text-xs sm:text-sm lg:text-base text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
              Join thousands of professionals who have already created standout CVs with our platform
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center px-4">
              <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-sm sm:text-base transition-all duration-300 transform hover:scale-105">
                Start Creating Now
              </button>
              <button className="border-2 border-gray-300 hover:border-blue-600 text-gray-700 px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-sm sm:text-base transition-all duration-300">
                View Templates
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection; 