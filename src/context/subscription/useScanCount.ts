
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
  // Verify scan permissions with the backend and increment count if allowed
  const incrementScanCount = async (): Promise<boolean> => {
    if (!isAuthenticated || !userId) {
      // Allow anonymous users to scan without limit
      return true;
    }

    try {
      // Call the verify-scan-limit edge function to check if scanning is allowed
      const { data, error } = await supabase.functions.invoke('verify-scan-limit');
      
      if (error) {
        console.error('Error verifying scan limit:', error);
        // Allow scan on error, but don't update the count
        toast.error('Error verifying scan permissions');
        return true;
      }
      
      console.log('Scan verification result:', data);
      
      // Update local state with the latest values from the server
      if (data.scanCount !== undefined) {
        setScanCount(data.scanCount);
      }
      
      // Show message about remaining scans if available
      if (data.remainingScans !== undefined && data.paywallEnabled) {
        showRemainingScansMessage(freeTierLimit, scanCount, true);
      }
      
      // If user can't scan, inform them and redirect to subscription page
      if (!data.canScan) {
        toast.error(`You've reached your free scan limit of ${freeTierLimit}. Please subscribe to continue.`);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Failed to verify scan permissions:', error);
      // Default to allowing scan on error
      return true;
    }
  };

  return { incrementScanCount };
};
