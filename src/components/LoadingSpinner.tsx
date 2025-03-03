
import React from "react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "small" | "medium" | "large";
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = "medium",
  className,
}) => {
  const sizes = {
    small: "w-4 h-4 border-2",
    medium: "w-8 h-8 border-2",
    large: "w-12 h-12 border-3",
  };

  return (
    <div className={cn("flex justify-center items-center", className)}>
      <div
        className={cn(
          "rounded-full border-t-transparent border-primary animate-spin",
          sizes[size]
        )}
      />
    </div>
  );
};

export default LoadingSpinner;
