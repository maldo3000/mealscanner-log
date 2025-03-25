
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { updateScanCount, showRemainingScansMessage } from './subscriptionService';

export const useScanCount = (
  isAuthenticated: boolean,
  userId: string | undefined,
  isSubscribed: boolean,
  paywallEnabled: boolean,
  scanCount: number,
  setScanCount: (count: number) => void,
  freeTierLimit: number
) => {
  // Increment scan count and check if user can continue scanning
  const incrementScanCount = async (): Promise<boolean> => {
    if (!isAuthenticated || !userId) {
      // Allow anonymous users to scan without limit
      return true;
    }

    // If already subscribed or paywall is disabled, allow scanning
    if (isSubscribed || !paywallEnabled) {
      // Still increment count for analytics, but don't limit
      if (isAuthenticated && userId) {
        const newCount = scanCount + 1;
        const success = await updateScanCount(userId, newCount);
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
      const success = await updateScanCount(userId, newCount);
      
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

  return { incrementScanCount };
};
