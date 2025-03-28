import React, { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/auth';
import { ChevronRight, Zap, HeartPulse, PieChart, Camera, Check, Lock, Play } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { AspectRatio } from '@/components/ui/aspect-ratio';
const LandingPage: React.FC = () => {
  const {
    isAuthenticated
  } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const videoSectionRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  if (isAuthenticated) {
    navigate('/home');
    return null;
  }
  const scrollToVideo = () => {
    videoSectionRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
  };
  const handlePlayVideo = () => {
    setIsPlaying(true);
  };
  return <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-50 px-4 md:px-6 py-5 border-b border-border bg-background/90 backdrop-blur-sm">
        <div className="container max-w-5xl mx-auto flex flex-col sm:flex-row items-center">
          <div className="flex items-center justify-between w-full mb-4 sm:mb-0">
            <Link to="/" className="flex items-center text-lg font-semibold">
              <Zap className="mr-2 h-6 w-6 text-primary" />
              <span className="text-xl">MealScanner</span>
            </Link>
            <div className="sm:hidden">
              <Button asChild variant="secondary" size="sm" className="px-3 py-2">
                <Link to="/auth" className="flex items-center">
                  <span>Get Started</span>
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
          <div className="hidden sm:flex sm:ml-auto">
            <Button asChild variant="secondary">
              <Link to="/auth" className="flex items-center">
                <span>Get Started</span>
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-grow flex flex-col">
        <section className="py-10 sm:py-16 px-4">
          <div className="container max-w-5xl mx-auto text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6">
              Snap, Analyze, <span className="text-primary">Eat Smarter</span>
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg md:text-xl mb-6 sm:mb-8 max-w-2xl mx-auto">Effortlessly log your meals, track your nutrition, and achieve your wellness goals with your own AI-powered meal journal.</p>
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

        <section ref={videoSectionRef} className="py-12 md:py-16 bg-secondary/30">
          <div className="container max-w-5xl mx-auto px-4">
            <div className="rounded-xl overflow-hidden border border-border bg-card/50">
              <AspectRatio ratio={16 / 9} className="w-full">
                {isPlaying ? <iframe src="https://www.youtube.com/embed/i1TgxQ-Ql6I?autoplay=1&rel=0&modestbranding=1&showinfo=0" title="MealScanner Demo Video" className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen frameBorder="0" /> : <div className="relative w-full h-full">
                    <img src="https://i.ytimg.com/vi/i1TgxQ-Ql6I/maxresdefault.jpg" alt="Video thumbnail" className="w-full h-full object-cover" />
                    <button onClick={handlePlayVideo} className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
                      <div className="bg-primary text-primary-foreground rounded-full p-4 shadow-lg hover:bg-primary/90 transition-all duration-200 hover:scale-110">
                        <Play className="h-10 w-10 md:h-12 md:w-12 fill-primary-foreground" />
                      </div>
                    </button>
                  </div>}
              </AspectRatio>
            </div>
          </div>
        </section>

        <section className="py-10 sm:py-16 bg-secondary/50">
          <div className="container max-w-5xl mx-auto px-4">
            <h2 className="text-2xl sm:text-3xl font-semibold text-center mb-6 sm:mb-8">Key Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              <div className="flex flex-col items-center text-center p-4 sm:p-6 bg-card/30 rounded-lg">
                <Camera className="h-10 w-10 text-primary mb-3" />
                <h3 className="font-semibold text-lg mb-2">AI-Powered Meal Recognition</h3>
                <p className="text-muted-foreground">Simply snap a photo of your meal, and let our AI identify the ingredients and nutritional content.</p>
              </div>
              <div className="flex flex-col items-center text-center p-4 sm:p-6 bg-card/30 rounded-lg">
                <PieChart className="h-10 w-10 text-primary mb-3" />
                <h3 className="font-semibold text-lg mb-2">Macro Tracking Made Easy</h3>
                <p className="text-muted-foreground">Automatically track your macronutrient intake with every meal, simplifying your diet management.</p>
              </div>
              <div className="flex flex-col items-center text-center p-4 sm:p-6 bg-card/30 rounded-lg">
                <HeartPulse className="h-10 w-10 text-primary mb-3" />
                <h3 className="font-semibold text-lg mb-2">Personalized Nutrition Insights</h3>
                <p className="text-muted-foreground">Get detailed analysis of your meals, including a health score.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-10 sm:py-16">
          <div className="container max-w-5xl mx-auto px-4">
            <h2 className="text-2xl sm:text-3xl font-semibold text-center mb-6 sm:mb-8">Why Choose MealScanner?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              <div className="p-4 sm:p-6 bg-card/30 rounded-lg">
                <h3 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">Achieve Your Health Goals</h3>
                <p className="text-muted-foreground mb-4">
                  Whether you're aiming to lose weight, build muscle, or simply eat healthier, MealScanner provides the insights you need to succeed.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-primary mr-2 flex-shrink-0" />
                    <span>Effortlessly log your meals</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-primary mr-2 flex-shrink-0" />
                    <span>Track your calories and your macros</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-primary mr-2 flex-shrink-0" />
                    <span>Easily monitor your eating habits</span>
                  </li>
                </ul>
              </div>
              <div className="p-4 sm:p-6 bg-card/30 rounded-lg">
                <h3 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">Simple and Cost Effective</h3>
                <p className="text-muted-foreground mb-4">
                  Your data is safe with us. We prioritize your privacy and ensure that your meal information is securely stored and never shared.
                </p>
                <ul className="space-y-2">
                  <li className="Designed for everyday use\u2014no fluff, just function">
                    <Lock className="h-5 w-5 text-primary mr-2 flex-shrink-0" />
                    <span>No </span>
                  </li>
                  <li className="flex items-center">
                    <Lock className="h-5 w-5 text-primary mr-2 flex-shrink-0" />
                    <span>Anonymous data options</span>
                  </li>
                  <li className="flex items-center">
                    <Lock className="h-5 w-5 text-primary mr-2 flex-shrink-0" />
                    <span>Full control over your data</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-6 sm:py-8 border-t border-border">
        <div className="container max-w-5xl mx-auto text-center text-muted-foreground px-4">
          <p>&copy; {new Date().getFullYear()} MealScanner. All rights reserved.</p>
          <p className="mt-2">
            <Link to="/terms" className="hover:underline">Terms of Service</Link> &middot; <Link to="/privacy" className="hover:underline">Privacy Policy</Link>
          </p>
        </div>
      </footer>
    </div>;
};
export default LandingPage;