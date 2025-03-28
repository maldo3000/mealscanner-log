
import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export const useUserManagement = () => {
  const [email, setEmail] = useState('');
  const [userDetails, setUserDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  
  const searchUser = async () => {
    if (!email) {
      toast.error('Please enter an email address');
      return;
    }

    setIsLoading(true);
    setUserDetails(null);

    try {
      // First, get the user ID directly from auth.users using the edge function
      const { data: userData, error } = await supabase.functions.invoke('manage-user-scans', {
        body: { 
          action: 'find-user-by-email',
          email: email,
          adminVerified: true
        }
      });

      if (error || !userData?.success) {
        console.error('Error finding user:', error || userData?.error);
        toast.error('User not found');
        setIsLoading(false);
        return;
      }

      const userId = userData.userId;
      if (!userId) {
        toast.error('User not found');
        setIsLoading(false);
        return;
      }

      // Now get detailed user info using the found user ID
      const { data: userDetailsData, error: detailsError } = await supabase.functions.invoke('manage-user-scans', {
        body: { 
          action: 'get-user-details',
          userId: userId,
          adminVerified: true
        }
      });

      if (detailsError || !userDetailsData?.success) {
        console.error('Error fetching user details:', detailsError || userDetailsData?.error);
        toast.error('Failed to fetch user details');
        setIsLoading(false);
        return;
      }

      setUserDetails(userDetailsData.user);
    } catch (error) {
      console.error('Error searching for user:', error);
      toast.error('An error occurred while searching for the user');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetScans = () => {
    setConfirmDialogOpen(true);
  };

  const confirmResetScans = async () => {
    if (!userDetails?.user_id) {
      toast.error('No user selected');
      setConfirmDialogOpen(false);
      return;
    }

    setIsResetting(true);
    try {
      const { data, error } = await supabase.functions.invoke('manage-user-scans', {
        body: { 
          action: 'reset-scans',
          userId: userDetails.user_id,
          adminVerified: true
        }
      });

      if (error || !data.success) {
        console.error('Error resetting scan count:', error || data.error);
        toast.error('Failed to reset scan count');
        setConfirmDialogOpen(false);
        setIsResetting(false);
        return;
      }

      toast.success('Scan count reset successfully');
      
      // Refresh user details
      const refreshResult = await supabase.functions.invoke('manage-user-scans', {
        body: { 
          action: 'get-user-details',
          userId: userDetails.user_id,
          adminVerified: true
        }
      });
      
      if (!refreshResult.error && refreshResult.data.success) {
        setUserDetails(refreshResult.data.user);
      }
    } catch (error) {
      console.error('Error resetting scan count:', error);
      toast.error('An error occurred while resetting the scan count');
    } finally {
      setConfirmDialogOpen(false);
      setIsResetting(false);
    }
  };

  return {
    email,
    setEmail,
    userDetails,
    isLoading,
    isResetting,
    confirmDialogOpen,
    setConfirmDialogOpen,
    searchUser,
    handleResetScans,
    confirmResetScans
  };
};
