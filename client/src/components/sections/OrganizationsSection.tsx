import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const OrganizationsSection = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const organizations = [
    { name: 'Google', color: '#4285F4' },
    { name: 'Microsoft', color: '#00A4EF' },
    { name: 'Apple', color: '#000000' },
    { name: 'Amazon', color: '#FF9900' },
    { name: 'Meta', color: '#1877F2' },
    { name: 'Netflix', color: '#E50914' },
    { name: 'Tesla', color: '#CC0000' },
    { name: 'Adobe', color: '#FF0000' },
    { name: 'Salesforce', color: '#00A1E0' },
    { name: 'Oracle', color: '#F80000' },
    { name: 'Intel', color: '#0071C5' },
    { name: 'IBM', color: '#0066CC' }
  ];

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
            Our users have been hired at
          </h2>
          <p className="text-base text-gray-600 max-w-2xl mx-auto">
            Join thousands of professionals who trust our platform to advance their careers
          </p>
        </motion.div>

        {/* Organizations Marquee */}
        <motion.div
          ref={ref}
          className="relative overflow-hidden"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {/* Single Row */}
          <div className="flex space-x-16 animate-scroll-left">
            {[...organizations, ...organizations].map((org, index) => (
              <motion.div
                key={index}
                className="flex-shrink-0"
                whileHover={{
                  scale: 1.1,
                  transition: { duration: 0.2 }
                }}
              >
                <span 
                  className="text-xl sm:text-2xl font-medium text-gray-400 transition-all duration-300 cursor-pointer hover:font-semibold"
                  style={{
                    '--hover-color': org.color
                  } as React.CSSProperties}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = org.color;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#9CA3AF'; // gray-400
                  }}
                >
                  {org.name}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default OrganizationsSection; 