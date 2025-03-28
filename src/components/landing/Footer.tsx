
import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="py-6 sm:py-8 border-t border-border relative">
      <div className="container max-w-5xl mx-auto text-center text-muted-foreground px-4">
        <p>&copy; {new Date().getFullYear()} MealScanner. All rights reserved.</p>
        <p className="mt-2">
          <Link to="/terms" className="hover:underline">Terms of Service</Link> &middot; <Link to="/privacy" className="hover:underline">Privacy Policy</Link>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
