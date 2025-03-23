
import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';

const Index = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-background relative overflow-hidden">
      {/* Gradient overlays for background effect */}
      <div className="absolute inset-0 bg-gradient-radial from-primary/5 to-transparent opacity-70"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10"></div>
      
      {/* Decorative circles */}
      <div className="absolute top-1/4 -left-24 w-64 h-64 rounded-full bg-primary/10 blur-3xl"></div>
      <div className="absolute bottom-1/4 -right-24 w-64 h-64 rounded-full bg-primary/10 blur-3xl"></div>
      
      <div className="flex flex-col items-center text-center z-10 max-w-3xl mx-auto glass-card p-8 rounded-2xl animate-fade-in backdrop-blur-md bg-card/40 border border-border/30">
        <div className="flex items-center justify-center p-4 rounded-full bg-primary/20 backdrop-blur-sm mb-6">
          <Leaf className="h-12 w-12 text-primary" />
        </div>
        
        <h1 className="text-4xl font-bold mb-4 text-foreground">Welcome to MealScanner</h1>
        <p className="text-xl text-foreground/80 mb-8">
          Track your nutrition, analyze your meals, and develop healthier eating habits with our AI-powered food journal.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
          {isAuthenticated ? (
            <>
              <Button asChild className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground" size="lg">
                <Link to="/capture">Scan a Meal</Link>
              </Button>
              <Button asChild className="flex-1 bg-secondary hover:bg-secondary/80 text-secondary-foreground" size="lg">
                <Link to="/journal">View Journal</Link>
              </Button>
            </>
          ) : (
            <>
              <Button asChild className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground" size="lg">
                <Link to="/auth">Sign In</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="flex-1 border-primary/30 hover:bg-primary/10 text-foreground"
                size="lg"
              >
                <Link to="/auth">Sign Up</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
