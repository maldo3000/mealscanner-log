
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/CustomBadge';
import { RefreshCw } from 'lucide-react';

interface UsersListProps {
  users: any[];
  isLoading: boolean;
  selectedUser: any | null;
  onSelectUser: (user: any) => void;
  onResetScans: () => void;
}

const UsersList: React.FC<UsersListProps> = ({
  users,
  isLoading,
  selectedUser,
  onSelectUser,
  onResetScans
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center p-6">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (users.length === 0) {
    return <p className="text-center py-6">No users found</p>;
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Scans</TableHead>
              <TableHead>Subscription</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow 
                key={user.id}
                className={selectedUser?.id === user.id ? 'bg-muted/50' : ''}
                onClick={() => onSelectUser(user)}
              >
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.scan_count || 0}</TableCell>
                <TableCell>
                  {user.is_subscribed ? (
                    <Badge variant="success">Active</Badge>
                  ) : (
                    <Badge variant="outline">Free</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectUser(user);
                      onResetScans();
                    }}
                    disabled={(user.scan_count || 0) === 0}
                  >
                    Reset Scans
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {selectedUser && (
        <div className="border rounded-md p-4">
          <h3 className="font-medium text-lg mb-2">Selected User Details</h3>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
            <dt className="text-sm font-medium text-muted-foreground">Email:</dt>
            <dd>{selectedUser.email}</dd>
            
            <dt className="text-sm font-medium text-muted-foreground">Scan Count:</dt>
            <dd>{selectedUser.scan_count || 0}</dd>
            
            <dt className="text-sm font-medium text-muted-foreground">Subscription:</dt>
            <dd>{selectedUser.is_subscribed ? 'Active' : 'Inactive'}</dd>
            
            {selectedUser.subscription_end && (
              <>
                <dt className="text-sm font-medium text-muted-foreground">Expires:</dt>
                <dd>{new Date(selectedUser.subscription_end).toLocaleDateString()}</dd>
              </>
            )}
          </dl>
        </div>
      )}
    </div>
  );
};

export default UsersList;
