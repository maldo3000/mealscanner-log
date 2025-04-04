
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PaywallSettings from '../PaywallSettings';
import InviteCodeGenerator from '../InviteCodeGenerator';
import InviteCodeList from '../InviteCodeList';
import InviteToggle from '../InviteToggle';
import UserManagement from './user-management';
import { Users } from 'lucide-react';

interface DashboardTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
}

const DashboardTabs: React.FC<DashboardTabsProps> = ({ activeTab, onTabChange }) => {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="space-y-6">
      <TabsList className="w-full">
        <TabsTrigger value="paywall" className="flex-1">Paywall Settings</TabsTrigger>
        <TabsTrigger value="invite" className="flex-1">Invite Codes</TabsTrigger>
        <TabsTrigger value="users" className="flex-1 flex items-center justify-center gap-1">
          <Users className="h-4 w-4" />
          <span>User Management</span>
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="paywall" className="space-y-6">
        <PaywallSettings />
      </TabsContent>
      
      <TabsContent value="invite" className="space-y-6">
        <InviteToggle />
        <InviteCodeGenerator />
        <InviteCodeList />
      </TabsContent>
      
      <TabsContent value="users" className="space-y-6">
        <UserManagement />
      </TabsContent>
    </Tabs>
  );
};

export default DashboardTabs;
