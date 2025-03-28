
import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/auth';
import { cn } from '@/lib/utils';
import { useInView } from '@/hooks/useInView';
import {
  Header,
  Hero,
  BetaSignup,
  VideoSection,
  FeaturesSection,
  WhyChooseSection,
  FAQSection,
  Footer
} from '@/components/landing';

const FadeInSection: React.FC<{ children: React.ReactNode, delay?: number }> = ({ 
  children, 
  delay = 0 
}) => {
  const [ref, isInView] = useInView({ threshold: 0.1 });
  
  return (
    <div
      ref={ref}
      className={cn(
        "transition-all duration-1000 ease-out",
        isInView
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-8"
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

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
    <div className="min-h-screen bg-background flex flex-col relative">
      <Header />
      
      <main className="flex-grow flex flex-col">
        <FadeInSection>
          <Hero scrollToVideo={scrollToVideo} />
        </FadeInSection>
        
        <FadeInSection delay={100}>
          <BetaSignup />
        </FadeInSection>
        
        <FadeInSection delay={200}>
          <VideoSection videoRef={videoSectionRef} />
        </FadeInSection>
        
        <FadeInSection delay={300}>
          <FeaturesSection />
        </FadeInSection>
        
        <FadeInSection delay={400}>
          <WhyChooseSection />
        </FadeInSection>
        
        <FadeInSection delay={500}>
          <FAQSection />
        </FadeInSection>
      </main>
      
      <Footer />
    </div>
  );
};

export default LandingPage;
