
import React, { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Search, RefreshCw } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

const UserManagement: React.FC = () => {
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

      if (!userData.userId) {
        toast.error('User not found');
        setIsLoading(false);
        return;
      }

      // Now get detailed user info using the found user ID
      const { data: userDetailsData, error: detailsError } = await supabase.functions.invoke('manage-user-scans', {
        body: { 
          action: 'get-user-details',
          userId: userData.userId,
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>
            Search for users by email and manage their scan count
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <div className="flex-1">
              <Label htmlFor="email">User Email</Label>
              <div className="flex mt-1">
                <Input
                  id="email"
                  placeholder="user@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  onClick={searchUser} 
                  disabled={isLoading}
                  className="ml-2"
                >
                  {isLoading ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-1" />
                      Search
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {userDetails && (
            <div className="mt-6 border rounded-md p-4">
              <h3 className="font-medium text-lg mb-2">User Details</h3>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
                <dt className="text-sm font-medium text-muted-foreground">Email:</dt>
                <dd>{userDetails.email}</dd>
                
                <dt className="text-sm font-medium text-muted-foreground">Scan Count:</dt>
                <dd>{userDetails.scan_count}</dd>
                
                <dt className="text-sm font-medium text-muted-foreground">Subscription:</dt>
                <dd>{userDetails.is_subscribed ? 'Active' : 'Inactive'}</dd>
                
                {userDetails.subscription_end && (
                  <>
                    <dt className="text-sm font-medium text-muted-foreground">Expires:</dt>
                    <dd>{new Date(userDetails.subscription_end).toLocaleDateString()}</dd>
                  </>
                )}
              </dl>
              <div className="mt-4">
                <Button 
                  variant="destructive" 
                  onClick={handleResetScans}
                  disabled={userDetails.scan_count === 0}
                >
                  Reset Scan Count
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Confirm Reset Scan Count
            </DialogTitle>
            <DialogDescription>
              This will reset the scan count to 0 for user: {userDetails?.email}.
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter className="flex gap-2 pt-4">
            <Button 
              variant="outline" 
              onClick={() => setConfirmDialogOpen(false)}
              disabled={isResetting}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={confirmResetScans}
              disabled={isResetting}
            >
              {isResetting ? 'Resetting...' : 'Confirm Reset'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;
