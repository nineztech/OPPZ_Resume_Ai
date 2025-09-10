import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Phone, Mail, FileText, Sparkles, Star, Award } from 'lucide-react';

const HeroSection = () => {
  // const stats = [
  //   { number: '30%', label: 'higher chance of getting a job' },
  //   { number: '42%', label: 'higher response rate from recruiters' },
  // ];

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-20 left-10 w-64 h-64 bg-blue-200/40 rounded-full mix-blend-multiply filter blur-xl"
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute top-40 right-10 w-64 h-64 bg-indigo-200/40 rounded-full mix-blend-multiply filter blur-xl"
          animate={{
            scale: [1.1, 1, 1.1],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <div className="space-y-4">
              <motion.h1 
                className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                The Best{' '}
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  CV Maker
                </span>{' '}
                Online
              </motion.h1>
              
              <motion.p 
                className="text-base text-gray-600 leading-relaxed max-w-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                Fast. Easy. Effective. Whether you want to build a new CV from scratch or improve an existing one, 
                let ResumeAI help you present your work life, personality, and skills on a CV that stands out.
              </motion.p>
            </div>

            {/* CTA Buttons */}
            <motion.div 
              className="flex flex-col sm:flex-row gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <Button 
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Create new CV
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                variant="outline"
                size="lg"
                className="border-2 border-gray-300 hover:border-blue-600 text-gray-700 hover:text-blue-600 px-8 py-3 text-sm font-semibold transition-all duration-300"
              >
                Improve my CV
              </Button>
            </motion.div>

            {/* Stats
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 pt-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              {stats.map((stat, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-sm text-gray-600">
                    <span className="font-semibold text-gray-900">{stat.number}</span> {stat.label}
                  </span>
                </div>
              ))}
            </motion.div> */}
          </motion.div>

          {/* Right Content - Professional Resume Preview */}
          <motion.div
            className="relative flex items-center justify-center h-full py-8 -mt-16"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            {/* Main Resume Card */}
            <motion.div
              className="relative bg-white rounded-2xl shadow-2xl w-80 h-[28rem] border border-gray-100 overflow-hidden"
              style={{ transform: 'rotate(4deg)' }}
              animate={{
                y: [0, -10, 0],
                rotateY: [0, 2, 0],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              {/* Subtle Glow Effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 blur-xl"></div>
              
              {/* Resume Content */}
              <div className="relative z-10 p-6 h-full flex flex-col">
                {/* Header */}
                <motion.div 
                  className="mb-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                      <FileText className="h-5 w-5 text-white" />
                    </div>
                    <motion.div
                      className="flex items-center space-x-1 bg-green-50 px-2 py-1 rounded-full"
                      animate={{ opacity: [0.7, 1, 0.7] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-xs text-green-700 font-medium">ATS Ready</span>
                    </motion.div>
                  </div>
                  
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.4 }}
                  >
                    <h3 className="text-base font-bold text-gray-800 mb-1">John Anderson</h3>
                    <p className="text-sm text-gray-600">Senior Software Engineer</p>
                  </motion.div>
                </motion.div>

                {/* Contact Info */}
                <motion.div 
                  className="mb-4 space-y-1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.6 }}
                >
                  <div className="flex items-center space-x-2 text-xs text-gray-600">
                    <Mail className="h-3 w-3" />
                    <span>john.anderson@email.com</span>
                  </div>
                  <div className="flex items-center space-x-2 mb-4 text-xs text-gray-600">
                    <Phone className="h-3 w-3" />
                    <span>+1 (555) 123-4567</span>
                  </div>
                  {/* <div className="flex items-center space-x-2 text-xs text-gray-600">
                    <MapPin className="h-3 w-3" />
                    <span>San Francisco, CA</span>
                  </div> */}
                </motion.div>

                {/* Skills Section */}
                <motion.div 
                  className="mb-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.8 }}
                >
                  <h4 className="text-sm font-semibold text-gray-800 mb-2">Skills</h4>
                  <div className="space-y-2 mb-2">
                    {[
                      { skill: 'React & JavaScript', level: 90 },
                      { skill: 'Node.js & Python', level: 85 },
                     
                    ].map((item, index) => (
                      <div key={index}>
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>{item.skill}</span>
                          <span>{item.level}%</span>
                        </div>
                        <motion.div
                          className="h-1.5 bg-gray-100 rounded-full overflow-hidden"
                          initial={{ width: 0 }}
                          animate={{ width: "100%" }}
                          transition={{ duration: 0.5, delay: 2 + index * 0.2 }}
                        >
                          <motion.div
                            className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${item.level}%` }}
                            transition={{ duration: 1, delay: 2.2 + index * 0.2 }}
                          />
                        </motion.div>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Experience */}
                <motion.div 
                  className="flex-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 2.5 }}
                >
                  <h4 className="text-sm font-semibold text-gray-800 mb-4">Experience</h4>
                  <div className="space-y-2 mb-4">
                    <div className="border-l-2 border-blue-500 pl-3 mb-4">
                      <h5 className="text-xs font-medium text-gray-800">Senior Developer</h5>
                      <p className="text-xs text-gray-600">TechCorp Inc. (2021-Present)</p>
                    </div>
                    <div className="border-l-2 border-gray-300 pl-3 mb-2">
                      <h5 className="text-xs font-medium text-gray-800">Full Stack Developer</h5>
                      <p className="text-xs text-gray-600">StartupXYZ (2019-2021)</p>
                    </div>
                  </div>
                </motion.div>

                {/* Education Section */}
                <motion.div 
                  className="mt-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 2.8 }}
                >
                  <h4 className="text-sm font-semibold text-gray-800 mb-1">Education</h4>
                  <div className="text-xs text-gray-600">
                    <p className="font-medium">Computer Science, B.S.</p>
                    <p>Stanford University (2015-2019)</p>
                  </div>
                </motion.div>
              </div>
            </motion.div>

            {/* Floating Success Badges */}
            <motion.div
              className="absolute -top-4 -right-4 bg-gradient-to-r from-green-400 to-emerald-500 text-white px-3 py-2 rounded-full text-xs font-semibold shadow-lg z-20"
              animate={{
                y: [0, -8, 0],
                rotate: [0, 3, -3, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <div className="flex items-center space-x-1">
                <Sparkles className="h-3 w-3" />
                <span>AI Powered</span>
              </div>
            </motion.div>

            <motion.div
              className="absolute top-1/2 -left-6 bg-gradient-to-r from-orange-400 to-yellow-500 text-white px-3 py-2 rounded-full text-xs font-semibold shadow-lg z-20"
              animate={{
                x: [0, -5, 0],
                rotate: [0, -3, 3, 0],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <div className="flex items-center space-x-1">
                <Award className="h-3 w-3" />
                <span>Expert Level</span>
              </div>
            </motion.div>

            <motion.div
              className="absolute bottom-12 -right-6 bg-gradient-to-r from-purple-400 to-pink-500 text-white px-3 py-2 rounded-full text-xs font-semibold shadow-lg z-20"
              animate={{
                y: [0, 8, 0],
                x: [0, 3, 0],
              }}
              transition={{
                duration: 4.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <div className="flex items-center space-x-1">
                <Star className="h-3 w-3" />
                <span>Premium</span>
              </div>
            </motion.div>

            {/* Animated Connection Dots */}
            <motion.div
              className="absolute top-1/4 -left-2 w-2 h-2 bg-blue-400 rounded-full"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.4, 1, 0.4],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />

            <motion.div
              className="absolute bottom-1/3 right-0 w-1.5 h-1.5 bg-indigo-400 rounded-full"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.3, 1, 0.3],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />

            {/* Subtle Connection Lines */}
            <motion.div
              className="absolute top-1/3 -left-1 w-6 h-px bg-gradient-to-r from-blue-400/50 to-transparent"
              animate={{
                scaleX: [0, 1, 0],
                opacity: [0, 0.7, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;