
import React from 'react';
import { Camera, PieChart, HeartPulse } from 'lucide-react';
import { useInView } from '@/hooks/useInView';
import { cn } from '@/lib/utils';

const AnimatedFeature: React.FC<{
  children: React.ReactNode;
  delay?: number;
}> = ({ children, delay = 0 }) => {
  const [ref, isInView] = useInView({ threshold: 0.1 });

  return (
    <div
      ref={ref}
      className={cn(
        "transition-all duration-700 ease-out",
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

const FeaturesSection: React.FC = () => {
  return (
    <section className="py-10 sm:py-16 bg-secondary/50">
      <div className="container max-w-5xl mx-auto px-4">
        <h2 className="text-2xl sm:text-3xl font-semibold text-center mb-6 sm:mb-8">Key Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          <AnimatedFeature delay={100}>
            <div className="flex flex-col items-center text-center p-4 sm:p-6 bg-card/30 rounded-lg">
              <Camera className="h-10 w-10 text-primary mb-3" />
              <h3 className="font-semibold text-lg mb-2">AI-Powered Meal Recognition</h3>
              <p className="text-muted-foreground">Simply snap a photo of your meal, and let our AI identify the ingredients and nutritional content.</p>
            </div>
          </AnimatedFeature>
          
          <AnimatedFeature delay={200}>
            <div className="flex flex-col items-center text-center p-4 sm:p-6 bg-card/30 rounded-lg">
              <PieChart className="h-10 w-10 text-primary mb-3" />
              <h3 className="font-semibold text-lg mb-2">Macro Tracking Made Easy</h3>
              <p className="text-muted-foreground">Automatically track your macronutrient intake with every meal, simplifying your diet management.</p>
            </div>
          </AnimatedFeature>
          
          <AnimatedFeature delay={300}>
            <div className="flex flex-col items-center text-center p-4 sm:p-6 bg-card/30 rounded-lg">
              <HeartPulse className="h-10 w-10 text-primary mb-3" />
              <h3 className="font-semibold text-lg mb-2">Personalized Nutrition Insights</h3>
              <p className="text-muted-foreground">Get detailed analysis of your meals, including a health score.</p>
            </div>
          </AnimatedFeature>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
