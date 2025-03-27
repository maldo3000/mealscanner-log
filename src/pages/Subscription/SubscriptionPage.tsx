
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '@/context/subscription';
import { useAuth } from '@/context/auth';
import { ArrowRight, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SubscriptionHeader from './components/SubscriptionHeader';
import FreeSubscriptionInfo from './components/FreeSubscriptionInfo';
import ActiveSubscriptionInfo from './components/ActiveSubscriptionInfo';
import SubscriptionPlanCards from './components/SubscriptionPlanCards';
import UsageProgressBar from './components/UsageProgressBar';

const SubscriptionPage: React.FC = () => {
  const { 
    isSubscribed, 
    scanCount, 
    freeTierLimit, 
    paywallEnabled, 
    pricing, 
    remainingScans,
    refreshSubscriptionData 
  } = useSubscription();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  // Make sure we're working with the latest pricing data by forcing a rerender when it changes
  const [pricingKey, setPricingKey] = useState(0);
  
  // Refresh subscription data when the subscription page is loaded
  useEffect(() => {
    console.log('Subscription page loaded, refreshing subscription data');
    refreshSubscriptionData();
  }, [refreshSubscriptionData]);
  
  useEffect(() => {
    // Update the key when pricing changes to force component to recalculate prices
    if (pricing) {
      setPricingKey(prev => prev + 1);
      console.log("Pricing updated:", pricing);
    }
  }, [pricing]);

  // Redirect to capture page if paywall is disabled
  useEffect(() => {
    if (!paywallEnabled) {
      navigate('/capture');
    }
  }, [paywallEnabled, navigate]);

  if (!paywallEnabled) {
    return <FreeSubscriptionInfo navigate={navigate} />;
  }

  if (isSubscribed) {
    return <ActiveSubscriptionInfo navigate={navigate} />;
  }

  return (
    <div className="container py-10">
      <SubscriptionHeader 
        scanCount={scanCount} 
        freeTierLimit={freeTierLimit} 
        billingCycle={billingCycle}
        setBillingCycle={setBillingCycle}
        pricing={pricing}
      />

      <SubscriptionPlanCards 
        billingCycle={billingCycle} 
        freeTierLimit={freeTierLimit} 
        pricing={pricing} 
        pricingKey={pricingKey}
      />

      {scanCount > 0 && (
        <UsageProgressBar 
          scanCount={scanCount} 
          freeTierLimit={freeTierLimit} 
        />
      )}
      
      <div className="mt-10 text-center text-sm text-muted-foreground flex items-center justify-center">
        <Lock className="h-4 w-4 mr-1" />
        Secure payment processing. Cancel anytime.
      </div>
      
      <div className="mt-6 text-center">
        <Button variant="link" onClick={() => navigate('/capture')}>
          Return to Meal Scanner
          <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default SubscriptionPage;
