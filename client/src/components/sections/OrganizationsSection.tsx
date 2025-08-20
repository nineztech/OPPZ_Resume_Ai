import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { LogoSlider } from './LogoSlider';

const OrganizationsSection = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const organizations = [
    
  ];

  return (
    // <section className="py-12 bg-white">
    //   <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    //     {/* Section Header */}
    //     <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    //     <div className="text-center mb-12 md:mb-16">
    //       <h2 className="text-3xl md:text-4xl font-bold mb-4 md:mb-6">
    //         Trusted by
    //         <span className="bg-gradient-to-r from-primary-blue to-primary-orange bg-clip-text text-transparent">
    //           {" "}
    //           Industry Leaders
    //         </span>
    //       </h2>
    //       <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
    //         Join hundreds of companies who trust us with their technology needs
    //       </p>
    //     </div>

    //     <div className="relative">
    //       {/* Gradient overlays for fade effect */}
    //       <div className="absolute left-0 top-0 w-20 md:w-40 h-full bg-gradient-to-r from-white to-transparent z-10" />
    //       <div className="absolute right-0 top-0 w-20 md:w-40 h-full bg-gradient-to-l from-white to-transparent z-10" />

    //       {/* Logo sliders - two rows moving in opposite directions */}
    //       <div className="space-y-6 md:space-y-8">
    //         <LogoSlider direction="left" speed={4} />
    //       </div>
    //     </div>
    //   </div>

    //     {/* Organizations Marquee */}
    //     <motion.div
    //       ref={ref}
    //       className="relative overflow-hidden"
    //       initial={{ opacity: 0 }}
    //       animate={inView ? { opacity: 1 } : {}}
    //       transition={{ duration: 0.8, delay: 0.2 }}
    //     >
    //       {/* Single Row */}
    //       <div className="flex space-x-16 animate-scroll-left">
    //         {[...organizations, ...organizations].map((org, index) => (
    //           <motion.div
    //             key={index}
    //             className="flex-shrink-0"
    //             whileHover={{
    //               scale: 1.1,
    //               transition: { duration: 0.2 }
    //             }}
    //           >
    //             <span 
    //               className="text-xl sm:text-2xl font-medium text-gray-400 transition-all duration-300 cursor-pointer hover:font-semibold"
    //               style={{
    //                 '--hover-color': org.color
    //               } as React.CSSProperties}
    //               onMouseEnter={(e) => {
    //                 e.currentTarget.style.color = org.color;
    //               }}
    //               onMouseLeave={(e) => {
    //                 e.currentTarget.style.color = '#9CA3AF'; // gray-400
    //               }}
    //             >
    //               {org.name}
    //             </span>
    //           </motion.div>
    //         ))}
    //       </div>
    //     </motion.div>
    //   </div>
    // </section>
     <section className="py-12 md:py-20 bg-white overflow-hidden mb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 md:mb-6">
            Trusted by
            <span className="bg-gradient-to-r from-primary-blue to-primary-orange bg-clip-text">
              {" "}
              Industry Leaders
            </span>
          </h2> 
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            Join hundreds of companies who trust us with their technology needs
          </p>
        </div>

        <div className="relative">
          {/* Gradient overlays for fade effect */}
          <div className="absolute left-0 top-0 w-20 md:w-40 h-full bg-gradient-to-r from-white to-transparent z-10" />
          <div className="absolute right-0 top-0 w-20 md:w-40 h-full bg-gradient-to-l from-white to-transparent z-10" />

          {/* Logo sliders - two rows moving in opposite directions */}
          <div className="space-y-6 md:space-y-8">
            <LogoSlider direction="left" speed={4} />
          </div>
        </div>
      </div>
    </section>
  );
};
export default OrganizationsSection; 