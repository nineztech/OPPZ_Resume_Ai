import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { Star, Quote } from 'lucide-react';

const TestimonialsSection = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Senior UX Designer",
      company: "Google",
      avatar: "SJ",
      rating: 5,
      text: "ResumeAI helped me create a stunning CV that perfectly showcased my design skills. I got hired at Google within 2 weeks of applying!",
      color: "from-blue-500 to-blue-600"
    },
    {
      name: "Michael Chen",
      role: "Software Engineer",
      company: "Microsoft",
      avatar: "MC",
      rating: 5,
      text: "The ATS-optimized templates are incredible. My CV now passes through every applicant tracking system. Highly recommended!",
      color: "from-purple-500 to-purple-600"
    },
    {
      name: "Emily Rodriguez",
      role: "Marketing Manager",
      company: "Netflix",
      avatar: "ER",
      rating: 5,
      text: "The expert content library saved me hours of writing. The phrases are professional and impactful. Got my dream job at Netflix!",
      color: "from-green-500 to-green-600"
    },
    {
      name: "David Thompson",
      role: "Product Manager",
      company: "Apple",
      avatar: "DT",
      rating: 5,
      text: "The step-by-step guidance made CV creation so easy. I was able to highlight my achievements effectively and land a role at Apple.",
      color: "from-orange-500 to-orange-600"
    },
    {
      name: "Lisa Wang",
      role: "Data Scientist",
      company: "Amazon",
      avatar: "LW",
      rating: 5,
      text: "Professional templates that actually work with ATS systems. I received 3 job offers within a month of using ResumeAI.",
      color: "from-red-500 to-red-600"
    },
    {
      name: "James Wilson",
      role: "Business Analyst",
      company: "Meta",
      avatar: "JW",
      rating: 5,
      text: "The combination of CV and cover letter templates is brilliant. It created a cohesive personal brand that impressed every recruiter.",
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
        duration: 0.6
      }
    }
  };

  return (
    <section className="py-16 sm:py-20 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          className="text-center mb-12 sm:mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">
            What our{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              users say
            </span>
          </h2>
          <p className="text-sm sm:text-base text-gray-600 max-w-3xl mx-auto px-4">
            Join thousands of professionals who have successfully landed their dream jobs with our platform
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
        >
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              className="group relative"
            >
              <Card className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-blue-200 h-full">
                <CardContent className="p-6 sm:p-8 relative">
                  {/* Quote Icon */}
                  <div className="absolute top-4 sm:top-6 right-4 sm:right-6 opacity-10">
                    <Quote className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400" />
                  </div>

                  {/* Rating */}
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>

                  {/* Testimonial Text */}
                  <CardDescription className="text-gray-700 leading-relaxed mb-6 italic text-sm">
                    "{testimonial.text}"
                  </CardDescription>

                  {/* Author Info */}
                  <div className="flex items-center">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r ${testimonial.color} rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-lg`}>
                      {testimonial.avatar}
                    </div>
                    <div className="ml-3 sm:ml-4">
                      <CardTitle className="font-semibold text-gray-900 text-sm sm:text-base">
                        {testimonial.name}
                      </CardTitle>
                      <CardDescription className="text-xs sm:text-sm text-gray-600">
                        {testimonial.role} at {testimonial.company}
                      </CardDescription>
                    </div>
                  </div>

                  {/* Hover Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default TestimonialsSection;