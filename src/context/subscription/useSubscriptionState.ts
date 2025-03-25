
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth';
import { PricingInfo } from './types';
import { 
  loadAppSettings, 
  loadSubscriptionData, 
  createSubscriptionRecord,
} from './subscriptionService';

export const useSubscriptionState = () => {
  const { user, isAuthenticated } = useAuth();
  const [scanCount, setScanCount] = useState<number>(0);
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [freeTierLimit, setFreeTierLimit] = useState<number>(80);
  const [paywallEnabled, setPaywallEnabled] = useState<boolean>(false);
  const [subscriptionEndDate, setSubscriptionEndDate] = useState<Date | null>(null);
  const [loadingSubscription, setLoadingSubscription] = useState<boolean>(true);
  const [pricing, setPricing] = useState<PricingInfo | null>(null);

  // Computed properties
  const remainingScans = Math.max(0, freeTierLimit - scanCount);
  const canScan = isSubscribed || !paywallEnabled || remainingScans > 0;

  // Load app settings
  useEffect(() => {
    console.log('Loading app settings...');
    loadAppSettings(setPaywallEnabled, setFreeTierLimit, setPricing);
  }, []);

  // Load user subscription data
  useEffect(() => {
    const fetchSubscriptionData = async () => {
      if (!isAuthenticated || !user) {
        setLoadingSubscription(false);
        return;
      }

      setLoadingSubscription(true);
      await loadSubscriptionData(
        user.id, 
        setScanCount, 
        setIsSubscribed, 
        setSubscriptionEndDate,
        createSubscriptionRecord
      );
      setLoadingSubscription(false);
    };

    fetchSubscriptionData();
  }, [isAuthenticated, user]);

  // Debug state changes
  useEffect(() => {
    console.log('Subscription context state updated:', {
      paywallEnabled,
      freeTierLimit,
      scanCount,
      remainingScans,
      isSubscribed,
      canScan,
    });
  }, [paywallEnabled, freeTierLimit, scanCount, remainingScans, isSubscribed, canScan]);

  return {
    // State
    scanCount,
    setScanCount,
    isSubscribed,
    setIsSubscribed,
    freeTierLimit,
    paywallEnabled,
    subscriptionEndDate,
    loadingSubscription,
    pricing,
    
    // Computed properties
    remainingScans,
    canScan,
  };
};
