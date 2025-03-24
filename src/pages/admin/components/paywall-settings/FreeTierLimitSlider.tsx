
import React from 'react';
import { Slider } from '@/components/ui/slider';

interface FreeTierLimitSliderProps {
  freeTierLimit: number;
  onChange: (value: number[]) => void;
  disabled: boolean;
}

const FreeTierLimitSlider: React.FC<FreeTierLimitSliderProps> = ({ 
  freeTierLimit, 
  onChange, 
  disabled 
}) => {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-medium">Free Tier Limit</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Set the number of free scans before paywall is enforced
        </p>
        
        <div className="px-4">
          <Slider
            value={[freeTierLimit]}
            min={10}
            max={200}
            step={5}
            onValueChange={onChange}
            disabled={disabled}
          />
          
          <div className="flex justify-between mt-2 text-sm text-muted-foreground">
            <span>10</span>
            <span className="font-medium text-base text-foreground">
              {freeTierLimit} scans
            </span>
            <span>200</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FreeTierLimitSlider;
