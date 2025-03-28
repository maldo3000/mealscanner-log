
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

interface HeroProps {
  scrollToVideo: () => void;
}

const Hero: React.FC<HeroProps> = ({ scrollToVideo }) => {
  const isMobile = useIsMobile();

  return (
    <section className="py-10 sm:py-16 px-4">
      <div className="container max-w-5xl mx-auto text-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6">
          Snap, Analyze, <span className="text-primary">Eat Smarter</span>
        </h1>
        <p className="text-muted-foreground text-base sm:text-lg md:text-xl mb-6 sm:mb-8 max-w-2xl mx-auto">
          Effortlessly log your meals, track your nutrition, and achieve your wellness goals with your own AI-powered meal journal.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
          <Button asChild size={isMobile ? "default" : "lg"} className="w-full sm:w-auto">
            <Link to="/auth">Start Tracking</Link>
          </Button>
          <Button onClick={scrollToVideo} variant="outline" size={isMobile ? "default" : "lg"} className="w-full sm:w-auto">
            Learn More
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
