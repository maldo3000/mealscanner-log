
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/auth';
import { ChevronRight, Zap, HeartPulse, PieChart, Camera, Check, Lock } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

const LandingPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  // If authenticated, redirect to app home
  if (isAuthenticated) {
    navigate('/home');
    return null; // Return null to prevent rendering anything else
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="px-4 md:px-6 py-5 border-b border-border">
        <div className="container max-w-5xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center text-lg font-semibold">
            <Zap className="mr-2 h-6 w-6 text-primary" />
            <span className="text-xl">MealScanner</span>
          </Link>
          <div>
            <Button asChild variant="secondary" className={isMobile ? "px-3 py-2" : ""} size={isMobile ? "sm" : "default"}>
              <Link to="/auth" className="flex items-center">
                <span>Get Started</span>
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center px-6 py-12">
        <div className="container max-w-5xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Unlock the Power of <span className="text-primary">Smarter Eating</span>
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl mb-8 max-w-2xl mx-auto">
            Effortlessly track your nutrition, discover healthier choices, and achieve your wellness goals with our AI-powered meal analysis.
          </p>
          <div className="space-x-4">
            <Button asChild size="lg">
              <Link to="/auth">Start Scanning</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/auth">Learn More</Link>
            </Button>
          </div>
        </div>
      </main>

      <section className="py-16 bg-secondary/50">
        <div className="container max-w-5xl mx-auto">
          <h2 className="text-3xl font-semibold text-center mb-8">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center">
              <HeartPulse className="h-10 w-10 text-primary mb-3" />
              <h3 className="font-semibold text-lg mb-2">Personalized Nutrition Insights</h3>
              <p className="text-muted-foreground">Get detailed analysis of your meals, tailored to your dietary needs and preferences.</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <PieChart className="h-10 w-10 text-primary mb-3" />
              <h3 className="font-semibold text-lg mb-2">Macro Tracking Made Easy</h3>
              <p className="text-muted-foreground">Automatically track your macronutrient intake with every meal, simplifying your diet management.</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <Camera className="h-10 w-10 text-primary mb-3" />
              <h3 className="font-semibold text-lg mb-2">AI-Powered Meal Recognition</h3>
              <p className="text-muted-foreground">Simply snap a photo of your meal, and let our AI identify the ingredients and nutritional content.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container max-w-5xl mx-auto">
          <h2 className="text-3xl font-semibold text-center mb-8">Why Choose MealScanner?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-2xl font-semibold mb-4">Achieve Your Health Goals</h3>
              <p className="text-muted-foreground mb-4">
                Whether you're aiming to lose weight, build muscle, or simply eat healthier, MealScanner provides the insights you need to succeed.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-primary mr-2" />
                  Track calories and macros effortlessly
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-primary mr-2" />
                  Discover nutritious alternatives
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-primary mr-2" />
                  Personalized recommendations
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-2xl font-semibold mb-4">Privacy and Security</h3>
              <p className="text-muted-foreground mb-4">
                Your data is safe with us. We prioritize your privacy and ensure that your meal information is securely stored and never shared.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <Lock className="h-5 w-5 text-primary mr-2" />
                  End-to-end encryption
                </li>
                <li className="flex items-center">
                  <Lock className="h-5 w-5 text-primary mr-2" />
                  Anonymous data options
                </li>
                <li className="flex items-center">
                  <Lock className="h-5 w-5 text-primary mr-2" />
                  Full control over your data
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-8 border-t border-border">
        <div className="container max-w-5xl mx-auto text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} MealScanner. All rights reserved.</p>
          <p className="mt-2">
            <Link to="/terms" className="hover:underline">Terms of Service</Link> &middot; <Link to="/privacy" className="hover:underline">Privacy Policy</Link>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
