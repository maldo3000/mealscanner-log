
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PaywallSettings from '../PaywallSettings';
import InviteToggle from '../InviteToggle';
import InviteCodeGenerator from '../InviteCodeGenerator';
import InviteCodeList from '../InviteCodeList';

interface DashboardTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
}

const DashboardTabs: React.FC<DashboardTabsProps> = ({ activeTab, onTabChange }) => {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <TabsList className="mb-6">
        <TabsTrigger value="paywall">Paywall Settings</TabsTrigger>
        <TabsTrigger value="invite">Invite Codes</TabsTrigger>
      </TabsList>
      
      <TabsContent value="paywall">
        <PaywallSettings />
      </TabsContent>
      
      <TabsContent value="invite">
        <div className="grid gap-6">
          <InviteToggle />
          <InviteCodeGenerator />
          <InviteCodeList />
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default DashboardTabs;
