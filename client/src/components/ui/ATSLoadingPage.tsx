import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, FileText, Target, Zap, BarChart3, TrendingUp, Brain, Search, Loader2 } from 'lucide-react';

interface LoadingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  duration: number;
}

interface ATSLoadingPageProps {
  fileName: string;
  analysisType: 'standard' | 'job-specific';
  onComplete: () => void;
  isAnalysisComplete?: boolean;
}

const ATSLoadingPage: React.FC<ATSLoadingPageProps> = ({ fileName, analysisType, onComplete, isAnalysisComplete = false }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  const loadingSteps: LoadingStep[] = [
    {
      id: 'parse',
      title: 'Parsing Resume',
      description: 'Extracting text and structure from your resume',
      icon: <FileText className="w-6 h-6" />,
      duration: 6000
    },
    {
      id: 'analyze-summary',
      title: 'Analyzing Summary',
      description: 'Evaluating professional summary and objectives',
      icon: <Search className="w-6 h-6" />,
      duration: 5500
    },
    {
      id: 'analyze-experience',
      title: 'Analyzing Experience',
      description: 'Reviewing work history and achievements',
      icon: <BarChart3 className="w-6 h-6" />,
      duration: 7000
    },
    {
      id: 'analyze-skills',
      title: 'Analyzing Skills',
      description: 'Evaluating technical and soft skills',
      icon: <Target className="w-6 h-6" />,
      duration: 5000
    },
    {
      id: 'ats-scoring',
      title: 'ATS Scoring',
      description: 'Calculating compatibility scores',
      icon: <Zap className="w-6 h-6" />,
      duration: 6500
    },
    {
      id: 'generating-suggestions',
      title: 'Generating Suggestions',
      description: 'Creating personalized recommendations',
      icon: <Brain className="w-6 h-6" />,
      duration: 6000
    },
    {
      id: 'finalizing',
      title: 'Finalizing Report',
      description: 'Preparing your detailed analysis',
      icon: <TrendingUp className="w-6 h-6" />,
      duration: 4000
    }
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentStep < loadingSteps.length - 1) {
        setCompletedSteps(prev => [...prev, currentStep]);
        setCurrentStep(prev => prev + 1);
        
        // Auto-scroll to current step
        setTimeout(() => {
          if (stepRefs.current[currentStep + 1]) {
            stepRefs.current[currentStep + 1]?.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'center' 
            });
          }
        }, 200);
      } else {
        // On the last step, set it to finalizing
        setIsFinalizing(true);
      }
    }, loadingSteps[currentStep].duration);

    return () => clearTimeout(timer);
  }, [currentStep, loadingSteps]);

  // Handle actual analysis completion
  useEffect(() => {
    if (isAnalysisComplete && isFinalizing && !isComplete) {
      // Complete the final step and trigger completion
      setCompletedSteps(prev => [...prev, currentStep]);
      setIsComplete(true);
      setTimeout(() => {
        onComplete();
      }, 2000);
    }
  }, [isAnalysisComplete, isFinalizing, isComplete, currentStep, onComplete]);


  const getStepStatus = (stepIndex: number) => {
    if (completedSteps.includes(stepIndex)) return 'completed';
    if (stepIndex === currentStep) {
      if (stepIndex === loadingSteps.length - 1 && isFinalizing) return 'finalizing';
      return 'active';
    }
    return 'pending';
  };

  const getOverallProgress = () => {
    if (isComplete) return 100;
    if (isFinalizing) return 95;
    return Math.round((completedSteps.length / loadingSteps.length) * 90);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-12"
        >
          <motion.div
            animate={{ 
              rotate: [0, 360],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              rotate: { duration: 10, repeat: Infinity, ease: "linear" },
              scale: { duration: 3, repeat: Infinity, ease: "easeInOut" }
            }}
            className="w-12 h-12 mx-auto bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 rounded-full flex items-center justify-center mb-6 shadow-xl"
          >
            <Zap className="w-8 h-8 text-white" />
          </motion.div>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Analyzing Your Resume
          </h1>
          
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 rounded-full font-medium text-lg">
              {analysisType === 'standard' ? 'Standard ATS Analysis' : 'Job-Specific Analysis'}
            </div>
          </div>
          
          <p className="text-gray-600 font-medium">
            File: {fileName}
          </p>
        </motion.div>

        {/* Progress Steps with Timeline */}
        <div className="relative" ref={containerRef}>
          {/* Central Timeline Line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 w-1 bg-gradient-to-b from-blue-200 via-purple-200 to-blue-200 h-full rounded-full"></div>
          
          <div className="-space-y-1">
            {loadingSteps.map((step, index) => {
              const status = getStepStatus(index);
              const isActive = status === 'active';
              const isCompleted = status === 'completed';
              const isFinalizing = status === 'finalizing';
              const isLeft = index % 2 === 0;

              return (
                <motion.div
                  key={step.id}
                  ref={el => { stepRefs.current[index] = el; }}
                  initial={{ opacity: 0, x: isLeft ? -100 : 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.2, duration: 0.8 }}
                  className={`flex items-center ${isLeft ? 'flex-row' : 'flex-row-reverse'}`}
                >
                  {/* Content Card */}
                  <motion.div
                    animate={isActive ? { 
                      scale: [1, 1.02, 1],
                      boxShadow: [
                        "0 10px 25px -5px rgba(0, 0, 0, 0.1)", 
                        "0 20px 35px -5px rgba(59, 130, 246, 0.15)", 
                        "0 10px 25px -5px rgba(0, 0, 0, 0.1)"
                      ]
                    } : {}}
                    transition={{ duration: 2, repeat: isActive ? Infinity : 0 }}
                    className={`w-96 p-4 rounded-xl border-2 transition-all duration-700 ${
                      isCompleted ? 'bg-emerald-50 border-emerald-200 shadow-lg' :
                      isFinalizing ? 'bg-purple-50 border-purple-300 shadow-xl ring-4 ring-purple-100' :
                      isActive ? 'bg-blue-50 border-blue-300 shadow-xl ring-4 ring-blue-100' : 
                      'bg-white border-gray-200 shadow-md'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <motion.div
                        animate={isActive ? { 
                          scale: [1, 1.2, 1],
                          rotate: [0, 10, -10, 0]
                        } : isFinalizing ? {
                          rotate: [0, 360],
                          scale: [1, 1.1, 1]
                        } : {}}
                        transition={{ 
                          duration: isActive ? 2 : isFinalizing ? 1.5 : 0,
                          repeat: (isActive || isFinalizing) ? Infinity : 0,
                          ease: "easeInOut"
                        }}
                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 ${
                          isCompleted ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg' :
                          isFinalizing ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg' :
                          isActive ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg' : 
                          'bg-gray-200 text-gray-500'
                        }`}
                      >
                        {isCompleted ? (
                          <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ duration: 0.6, ease: "backOut" }}
                          >
                            <CheckCircle className="w-6 h-6" />
                          </motion.div>
                        ) : isFinalizing ? (
                          <Loader2 className="w-6 h-6 animate-spin" />
                        ) : (
                          step.icon
                        )}
                      </motion.div>

                      <div className="flex-1">
                        <h3 className={`font-bold text-lg mb-1 ${
                          isCompleted ? 'text-emerald-800' :
                          isFinalizing ? 'text-purple-800' :
                          isActive ? 'text-blue-800' : 'text-gray-600'
                        }`}>
                          {step.title}
                        </h3>
                        
                        <p className={`text-sm leading-relaxed ${
                          isCompleted ? 'text-emerald-700' :
                          isFinalizing ? 'text-purple-700' :
                          isActive ? 'text-blue-700' : 'text-gray-500'
                        }`}>
                          {step.description}
                        </p>

                        {/* Active Step Indicators */}
                        {(isActive || isFinalizing) && (
                          <div className="mt-2 flex items-center space-x-2">
                            <motion.div
                              animate={{ opacity: [0.4, 1, 0.4] }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                              className={`text-xs font-medium ${
                                isFinalizing ? 'text-purple-600' : 'text-blue-600'
                              }`}
                            >
                              {isFinalizing ? 'Almost ready...' : 'Processing...'}
                            </motion.div>
                            
                            <div className="flex space-x-1">
                              {[0, 1, 2].map((i) => (
                                <motion.div
                                  key={i}
                                  animate={{ y: [0, -4, 0] }}
                                  transition={{ 
                                    duration: 0.8, 
                                    repeat: Infinity, 
                                    delay: i * 0.2 
                                  }}
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    isFinalizing ? 'bg-purple-500' : 'bg-blue-500'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Progress Bar for Active Step */}
                        {(isActive || isFinalizing) && (
                          <div className="mt-2">
                            <div className={`h-1.5 rounded-full overflow-hidden ${
                              isFinalizing ? 'bg-purple-100' : 'bg-blue-100'
                            }`}>
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: isFinalizing ? '100%' : '100%' }}
                                transition={{ 
                                  duration: isFinalizing ? 2 : step.duration / 1000, 
                                  ease: 'easeOut',
                                  repeat: isFinalizing ? Infinity : 0,
                                  repeatType: isFinalizing ? 'reverse' : 'loop'
                                }}
                                className={`h-full rounded-full relative overflow-hidden ${
                                  isFinalizing ? 
                                  'bg-gradient-to-r from-purple-500 via-purple-600 to-purple-500' :
                                  'bg-gradient-to-r from-blue-500 via-purple-500 to-blue-600'
                                }`}
                              >
                                <motion.div
                                  animate={{ x: ['-100%', '100%'] }}
                                  transition={{ 
                                    duration: 2, 
                                    repeat: Infinity, 
                                    ease: 'easeInOut' 
                                  }}
                                  className="absolute top-0 left-0 h-full w-8 bg-white/40 rounded-full"
                                />
                              </motion.div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>

                  {/* Timeline Node */}
                  <motion.div
                    className={`absolute left-[50%] transform -translate-x-1/2 w-6 h-6 rounded-full border-4 ${
                      isCompleted ? 'bg-emerald-500 border-emerald-600' :
                      'bg-gray-300 border-gray-400'
                    } shadow-lg z-10`}
                  />
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Overall Progress */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="mt-12 bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-white/30 shadow-xl max-w-2xl mx-auto"
        >
          <div className="text-center">
            <div className="text-lg font-bold text-gray-800 mb-4 flex items-center justify-center space-x-3">
              <span>Overall Progress</span>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full"
              />
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner mb-4">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${getOverallProgress()}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-blue-600 rounded-full relative overflow-hidden"
              >
                <motion.div
                  animate={{ x: ['-30px', 'calc(100% - 2px)'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="absolute top-0 left-0 h-full w-8 bg-white/50 rounded-full blur-sm"
                />
              </motion.div>
            </div>
            
            <motion.div 
              key={getOverallProgress()}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="text-2xl font-bold text-gray-800"
            >
              {getOverallProgress()}% Complete
            </motion.div>
          </div>
        </motion.div>

        {/* Completion Message */}
        <AnimatePresence>
          {isComplete && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -50 }}
              transition={{ duration: 0.8, ease: "backOut" }}
              className="mt-12 text-center"
            >
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.3, type: 'spring', stiffness: 200, damping: 10 }}
                className="w-20 h-20 mx-auto bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center mb-6 shadow-xl"
              >
                <CheckCircle className="w-10 h-10 text-white" />
              </motion.div>
              
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-3xl font-bold text-emerald-800 mb-4"
              >
                Analysis Complete!
              </motion.h2>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="text-emerald-700 text-lg mb-6"
              >
                Redirecting to your detailed results...
              </motion.p>
              
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.2, repeat: Infinity }}
                className="flex justify-center space-x-2"
              >
                {[0, 1, 2, 3, 4].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ y: [0, -12, 0] }}
                    transition={{ 
                      duration: 1, 
                      repeat: Infinity, 
                      delay: i * 0.15 
                    }}
                    className="w-3 h-3 bg-emerald-500 rounded-full"
                  />
                ))}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ATSLoadingPage;