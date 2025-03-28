
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import UserSearchForm from './UserSearchForm';
import UserDetailsPanel from './UserDetailsPanel';
import ConfirmResetDialog from './ConfirmResetDialog';
import { useUserManagement } from './useUserManagement';

const UserManagement: React.FC = () => {
  const {
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
  } = useUserManagement();
  
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
          <UserSearchForm
            email={email}
            setEmail={setEmail}
            searchUser={searchUser}
            isLoading={isLoading}
          />

          {userDetails && (
            <UserDetailsPanel
              userDetails={userDetails}
              handleResetScans={handleResetScans}
            />
          )}
        </CardContent>
      </Card>

      <ConfirmResetDialog
        isOpen={confirmDialogOpen}
        onOpenChange={setConfirmDialogOpen}
        onConfirm={confirmResetScans}
        isResetting={isResetting}
        userEmail={userDetails?.email}
      />
    </div>
  );
};

export default UserManagement;
