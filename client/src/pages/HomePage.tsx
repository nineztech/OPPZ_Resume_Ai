import Header from '@/components/layout/Header';
import HeroSection from '@/components/sections/HeroSection';
import OrganizationsSection from '@/components/sections/OrganizationsSection';
import FeaturesSection from '@/components/sections/FeaturesSection';
import TemplatesSection from '@/components/sections/TemplatesSection';
import TestimonialsSection from '@/components/sections/TestimonialsSection';
import Footer from '@/components/layout/Footer';

const HomePage = () => {
  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <OrganizationsSection />
        <FeaturesSection />
        <TemplatesSection />
        <TestimonialsSection />
      </main>
      <Footer />
    </>
  );
};

export default HomePage; 