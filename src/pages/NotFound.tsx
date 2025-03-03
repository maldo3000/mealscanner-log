
import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="glass-card rounded-3xl p-8 text-center max-w-md mx-auto">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl text-muted-foreground mb-6">
          Oops! This page doesn't exist
        </p>
        <Link
          to="/"
          className="inline-flex items-center font-medium text-primary hover:text-primary/80"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Return to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
