
import React from 'react';
import { Button } from '@/components/ui/button';

interface UserDetailsPanelProps {
  userDetails: any;
  handleResetScans: () => void;
}

const UserDetailsPanel: React.FC<UserDetailsPanelProps> = ({
  userDetails,
  handleResetScans
}) => {
  if (!userDetails) return null;

  return (
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
  );
};

export default UserDetailsPanel;
