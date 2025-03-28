
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export const useUserManagement = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isResetting, setIsResetting] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  
  // Fetch users on mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    setUsers([]);

    try {
      const { data, error } = await supabase.functions.invoke('manage-user-scans', {
        body: { 
          action: 'get-all-users',
          adminVerified: true
        }
      });

      if (error || !data?.success) {
        console.error('Error fetching users:', error || data?.error);
        toast.error('Failed to fetch users');
        setIsLoading(false);
        return;
      }

      setUsers(data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('An error occurred while fetching users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectUser = (user: any) => {
    setSelectedUser(user);
  };

  const handleResetScans = () => {
    if (!selectedUser) {
      toast.error('No user selected');
      return;
    }
    setConfirmDialogOpen(true);
  };

  const confirmResetScans = async () => {
    if (!selectedUser?.id) {
      toast.error('No user selected');
      setConfirmDialogOpen(false);
      return;
    }

    setIsResetting(true);
    try {
      const { data, error } = await supabase.functions.invoke('manage-user-scans', {
        body: { 
          action: 'reset-scans',
          userId: selectedUser.id,
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
      
      // Refresh users list
      await fetchUsers();
      
      // Find and re-select the user in the updated list
      const updatedUser = users.find(u => u.id === selectedUser.id);
      if (updatedUser) {
        setSelectedUser(updatedUser);
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
    users,
    selectedUser,
    isLoading,
    isResetting,
    confirmDialogOpen,
    setConfirmDialogOpen,
    fetchUsers,
    handleSelectUser,
    handleResetScans,
    confirmResetScans
  };
};
