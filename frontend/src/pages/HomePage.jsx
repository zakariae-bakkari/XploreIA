import React, { useState } from 'react';
import MainLayout from '../layouts/MainLayout';

// Modular Components
import HeroSection from '../components/home/HeroSection';
import BentoGrid from '../components/home/BentoGrid';
import CTASection from '../components/home/CTASection';
import FeaturedTools from '../components/home/FeaturedTools';
import SuggestToolModal from '../components/ui/SuggestToolModal';

const HomePage = () => {
  const [showSuggest, setShowSuggest] = useState(false);

  return (
    <MainLayout>
      <div className="container">
        <HeroSection />
        <FeaturedTools />
        <BentoGrid onSuggestClick={() => setShowSuggest(true)} />
        <CTASection />
      </div>
      <SuggestToolModal isOpen={showSuggest} onClose={() => setShowSuggest(false)} />
    </MainLayout>
  );
};

export default HomePage;
