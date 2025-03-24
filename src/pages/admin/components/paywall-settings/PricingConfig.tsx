
import React from 'react';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DollarSign } from 'lucide-react';

interface PricingConfigProps {
  monthlyPrice: number;
  yearlyPrice: number;
  yearlyDiscountPercent: number;
  onMonthlyPriceChange: (value: string) => void;
  onYearlyPriceChange: (value: string) => void;
  onYearlyDiscountChange: (value: number[]) => void;
  disabled: boolean;
}

const PricingConfig: React.FC<PricingConfigProps> = ({
  monthlyPrice,
  yearlyPrice,
  yearlyDiscountPercent,
  onMonthlyPriceChange,
  onYearlyPriceChange,
  onYearlyDiscountChange,
  disabled
}) => {
  return (
    <div className="space-y-6 pt-2">
      <h3 className="font-medium">Pricing Configuration</h3>
      
      <div className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="monthlyPrice">Monthly Price ($)</Label>
          <div className="relative">
            <DollarSign className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
            <Input
              id="monthlyPrice"
              type="number"
              min="0.99"
              step="0.01"
              value={monthlyPrice}
              onChange={(e) => onMonthlyPriceChange(e.target.value)}
              className="pl-9"
              disabled={disabled}
            />
          </div>
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="yearlyPrice">Yearly Price ($)</Label>
          <div className="relative">
            <DollarSign className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
            <Input
              id="yearlyPrice"
              type="number"
              min="0.99"
              step="0.01"
              value={yearlyPrice}
              onChange={(e) => onYearlyPriceChange(e.target.value)}
              className="pl-9"
              disabled={disabled}
            />
          </div>
        </div>
        
        <div>
          <div className="flex justify-between mb-2">
            <Label htmlFor="yearlyDiscount">Yearly Discount Percentage</Label>
            <span className="text-sm font-medium">{yearlyDiscountPercent}%</span>
          </div>
          <Slider
            id="yearlyDiscount"
            value={[yearlyDiscountPercent]}
            min={0}
            max={50}
            step={1}
            onValueChange={onYearlyDiscountChange}
            disabled={disabled}
          />
          <div className="flex justify-between mt-1 text-xs text-muted-foreground">
            <span>0%</span>
            <span>25%</span>
            <span>50%</span>
          </div>
          
          {monthlyPrice && yearlyPrice && (
            <p className="text-sm text-muted-foreground mt-2">
              Yearly price (${yearlyPrice.toFixed(2)}) is {Math.round((1 - (yearlyPrice / (monthlyPrice * 12))) * 100)}% off monthly pricing (${(monthlyPrice * 12).toFixed(2)})
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PricingConfig;
