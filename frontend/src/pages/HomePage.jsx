import React from 'react';
import MainLayout from '../layouts/MainLayout';

// Modular Components
import HeroSection from '../components/home/HeroSection';
import BentoGrid from '../components/home/BentoGrid';
import CTASection from '../components/home/CTASection';

const HomePage = () => {
  return (
    <MainLayout>
      <div className="container">
        <HeroSection />
        <BentoGrid />
        <CTASection />
      </div>
    </MainLayout>
  );
};

export default HomePage;
