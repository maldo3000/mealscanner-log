
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PricingInfo } from '@/context/subscription';

interface SubscriptionHeaderProps {
  scanCount: number;
  freeTierLimit: number;
  billingCycle: 'monthly' | 'yearly';
  setBillingCycle: (value: 'monthly' | 'yearly') => void;
  pricing?: PricingInfo | null;
}

const SubscriptionHeader: React.FC<SubscriptionHeaderProps> = ({ 
  scanCount, 
  freeTierLimit, 
  billingCycle, 
  setBillingCycle,
  pricing
}) => {
  const remainingScans = Math.max(0, freeTierLimit - scanCount);

  return (
    <div className="text-center mb-10">
      <h1 className="text-3xl font-bold">Upgrade Your MealScanner Experience</h1>
      <p className="text-muted-foreground mt-2 max-w-xl mx-auto">
        {scanCount >= freeTierLimit 
          ? "You've reached your free scan limit. Subscribe to continue analyzing meals." 
          : `You have ${remainingScans} free scans remaining.`}
      </p>

      <div className="mt-6 max-w-xs mx-auto">
        <Tabs 
          defaultValue="monthly" 
          value={billingCycle} 
          onValueChange={(value) => setBillingCycle(value as 'monthly' | 'yearly')}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="yearly">
              Yearly <span className="ml-1 text-xs text-green-500">{pricing?.yearlyDiscountPercent || 15}% off</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
};

export default SubscriptionHeader;
