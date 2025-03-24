
import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Define types for our context
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

interface AdminContextType {
  // Settings state
  paywallEnabled: boolean;
  setPaywallEnabled: (value: boolean) => void;
  inviteOnlyEnabled: boolean;
  setInviteOnlyEnabled: (value: boolean) => void;
  freeTierLimit: number;
  setFreeTierLimit: (value: number) => void;
  monthlyPrice: number;
  setMonthlyPrice: (value: number) => void;
  yearlyPrice: number;
  setYearlyPrice: (value: number) => void;
  yearlyDiscountPercent: number;
  setYearlyDiscountPercent: (value: number) => void;
  isLoading: boolean;
  isSaving: boolean;
  setIsSaving: (value: boolean) => void;
  
  // Invite codes state
  inviteCodes: InviteCode[];
  isLoadingCodes: boolean;
  
  // Actions
  loadSettings: () => Promise<void>;
  loadInviteCodes: () => Promise<void>;
  session: any;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: React.ReactNode; session: any }> = ({ 
  children,
  session 
}) => {
  const [activeTab, setActiveTab] = useState('paywall');
  const [paywallEnabled, setPaywallEnabled] = useState(false);
  const [inviteOnlyEnabled, setInviteOnlyEnabled] = useState(true);
  const [freeTierLimit, setFreeTierLimit] = useState(80);
  const [monthlyPrice, setMonthlyPrice] = useState(4.99);
  const [yearlyPrice, setYearlyPrice] = useState(49.99);
  const [yearlyDiscountPercent, setYearlyDiscountPercent] = useState(15);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [inviteCodes, setInviteCodes] = useState<InviteCode[]>([]);
  const [isLoadingCodes, setIsLoadingCodes] = useState(false);

  // Load settings from database
  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('app_settings')
        .select('paywall_enabled, free_tier_limit, invite_only_registration, monthly_price, yearly_price, yearly_discount_percent')
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
        
        // Load pricing information
        setMonthlyPrice(data[0].monthly_price || 4.99);
        setYearlyPrice(data[0].yearly_price || 49.99);
        setYearlyDiscountPercent(data[0].yearly_discount_percent || 15);
        
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

  const loadInviteCodes = async () => {
    if (!session?.access_token) return;
    
    try {
      setIsLoadingCodes(true);
      
      // Use Supabase function invocation
      const { data, error } = await supabase.functions.invoke('invite-code', {
        body: { action: 'list' }
      });
      
      if (error) {
        console.error('Error loading invite codes:', error);
        throw new Error(error.message || 'Failed to load invite codes');
      }
      
      console.log('Loaded invite codes:', data);
      setInviteCodes(data?.codes || []);
    } catch (error) {
      console.error('Error loading invite codes:', error);
      toast.error('Failed to load invite codes');
    } finally {
      setIsLoadingCodes(false);
    }
  };

  // Initial loading of settings and invite codes
  useEffect(() => {
    loadSettings();
    loadInviteCodes();
  }, [session]);

  const value = {
    paywallEnabled,
    setPaywallEnabled,
    inviteOnlyEnabled,
    setInviteOnlyEnabled,
    freeTierLimit,
    setFreeTierLimit,
    monthlyPrice,
    setMonthlyPrice,
    yearlyPrice,
    setYearlyPrice,
    yearlyDiscountPercent,
    setYearlyDiscountPercent,
    isLoading,
    isSaving,
    setIsSaving,
    inviteCodes,
    isLoadingCodes,
    loadSettings,
    loadInviteCodes,
    session,
    activeTab,
    setActiveTab
  };

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};
