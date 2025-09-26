import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  FileText, 
  Brain, 
  Target, 
  CheckCircle, 
  Zap,
  Lightbulb
} from 'lucide-react';
import { geminiParserService } from '@/services/geminiParserService';

interface AILoadingComponentProps {
  uploadedFile: File;
  sector: string;
  country: string;
  designation: string;
  templateId?: string;
  selectedColor?: string;
  extractedData?: any;
  onComplete: (results: any) => void;
  onError: (error: any) => void;
}

const AILoadingComponent: React.FC<AILoadingComponentProps> = ({
  uploadedFile,
  sector,
  country,
  designation,
  templateId,
  selectedColor,
  extractedData,
  onComplete,
  onError
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const steps = [
    {
      id: 'upload',
      title: 'Uploading Resume',
      description: 'Processing your resume file...',
      icon: FileText,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600'
    },
    {
      id: 'analyze',
      title: 'AI Analysis',
      description: 'Our AI is analyzing your resume content...',
      icon: Brain,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600'
    },
    {
      id: 'enhance',
      title: 'Content Enhancement',
      description: 'Generating personalized suggestions...',
      icon: Lightbulb,
      color: 'from-amber-500 to-amber-600',
      bgColor: 'bg-amber-50',
      iconColor: 'text-amber-600'
    },
    {
      id: 'optimize',
      title: 'Optimization',
      description: 'Optimizing for your target role...',
      icon: Target,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600'
    },
    {
      id: 'complete',
      title: 'Finalizing',
      description: 'Preparing your AI suggestions...',
      icon: CheckCircle,
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'bg-emerald-50',
      iconColor: 'text-emerald-600'
    }
  ];

  const loadingMessages = [
    "Analyzing your professional experience...",
    "Identifying key skills and achievements...",
    "Comparing with industry standards...",
    "Generating personalized recommendations...",
    "Optimizing for your target role...",
    "Finalizing AI suggestions..."
  ];

  const [currentMessage, setCurrentMessage] = useState(0);

  useEffect(() => {
    // Simulate AI processing with step progression - increased timing
    const stepInterval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev < steps.length - 1) {
          return prev + 1;
        } else {
          setIsComplete(true);
          clearInterval(stepInterval);
          return prev;
        }
      });
    }, 5000); // Increased from 3000 to 5000ms

    // Change loading messages - increased timing
    const messageInterval = setInterval(() => {
      setCurrentMessage(prev => (prev + 1) % loadingMessages.length);
    }, 3500); // Increased from 2000 to 3500ms

    // Call actual AI service and navigate to AI suggestions after completion
    const processAI = async () => {
      try {
        // Wait for all steps to complete
        await new Promise(resolve => setTimeout(resolve, 15000));
        
        // Call the actual AI service
        console.log('Calling AI service with:', {
          fileName: uploadedFile.name,
          fileSize: uploadedFile.size,
          fileType: uploadedFile.type,
          sector: sector,
          country: country,
          designation: designation
        });
        
        const results = await geminiParserService.getAISuggestions(
          uploadedFile, 
          sector, 
          country, 
          designation
        );
        
        console.log('AI processing completed successfully:', results);
        
        // Call onComplete with results
        onComplete({
          suggestions: results.suggestions || {},
          sector: sector,
          country: country,
          designation: designation,
          aiResults: results,
          resumeFile: uploadedFile,
          templateId: templateId,
          selectedColor: selectedColor,
          extractedData: extractedData
        });
      } catch (error) {
        console.error('AI processing error:', error);
        onError(error);
      }
    };

    processAI();

    return () => {
      clearInterval(stepInterval);
      clearInterval(messageInterval);
    };
  }, [uploadedFile, sector, country, designation, templateId, selectedColor, extractedData, onComplete, onError]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut" as const
      }
    }
  };

  const stepVariants = {
    inactive: {
      scale: 1,
      opacity: 0.6,
      transition: { duration: 0.3 }
    },
    active: {
      scale: 1.1,
      opacity: 1,
      transition: { duration: 0.3 }
    },
    completed: {
      scale: 1,
      opacity: 1,
      transition: { duration: 0.3 }
    }
  };

  const progressBarVariants = {
    hidden: { width: 0 },
    visible: {
      width: `${((currentStep + 1) / steps.length) * 100}%`,
      transition: { duration: 0.5, ease: "easeInOut" as const }
    }
  };

  const pulseVariants = {
    pulse: {
      scale: [1, 1.05, 1],
      opacity: [0.8, 1, 0.8],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut" as const
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <motion.div
        className="min-h-screen flex items-center justify-center p-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="max-w-5xl w-full"> {/* Increased max width */}
          {/* Header */}
          <motion.div
            className="text-center mb-16" // Increased bottom margin
            variants={itemVariants}
          >
            <motion.div
              className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full mb-6"
              variants={pulseVariants}
              animate="pulse"
            >
              <Sparkles className="w-10 h-10 text-white" />
            </motion.div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              AI Resume Analysis
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our advanced AI is analyzing your resume and generating personalized suggestions to help you land your dream job.
            </p>
          </motion.div>

          {/* Progress Steps */}
          <motion.div
            className="mb-16" // Increased bottom margin
            variants={itemVariants}
          >
            <div className="relative px-8"> {/* Added horizontal padding */}
              {/* Progress Line */}
              <div className="absolute top-8 left-16 right-16 h-1 bg-gray-200 rounded-full z-0"> {/* Fixed positioning with z-index */}
                <motion.div
                  className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
                  variants={progressBarVariants}
                  initial="hidden"
                  animate="visible"
                />
                
                {/* Dots on the progress line */}
                <div className="absolute inset-0 flex justify-between items-center">
                  {steps.map((_, index) => (
                    <motion.div
                      key={index}
                      className={`w-3 h-3 rounded-full border-2 border-white ${
                        index <= currentStep 
                          ? 'bg-gradient-to-r from-purple-500 to-blue-500' 
                          : 'bg-gray-200'
                      }`}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.2, duration: 0.3 }}
                    />
                  ))}
                </div>
              </div>

              {/* Steps */}
              <div className="relative flex justify-between z-10"> {/* Higher z-index */}
                {steps.map((step, index) => {
                  const Icon = step.icon;
                  const isActive = index === currentStep;
                  const isCompleted = index < currentStep;

                  return (
                    <motion.div
                      key={step.id}
                      className="flex flex-col items-center min-w-0 flex-1" // Improved flex layout
                      variants={stepVariants}
                      animate={
                        isCompleted ? "completed" :
                        isActive ? "active" : "inactive"
                      }
                    >
                      <motion.div
                        className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-lg ${
                          isCompleted 
                            ? 'bg-gradient-to-r from-emerald-500 to-emerald-600' 
                            : isActive 
                              ? `bg-gradient-to-r ${step.color}` 
                              : 'bg-gray-200'
                        }`}
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Icon className={`w-8 h-8 ${
                          isCompleted || isActive ? 'text-white' : 'text-gray-400'
                        }`} />
                      </motion.div>
                      
                      <div className="text-center max-w-28"> {/* Fixed width container to prevent overlap */}
                        <h3 className={`font-semibold text-sm mb-2 leading-tight ${
                          isCompleted || isActive ? 'text-gray-900' : 'text-gray-500'
                        }`}>
                          {step.title}
                        </h3>
                        <p className={`text-xs leading-tight ${
                          isCompleted || isActive ? 'text-gray-600' : 'text-gray-400'
                        }`}>
                          {step.description}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* Current Status */}
          <motion.div
            className="text-center mb-12" // Increased margin
            variants={itemVariants}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentMessage}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20 max-w-2xl mx-auto" // Added max width and increased padding
              >
                <div className="flex items-center justify-center mb-6">
                  <motion.div
                    className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    <Zap className="w-6 h-6 text-white" />
                  </motion.div>
                </div>
                <p className="text-lg font-medium text-gray-800 mb-6">
                  {loadingMessages[currentMessage]}
                </p>
                <div className="flex justify-center">
                  <div className="flex space-x-2"> {/* Increased spacing */}
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-3 h-3 bg-purple-500 rounded-full" // Slightly larger dots
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [0.5, 1, 0.5]
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          delay: i * 0.2
                        }}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* File Info */}
          <motion.div
            className="text-center"
            variants={itemVariants}
          >
            <div className="inline-flex items-center gap-4 bg-white/60 backdrop-blur-sm rounded-xl px-8 py-4 shadow-sm border border-white/20"> {/* Increased padding */}
              <FileText className="w-6 h-6 text-blue-600" /> {/* Slightly larger icon */}
              <div className="text-left">
                <p className="font-medium text-gray-900 text-base"> {/* Larger text */}
                  {uploadedFile.name}
                </p>
                <p className="text-sm text-gray-600"> {/* Improved text size */}
                  Analyzing for {designation} position
                </p>
              </div>
            </div>
          </motion.div>

          {/* Completion Animation */}
          <AnimatePresence>
            {isComplete && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.2 }}
                className="fixed inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center z-50"
              >
                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ 
                      type: "spring", 
                      stiffness: 200, 
                      damping: 15 
                    }}
                    className="w-24 h-24 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6"
                  >
                    <CheckCircle className="w-12 h-12 text-white" />
                  </motion.div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    Analysis Complete!
                  </h2>
                  <p className="text-lg text-gray-600 mb-6">
                    Redirecting to your personalized suggestions...
                  </p>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full mx-auto"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default AILoadingComponent;
