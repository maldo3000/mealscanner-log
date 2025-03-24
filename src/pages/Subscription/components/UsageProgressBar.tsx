
import React from 'react';

interface UsageProgressBarProps {
  scanCount: number;
  freeTierLimit: number;
}

const UsageProgressBar: React.FC<UsageProgressBarProps> = ({ scanCount, freeTierLimit }) => {
  const remainingScans = Math.max(0, freeTierLimit - scanCount);
  
  return (
    <div className="mt-8 max-w-md mx-auto bg-muted p-4 rounded-md">
      <h3 className="font-medium mb-2">Your current usage</h3>
      <div className="w-full bg-background rounded-full h-2.5">
        <div 
          className="bg-primary h-2.5 rounded-full" 
          style={{ width: `${Math.min(100, (scanCount / freeTierLimit) * 100)}%` }}
        ></div>
      </div>
      <p className="text-sm text-muted-foreground mt-2">
        {scanCount} of {freeTierLimit} free scans used ({remainingScans} remaining)
      </p>
    </div>
  );
};

export default UsageProgressBar;
