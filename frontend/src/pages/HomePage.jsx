import MainLayout from '../layouts/MainLayout';

// Modular Components
import HeroSection from '../components/home/HeroSection';
import BentoGrid from '../components/home/BentoGrid';
import CTASection from '../components/home/CTASection';
import FeaturedTools from '../components/home/FeaturedTools';

const HomePage = () => {
  return (
    <MainLayout>
      <div className="container">
        <HeroSection />
        <FeaturedTools />
        <BentoGrid />
        <CTASection />
      </div>
    </MainLayout>
  );
};

export default HomePage;
