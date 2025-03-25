
import React from "react";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface CaptureHeaderProps {
  paywallEnabled: boolean;
  remainingScans: number;
  isMobile: boolean;
  isAnalyzing: boolean;
}

const CaptureHeader: React.FC<CaptureHeaderProps> = ({ 
  paywallEnabled, 
  remainingScans, 
  isMobile, 
  isAnalyzing 
}) => {
  if (isMobile && isAnalyzing) {
    return null;
  }

  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold mb-1">Capture Meal</h1>
      <p className="text-muted-foreground">
        Take a photo or describe your meal for automatic nutrition analysis
      </p>
      
      {paywallEnabled && (
        <div className="mt-4 bg-primary/5 p-3 rounded-lg flex items-start gap-2 text-sm">
          <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-foreground">
              {remainingScans > 0 
                ? `You have ${remainingScans} free scans remaining` 
                : "You've reached your free scan limit"}
            </p>
            {remainingScans <= 10 && paywallEnabled && (
              <p className="text-muted-foreground mt-1">
                {remainingScans > 0 
                  ? "Subscribe to unlock unlimited scans" 
                  : "Visit the subscription page to continue scanning meals"}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CaptureHeader;
