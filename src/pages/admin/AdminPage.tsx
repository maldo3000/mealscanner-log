
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AccessDenied from './components/AccessDenied';
import PaywallSettings from './components/PaywallSettings';
import InviteToggle from './components/InviteToggle';
import InviteCodeGenerator from './components/InviteCodeGenerator';
import InviteCodeList from './components/InviteCodeList';

interface InviteCode {
  id: string;
  code: string;
  email: string | null;
  used: boolean;
  created_by: string;
  created_at: string;
  used_at: string | null;
  expires_at: string | null;
}

const AdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('paywall');
  const [paywallEnabled, setPaywallEnabled] = useState(false);
  const [inviteOnlyEnabled, setInviteOnlyEnabled] = useState(true);
  const [freeTierLimit, setFreeTierLimit] = useState(80);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [inviteCodes, setInviteCodes] = useState<InviteCode[]>([]);
  const [isLoadingCodes, setIsLoadingCodes] = useState(false);
  const { isAdmin, session } = useAuth();

  useEffect(() => {
    const loadSettings = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('app_settings')
          .select('paywall_enabled, free_tier_limit, invite_only_registration')
          .order('created_at', { ascending: false })
          .limit(1);

        if (error) {
          console.error('Error loading app settings:', error);
          toast.error('Failed to load settings');
          return;
        }

        if (data && data.length > 0) {
          console.log('Loaded app settings:', data[0]);
          setPaywallEnabled(data[0].paywall_enabled);
          setFreeTierLimit(data[0].free_tier_limit);
          
          // Be explicit about the boolean value
          const inviteOnly = !!data[0].invite_only_registration;
          console.log(`Setting inviteOnlyEnabled to: ${inviteOnly}`);
          setInviteOnlyEnabled(inviteOnly);
        } else {
          console.log('No app settings found');
        }
      } catch (error) {
        console.error('Failed to load app settings:', error);
        toast.error('Failed to load settings');
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
    loadInviteCodes();
  }, []);

  const loadInviteCodes = async () => {
    if (!session?.access_token) return;
    
    try {
      setIsLoadingCodes(true);
      
      const response = await fetch(`${window.location.origin}/functions/v1/invite-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ action: 'list' })
      });
      
      if (!response.ok) {
        throw new Error('Failed to load invite codes');
      }
      
      const result = await response.json();
      setInviteCodes(result.codes || []);
    } catch (error) {
      console.error('Error loading invite codes:', error);
      toast.error('Failed to load invite codes');
    } finally {
      setIsLoadingCodes(false);
    }
  };

  // Function to refresh app settings - can be called after saving
  const refreshSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('paywall_enabled, free_tier_limit, invite_only_registration')
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Error refreshing app settings:', error);
        return;
      }

      if (data && data.length > 0) {
        console.log('Refreshed app settings:', data[0]);
        setPaywallEnabled(data[0].paywall_enabled);
        setFreeTierLimit(data[0].free_tier_limit);
        
        // Be explicit about the boolean value
        const inviteOnly = !!data[0].invite_only_registration;
        console.log(`Refreshed inviteOnlyEnabled to: ${inviteOnly}`);
        setInviteOnlyEnabled(inviteOnly);
      }
    } catch (error) {
      console.error('Failed to refresh app settings:', error);
    }
  };

  if (!isAdmin) {
    return <AccessDenied />;
  }

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
          <PaywallSettings 
            paywallEnabled={paywallEnabled}
            setPaywallEnabled={setPaywallEnabled}
            freeTierLimit={freeTierLimit}
            setFreeTierLimit={setFreeTierLimit}
            session={session}
            isSaving={isSaving}
            setIsSaving={setIsSaving}
          />
        </TabsContent>
        
        <TabsContent value="invite">
          <div className="grid gap-6">
            <InviteToggle 
              inviteOnlyEnabled={inviteOnlyEnabled}
              setInviteOnlyEnabled={(value) => {
                console.log(`setInviteOnlyEnabled called with value: ${value}`);
                setInviteOnlyEnabled(value);
                // Refresh settings from the database after changing the invite state
                setTimeout(refreshSettings, 1000);
              }}
              session={session}
              isSaving={isSaving}
              setIsSaving={setIsSaving}
            />
            
            <InviteCodeGenerator 
              session={session}
              loadInviteCodes={loadInviteCodes}
            />
            
            <InviteCodeList 
              inviteCodes={inviteCodes}
              isLoadingCodes={isLoadingCodes}
              session={session}
              loadInviteCodes={loadInviteCodes}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPage;
