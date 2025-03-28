
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RefreshCw } from 'lucide-react';

interface UserSearchFormProps {
  email: string;
  setEmail: (email: string) => void;
  searchUser: () => Promise<void>;
  isLoading: boolean;
}

const UserSearchForm: React.FC<UserSearchFormProps> = ({
  email,
  setEmail,
  searchUser,
  isLoading
}) => {
  return (
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
              "Search"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UserSearchForm;
