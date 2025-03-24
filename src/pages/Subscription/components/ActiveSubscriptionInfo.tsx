
import React from 'react';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { NavigateFunction } from 'react-router-dom';

interface ActiveSubscriptionInfoProps {
  navigate: NavigateFunction;
}

const ActiveSubscriptionInfo: React.FC<ActiveSubscriptionInfoProps> = ({ navigate }) => {
  return (
    <div className="container max-w-4xl py-10">
      <div className="text-center space-y-4">
        <div className="bg-primary/10 p-4 rounded-full inline-block mx-auto">
          <Check className="h-12 w-12 text-primary" />
        </div>
        <h1 className="text-3xl font-bold">You're Subscribed!</h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Thank you for subscribing to MealScanner Pro. You have unlimited access to all features.
        </p>
        <Button onClick={() => navigate('/capture')} className="mt-6">
          Continue to Capture
        </Button>
      </div>
    </div>
  );
};

export default ActiveSubscriptionInfo;
