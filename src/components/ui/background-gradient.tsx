
import React from "react";

type BackgroundGradientProps = {
  className?: string;
};

const BackgroundGradient: React.FC<BackgroundGradientProps> = ({ className = "" }) => {
  return (
    <div className={`fixed inset-0 pointer-events-none ${className}`}>
      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-radial from-primary/5 to-transparent opacity-70"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10"></div>
      
      {/* Decorative circles */}
      <div className="absolute top-1/4 -left-24 w-64 h-64 rounded-full bg-primary/10 blur-3xl"></div>
      <div className="absolute bottom-1/4 -right-24 w-64 h-64 rounded-full bg-primary/10 blur-3xl"></div>
    </div>
  );
};

export default BackgroundGradient;
