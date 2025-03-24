
import React from 'react';
import { Button } from '@/components/ui/button';
import { Leaf } from 'lucide-react';
import { NavigateFunction } from 'react-router-dom';

interface FreeSubscriptionInfoProps {
  navigate: NavigateFunction;
}

const FreeSubscriptionInfo: React.FC<FreeSubscriptionInfoProps> = ({ navigate }) => {
  return (
    <div className="container max-w-4xl py-10">
      <div className="text-center space-y-4">
        <Leaf className="h-12 w-12 text-primary mx-auto" />
        <h1 className="text-3xl font-bold">Subscription Not Required</h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          MealScanner is currently free to use without limits. Enjoy all features without a subscription!
        </p>
        <Button onClick={() => navigate('/capture')} className="mt-6">
          Continue to Capture
        </Button>
      </div>
    </div>
  );
};

export default FreeSubscriptionInfo;
