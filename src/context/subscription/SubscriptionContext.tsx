
import React, { createContext, useContext } from 'react';
import { useAuth } from '@/context/auth';
import { SubscriptionContextType } from './types';
import { useSubscriptionState } from './useSubscriptionState';
import { useScanCount } from './useScanCount';

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const {
    scanCount,
    setScanCount,
    isSubscribed,
    setIsSubscribed,
    freeTierLimit,
    setFreeTierLimit,
    paywallEnabled,
    setPaywallEnabled,
    subscriptionEndDate,
    loadingSubscription,
    pricing,
    remainingScans,
    canScan
  } = useSubscriptionState();

  const { incrementScanCount } = useScanCount(
    isAuthenticated,
    user?.id,
    isSubscribed,
    paywallEnabled,
    scanCount,
    setScanCount,
    freeTierLimit,
    setFreeTierLimit // Pass setFreeTierLimit to update from server
  );

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
        pricing,
        setIsSubscribed
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
