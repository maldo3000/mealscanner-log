
import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Zap, ChevronRight, UtensilsCrossed } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';

const LandingPage = () => {
  const { isAuthenticated } = useAuth();
  
  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      {/* Gradient overlays for background effect */}
      <div className="absolute inset-0 bg-gradient-radial from-primary/5 to-transparent opacity-70"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10"></div>
      
      {/* Decorative circles */}
      <div className="absolute top-1/4 -left-24 w-64 h-64 rounded-full bg-primary/10 blur-3xl"></div>
      <div className="absolute bottom-1/4 -right-24 w-64 h-64 rounded-full bg-primary/10 blur-3xl"></div>
      
      {/* Header with prominent logo and auth buttons */}
      <header className="relative z-10 w-full pt-6 pb-4 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center glass-card px-6 rounded-full backdrop-blur-md bg-card/30 border border-primary/30 shadow-lg py-[18px]">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/20 mr-3">
                <UtensilsCrossed className="h-6 w-6 text-primary" />
              </div>
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">
                MealScanner
              </span>
            </div>
            
            {isAuthenticated ? (
              <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Link to="/home">Go to App <ChevronRight className="ml-1 h-4 w-4" /></Link>
              </Button>
            ) : (
              <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Link to="/auth">Sign In <ChevronRight className="ml-1 h-4 w-4" /></Link>
              </Button>
            )}
          </div>
        </div>
      </header>
      
      {/* Hero Section */}
      <section className="relative pt-12 pb-12 md:pt-20 md:pb-24 px-4 py-[50px]">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-12 items-center">
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center justify-center p-2 rounded-full bg-primary/10 backdrop-blur-sm mb-4">
                <UtensilsCrossed className="h-5 w-5 text-primary mr-2" />
                <span className="text-sm font-medium text-primary">AI-Powered Meal Journal</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight text-foreground">
                Snap. Analyze. <span className="text-primary">Eat Smarter.</span>
              </h1>
              
              <p className="text-xl text-foreground/80 mb-8 max-w-2xl mx-auto lg:mx-0">
                MealScanner uses AI to easily log what you're eating and keep track of your calories and macros.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                {isAuthenticated ? (
                  <>
                    <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                      <Link to="/home">Go to App <ChevronRight className="ml-1 h-4 w-4" /></Link>
                    </Button>
                    <Button asChild variant="outline" size="lg">
                      <Link to="/onboarding">View Onboarding <ChevronRight className="ml-1 h-4 w-4" /></Link>
                    </Button>
                  </>
                ) : (
                  <>
                    <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                      <Link to="/auth">Start Tracking <ChevronRight className="ml-1 h-4 w-4" /></Link>
                    </Button>
                    <Button asChild variant="outline" size="lg">
                      <Link to="#features">Learn More</Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
            
            <div className="flex-1 glass-card p-1 rounded-2xl border border-border/30 backdrop-blur-md bg-card/40 shadow-xl">
              <div className="rounded-xl overflow-hidden bg-gradient-to-br from-primary/5 to-secondary/5">
                <img src="/placeholder.svg" alt="MealScanner app interface" className="w-full h-auto object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section id="features" className="relative py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-foreground">How MealScanner Works</h2>
            <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
              Our AI-powered app makes tracking your nutrition simple and effortless
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="glass-card glass-card-hover p-6 rounded-xl backdrop-blur-sm bg-card/30 border border-border/30">
                <div className="flex items-center justify-center p-3 rounded-full bg-primary/10 w-12 h-12 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">{feature.title}</h3>
                <p className="text-foreground/70">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="relative py-16 px-4">
        <div className="max-w-4xl mx-auto text-center glass-card p-8 rounded-2xl backdrop-blur-md bg-primary/10 border border-primary/30">
          <h2 className="text-3xl font-bold mb-4 text-foreground">Ready to transform your nutrition habits?</h2>
          <p className="text-lg text-foreground/80 mb-6">
            Join thousands of users who are taking control of their health with MealScanner.
          </p>
          
          {!isAuthenticated && (
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Link to="/auth">Start Tracking Today <ChevronRight className="ml-1 h-4 w-4" /></Link>
            </Button>
          )}
          
          {isAuthenticated && (
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Link to="/home">Go to App <ChevronRight className="ml-1 h-4 w-4" /></Link>
            </Button>
          )}
        </div>
      </section>
    </div>
  );
};

// Feature data
const features = [
  {
    icon: <Zap className="h-6 w-6 text-primary" />,
    title: "Snap a Photo",
    description: "Simply take a picture of your meal, and our AI will analyze what's on your plate."
  }, 
  {
    icon: <UtensilsCrossed className="h-6 w-6 text-primary" />,
    title: "Get Nutritional Data",
    description: "Instantly receive detailed nutritional information about your food's calories, macros, and more."
  }, 
  {
    icon: <CheckCircle className="h-6 w-6 text-primary" />,
    title: "Track Your Progress",
    description: "Build a comprehensive journal of your eating habits and track improvements over time."
  }
];

export default LandingPage;
