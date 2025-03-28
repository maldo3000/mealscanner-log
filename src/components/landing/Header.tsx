
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Leaf, ChevronRight } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 px-4 md:px-6 py-5 border-b border-border bg-background/90 backdrop-blur-sm">
      <div className="container max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center">
          <Link to="/" className="flex items-center text-lg font-semibold mb-4 sm:mb-0">
            <Leaf className="mr-2 h-6 w-6 text-primary" />
            <span className="text-xl">MealScanner</span>
          </Link>
          <div className="sm:hidden w-full flex justify-center mb-2">
            <Button asChild variant="secondary" size="sm" className="w-full max-w-[200px]">
              <Link to="/auth" className="flex items-center justify-center">
                <span>Get Started</span>
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
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
      </div>
    </header>
  );
};

export default Header;
