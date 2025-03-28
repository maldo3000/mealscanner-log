
import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/auth';
import {
  Header,
  Hero,
  BetaSignup,
  VideoSection,
  FeaturesSection,
  WhyChooseSection,
  Footer
} from '@/components/landing';

const LandingPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const videoSectionRef = useRef<HTMLDivElement>(null);
  
  if (isAuthenticated) {
    navigate('/home');
    return null;
  }
  
  const scrollToVideo = () => {
    videoSectionRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-grow flex flex-col">
        <Hero scrollToVideo={scrollToVideo} />
        <BetaSignup />
        <VideoSection videoRef={videoSectionRef} />
        <FeaturesSection />
        <WhyChooseSection />
      </main>
      
      <Footer />
    </div>
  );
};

export default LandingPage;
