
import React from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface RefreshButtonProps {
  onRefresh: () => void;
}

const RefreshButton: React.FC<RefreshButtonProps> = ({ onRefresh }) => {
  const handleRefresh = async () => {
    try {
      // Call the refresh function locally
      onRefresh();
      
      // Notify the user
      toast.info('Refreshing settings from database...');
      
      // Call the webhook to invalidate all client caches
      // This is a lightweight approach - we're just notifying the server
      // that settings have changed, but we're not waiting for a response
      await supabase.functions.invoke('invalidate-settings-cache', {
        body: { action: 'invalidate' }
      }).catch(error => {
        console.log('Cache invalidation not available or failed:', error);
      });
    } catch (error) {
      console.error('Error refreshing settings:', error);
    }
  };
  
  return (
    <div className="mt-8">
      <Button 
        variant="outline" 
        onClick={handleRefresh}
        className="w-full"
      >
        Refresh All Settings
      </Button>
    </div>
  );
};

export default RefreshButton;
