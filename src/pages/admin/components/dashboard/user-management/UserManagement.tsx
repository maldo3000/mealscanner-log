
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import UsersList from './UsersList';
import ConfirmResetDialog from './ConfirmResetDialog';
import { useUserManagement } from './useUserManagement';

const UserManagement: React.FC = () => {
  const {
    users,
    isLoading,
    isResetting,
    selectedUser,
    confirmDialogOpen,
    setConfirmDialogOpen,
    handleResetScans,
    confirmResetScans,
    handleSelectUser
  } = useUserManagement();
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>
            View and manage all users in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UsersList 
            users={users}
            isLoading={isLoading}
            selectedUser={selectedUser}
            onSelectUser={handleSelectUser}
            onResetScans={handleResetScans}
          />
        </CardContent>
      </Card>

      <ConfirmResetDialog
        isOpen={confirmDialogOpen}
        onOpenChange={setConfirmDialogOpen}
        onConfirm={confirmResetScans}
        isResetting={isResetting}
        userEmail={selectedUser?.email}
      />
    </div>
  );
};

export default UserManagement;
