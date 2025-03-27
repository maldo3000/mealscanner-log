
import React, { createContext, useContext, useEffect } from 'react';
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
    canScan,
    refreshSubscriptionData
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

  // Refresh subscription data when profile page is loaded
  useEffect(() => {
    // Listen for route changes
    const handleRouteChange = () => {
      const path = window.location.pathname;
      if (path === '/profile' || path === '/subscription') {
        console.log('Profile or Subscription page detected, refreshing subscription data');
        refreshSubscriptionData();
      }
    };

    // Call once on first load
    handleRouteChange();

    // Add event listener for popstate (back/forward navigation)
    window.addEventListener('popstate', handleRouteChange);
    
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, [refreshSubscriptionData]);

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
        setIsSubscribed,
        refreshSubscriptionData
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
