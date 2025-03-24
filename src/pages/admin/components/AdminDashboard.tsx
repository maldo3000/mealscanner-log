
import React from 'react';
import { useAdmin } from '../context/AdminContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import PaywallSettings from './PaywallSettings';
import InviteToggle from './InviteToggle';
import InviteCodeGenerator from './InviteCodeGenerator';
import InviteCodeList from './InviteCodeList';

const AdminDashboard: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    isLoading,
    loadSettings,
    loadInviteCodes
  } = useAdmin();

  if (isLoading) {
    return (
      <div className="container py-10">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-64 bg-gray-200 rounded"></div>
          <div className="h-4 w-full max-w-md bg-gray-200 rounded"></div>
          <div className="h-40 w-full max-w-md bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Admin Settings</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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

      {/* Refresh button to manually reload settings from database */}
      <div className="mt-8">
        <Button 
          variant="outline" 
          onClick={() => {
            loadSettings();
            loadInviteCodes();
            toast.info('Refreshing settings from database...');
          }}
          className="w-full"
        >
          Refresh All Settings
        </Button>
      </div>
    </div>
  );
};

export default AdminDashboard;
