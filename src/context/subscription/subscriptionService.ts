
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { PricingInfo } from './types';

export const loadAppSettings = async (
  setPaywallEnabled: (value: boolean) => void,
  setFreeTierLimit: (value: number) => void,
  setPricing: (value: PricingInfo) => void
) => {
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
      console.log('App settings loaded:', data[0]);
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

export const loadSubscriptionData = async (
  userId: string,
  setScanCount: (value: number) => void,
  setIsSubscribed: (value: boolean) => void,
  setSubscriptionEndDate: (value: Date | null) => void,
  createSubscriptionRecord: (userId: string) => Promise<void>
) => {
  try {
    const { data, error } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code !== 'PGRST116') { // not_found error
        console.error('Error loading subscription data:', error);
      }
      // Create subscription record if not found
      await createSubscriptionRecord(userId);
      return;
    }

    if (data) {
      console.log('Subscription data loaded:', data);
      setScanCount(data.scan_count || 0);
      setIsSubscribed(data.is_subscribed || false);
      setSubscriptionEndDate(data.subscription_end ? new Date(data.subscription_end) : null);
    }
  } catch (error) {
    console.error('Failed to load subscription data:', error);
  }
};

export const createSubscriptionRecord = async (userId: string) => {
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

export const updateScanCount = async (userId: string, newCount: number): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('user_subscriptions')
      .update({ scan_count: newCount, updated_at: new Date().toISOString() })
      .eq('user_id', userId);

    if (error) {
      console.error('Error updating scan count:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Failed to update scan count:', error);
    return false;
  }
};

export const showRemainingScansMessage = (freeTierLimit: number, newCount: number, paywallEnabled: boolean) => {
  // Only show warning when paywall is enabled
  if (!paywallEnabled) return;
  
  // Show warning when approaching limit
  const remaining = freeTierLimit - newCount;
  if (remaining <= 5 && remaining > 0) {
    toast.warning(`You have ${remaining} free scans remaining.`);
  }
};
