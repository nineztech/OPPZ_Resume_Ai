import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { 
  Zap, 
  Target, 
  Sparkles, 
  Globe, 
  Clock, 
  Award,
  CheckCircle,
  Star,
  ArrowRight,
  Play
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { tokenUtils } from '@/lib/utils';
import LoginPromptModal from '@/components/modals/LoginPromptModal';

const FeaturesPage = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const user = tokenUtils.getUser();

  const mainFeatures = [
    {
      icon: Zap,
      title: "Lightning Fast Creation",
      description: "Build your professional CV in under 5 minutes with our intelligent templates and smart content suggestions.",
      stats: "5 min average",
      color: "from-yellow-400 to-orange-500"
    },
    {
      icon: Target,
      title: "Job-Specific Optimization",
      description: "Our AI analyzes job descriptions and automatically optimizes your CV for each application.",
      stats: "95% match rate",
      color: "from-red-400 to-pink-500"
    },
    {
      icon: Sparkles,
      title: "AI-Powered Content",
      description: "Generate professional descriptions and achievements using advanced AI that understands your industry.",
      stats: "1000+ phrases",
      color: "from-purple-400 to-indigo-500"
    }
  ];

  const benefits = [
    "ATS-friendly templates that pass through applicant tracking systems",
    "Real-time collaboration with professional CV writers",
    "Industry-specific keyword optimization",
    "Mobile-responsive design for all devices",
    "Unlimited revisions and downloads",
    "Professional cover letter matching"
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Marketing Manager",
      company: "TechCorp",
      text: "Got 3 job offers within 2 weeks using OPPZ ResumeAI. The templates are incredible!",
      rating: 5
    },
    {
      name: "Michael Chen",
      role: "Software Engineer",
      company: "InnovateLab",
      text: "The AI suggestions helped me highlight achievements I didn't even think to include.",
      rating: 5
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

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <section className="pt-20 pb-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-blue-100 text-blue-800 text-xs font-medium mb-4">
              <Sparkles className="w-3 h-3 mr-1.5" />
              Powered by Advanced AI
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Transform Your Career with
              <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Smart CV Building
              </span>
            </h1>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto mb-6">
              Experience the future of resume creation with AI-powered tools that understand your industry and optimize for success.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button 
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-300 transform hover:scale-105"
                onClick={() => {
                  if (!user) {
                    setShowLoginPrompt(true);
                  } else {
                    window.location.href = '/resume/templates';
                  }
                }}
              >
                Start Building Now
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
              <Button 
                variant="outline"
                size="lg"
                className="border border-gray-300 hover:border-blue-600 text-gray-700 px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-300"
              >
                <Play className="mr-2 w-4 h-4" />
                Watch Demo
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Features */}
      <section className="py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            ref={ref}
            variants={containerVariants}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {mainFeatures.map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="group relative"
              >
                <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-500 border border-gray-100 hover:border-blue-200 relative overflow-hidden">
                  {/* Background Gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-5 group-hover:opacity-10 transition-opacity duration-500`} />
                  
                  {/* Icon */}
                  <div className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  
                  {/* Content */}
                  <h3 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-sm mb-4">
                    {feature.description}
                  </p>
                  
                  {/* Stats */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                      {feature.stats}
                    </span>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors duration-300" />
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-12 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
              Why Choose OPPZ ResumeAI?
            </h2>
            <p className="text-base text-gray-600 max-w-xl mx-auto">
              Everything you need to create a CV that gets you noticed and hired.
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                className="flex items-start space-x-3 p-4 bg-gray-50 rounded-xl hover:bg-blue-50 transition-colors duration-300"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700 text-sm font-medium">{benefit}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
              Loved by Professionals Worldwide
            </h2>
            <p className="text-base text-gray-600">
              See what our users are saying about their success.
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
              >
                <div className="flex items-center mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 text-sm mb-4 italic">
                  "{testimonial.text}"
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{testimonial.name}</p>
                    <p className="text-gray-600 text-xs">{testimonial.role} at {testimonial.company}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              Ready to Transform Your Career?
            </h2>
            <p className="text-base text-blue-100 mb-6 max-w-2xl mx-auto">
              Join thousands of professionals who have already landed their dream jobs with OPPZ ResumeAI.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button 
                size="lg"
                className="bg-white text-blue-600 hover:bg-gray-100 px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-300 transform hover:scale-105"
                onClick={() => {
                  if (!user) {
                    setShowLoginPrompt(true);
                  } else {
                    window.location.href = '/resume/templates';
                  }
                }}
              >
                Get Started Free
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
              <Button 
                variant="outline"
                size="lg"
                className="border border-white hover:bg-white hover:text-blue-600  px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-300"
              >
                View Templates
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
      
      {/* Login Prompt Modal */}
      <LoginPromptModal
        isOpen={showLoginPrompt}
        onClose={() => setShowLoginPrompt(false)}
      />
    </div>
  );
};

export default FeaturesPage; 