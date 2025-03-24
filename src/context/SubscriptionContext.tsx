
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/auth';
import { toast } from 'sonner';

interface PricingInfo {
  monthlyPrice: number;
  yearlyPrice: number;
  yearlyDiscountPercent: number;
}

interface SubscriptionContextType {
  scanCount: number;
  isSubscribed: boolean;
  freeTierLimit: number;
  paywallEnabled: boolean;
  remainingScans: number;
  canScan: boolean;
  incrementScanCount: () => Promise<boolean>;
  subscriptionEndDate: Date | null;
  loadingSubscription: boolean;
  pricing: PricingInfo | null;
}

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
    const loadAppSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('app_settings')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1);

        if (error) {
          console.error('Error loading app settings:', error);
          return;
        }

        if (data && data.length > 0) {
          setPaywallEnabled(data[0].paywall_enabled);
          setFreeTierLimit(data[0].free_tier_limit);
          
          // Load pricing information
          setPricing({
            monthlyPrice: data[0].monthly_price || 4.99,
            yearlyPrice: data[0].yearly_price || 49.99,
            yearlyDiscountPercent: data[0].yearly_discount_percent || 15
          });
        }
      } catch (error) {
        console.error('Failed to load app settings:', error);
      }
    };

    loadAppSettings();
  }, []);

  // Load user subscription data
  useEffect(() => {
    const loadSubscriptionData = async () => {
      if (!isAuthenticated || !user) {
        setLoadingSubscription(false);
        return;
      }

      setLoadingSubscription(true);
      try {
        const { data, error } = await supabase
          .from('user_subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error) {
          if (error.code !== 'PGRST116') { // not_found error
            console.error('Error loading subscription data:', error);
          }
          // Create subscription record if not found
          await createSubscriptionRecord(user.id);
          setLoadingSubscription(false);
          return;
        }

        if (data) {
          setScanCount(data.scan_count || 0);
          setIsSubscribed(data.is_subscribed || false);
          setSubscriptionEndDate(data.subscription_end ? new Date(data.subscription_end) : null);
        }
      } catch (error) {
        console.error('Failed to load subscription data:', error);
      } finally {
        setLoadingSubscription(false);
      }
    };

    loadSubscriptionData();
  }, [isAuthenticated, user]);

  // Create a new subscription record for a user
  const createSubscriptionRecord = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('user_subscriptions')
        .insert([
          { user_id: userId, scan_count: 0, is_subscribed: false }
        ]);

      if (error) {
        console.error('Error creating subscription record:', error);
      }
    } catch (error) {
      console.error('Failed to create subscription record:', error);
    }
  };

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
        try {
          const newCount = scanCount + 1;
          const { error } = await supabase
            .from('user_subscriptions')
            .update({ scan_count: newCount, updated_at: new Date().toISOString() })
            .eq('user_id', user.id);

          if (!error) {
            setScanCount(newCount);
          } else {
            console.error('Error updating scan count:', error);
          }
        } catch (error) {
          console.error('Failed to update scan count:', error);
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
      const { error } = await supabase
        .from('user_subscriptions')
        .update({ scan_count: newCount, updated_at: new Date().toISOString() })
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating scan count:', error);
        return true; // Allow scan even if update fails
      }

      setScanCount(newCount);
      
      // Show warning when approaching limit
      if (freeTierLimit - newCount <= 5 && freeTierLimit - newCount > 0) {
        toast.warning(`You have ${freeTierLimit - newCount} free scans remaining.`);
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
