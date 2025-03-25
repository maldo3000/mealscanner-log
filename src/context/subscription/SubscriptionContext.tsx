
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@/context/auth';
import { toast } from 'sonner';
import { SubscriptionContextType, PricingInfo } from './types';
import { 
  loadAppSettings, 
  createSubscriptionRecord, 
  loadSubscriptionData, 
  updateScanCount,
  showRemainingScansMessage
} from './subscriptionService';

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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

  // Increment scan count and check if user can continue scanning
  const incrementScanCount = async (): Promise<boolean> => {
    if (!isAuthenticated || !user) {
      // Allow anonymous users to scan without limit
      return true;
    }

    // If already subscribed or paywall is disabled, allow scanning
    if (isSubscribed || !paywallEnabled) {
      // Still increment count for analytics, but don't limit
      if (isAuthenticated && user) {
        const newCount = scanCount + 1;
        const success = await updateScanCount(user.id, newCount);
        if (success) {
          setScanCount(newCount);
        }
      }
      return true;
    }

    // Check if user has reached the free tier limit
    if (scanCount >= freeTierLimit) {
      toast.error(`You've reached your free scan limit of ${freeTierLimit}. Please subscribe to continue.`);
      return false;
    }

    // Increment scan count
    try {
      const newCount = scanCount + 1;
      const success = await updateScanCount(user.id, newCount);
      
      if (success) {
        setScanCount(newCount);
        showRemainingScansMessage(freeTierLimit, newCount, paywallEnabled);
      }
      
      return true;
    } catch (error) {
      console.error('Failed to update scan count:', error);
      return true; // Allow scan even if update fails
    }
  };

  return (
    <SubscriptionContext.Provider
      value={{
        scanCount,
        isSubscribed,
        freeTierLimit,
        paywallEnabled,
        remainingScans,
        canScan,
        incrementScanCount,
        subscriptionEndDate,
        loadingSubscription,
        pricing
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};
