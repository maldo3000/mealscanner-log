
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertTriangle } from 'lucide-react';

interface RefreshButtonProps {
  onRefresh: () => void;
}

const RefreshButton: React.FC<RefreshButtonProps> = ({ onRefresh }) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  
  const handleRefreshRequest = () => {
    setConfirmDialogOpen(true);
  };
  
  const handleConfirmRefresh = async () => {
    setIsVerifying(true);
    try {
      // First, verify that the user is still an admin
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Authentication required');
      }
      
      // Get admin status using a secure RPC call
      const { data: isAdmin, error: roleCheckError } = await supabase.rpc('has_role', { 
        _role: 'admin' 
      });
      
      if (roleCheckError || !isAdmin) {
        throw new Error('Admin privileges required');
      }
      
      // Call the refresh function locally
      onRefresh();
      
      // Notify the user
      toast.info('Refreshing settings from database...');
      
      // Call the webhook to invalidate all client caches
      await supabase.functions.invoke('invalidate-settings-cache', {
        body: { 
          action: 'invalidate',
          adminVerified: true
        }
      }).catch(error => {
        console.log('Cache invalidation not available or failed:', error);
      });
      
      setConfirmDialogOpen(false);
      toast.success('Settings refreshed successfully');
    } catch (error) {
      console.error('Error refreshing settings:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to refresh settings');
    } finally {
      setIsVerifying(false);
    }
  };
  
  return (
    <>
      <div className="mt-8">
        <Button 
          variant="outline" 
          onClick={handleRefreshRequest}
          className="w-full"
        >
          Refresh All Settings
        </Button>
      </div>
      
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Confirm Admin Action
            </DialogTitle>
            <DialogDescription>
              You are about to refresh all application settings. This action will affect all users.
              Please confirm that you want to proceed.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter className="flex gap-2 pt-4">
            <Button 
              variant="outline" 
              onClick={() => setConfirmDialogOpen(false)}
              disabled={isVerifying}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmRefresh}
              disabled={isVerifying}
            >
              {isVerifying ? 'Verifying...' : 'Confirm Refresh'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RefreshButton;
