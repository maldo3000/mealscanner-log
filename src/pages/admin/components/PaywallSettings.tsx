
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Save, Loader2 } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { supabase } from '@/integrations/supabase/client';
import { PaywallToggle, FreeTierLimitSlider, PricingConfig } from './paywall-settings';

const PaywallSettings: React.FC = () => {
  const {
    paywallEnabled,
    setPaywallEnabled,
    freeTierLimit,
    setFreeTierLimit,
    monthlyPrice,
    setMonthlyPrice,
    yearlyPrice,
    setYearlyPrice,
    yearlyDiscountPercent,
    setYearlyDiscountPercent,
    session,
    isSaving,
    setIsSaving
  } = useAdmin();

  const [localPaywallEnabled, setLocalPaywallEnabled] = useState(paywallEnabled);
  const [localFreeTierLimit, setLocalFreeTierLimit] = useState(freeTierLimit);
  const [localMonthlyPrice, setLocalMonthlyPrice] = useState(monthlyPrice);
  const [localYearlyPrice, setLocalYearlyPrice] = useState(yearlyPrice);
  const [localYearlyDiscount, setLocalYearlyDiscount] = useState(yearlyDiscountPercent);
  const [hasChanges, setHasChanges] = useState(false);
  
  useEffect(() => {
    setLocalPaywallEnabled(paywallEnabled);
    setLocalFreeTierLimit(freeTierLimit);
    setLocalMonthlyPrice(monthlyPrice);
    setLocalYearlyPrice(yearlyPrice);
    setLocalYearlyDiscount(yearlyDiscountPercent);
    setHasChanges(false);
  }, [paywallEnabled, freeTierLimit, monthlyPrice, yearlyPrice, yearlyDiscountPercent]);
  
  const handlePaywallToggle = (checked: boolean) => {
    setLocalPaywallEnabled(checked);
    setHasChanges(true);
  };
  
  const handleFreeTierChange = (value: number[]) => {
    setLocalFreeTierLimit(value[0]);
    setHasChanges(true);
  };

  const handleMonthlyPriceChange = (value: string) => {
    const price = parseFloat(value);
    if (!isNaN(price) && price >= 0) {
      setLocalMonthlyPrice(price);
      setHasChanges(true);
    }
  };

  const handleYearlyPriceChange = (value: string) => {
    const price = parseFloat(value);
    if (!isNaN(price) && price >= 0) {
      setLocalYearlyPrice(price);
      setHasChanges(true);
    }
  };

  const handleYearlyDiscountChange = (value: number[]) => {
    setLocalYearlyDiscount(value[0]);
    setHasChanges(true);
  };

  const saveSettings = async () => {
    if (!session?.access_token) {
      toast.error('You must be logged in to perform this action');
      return;
    }

    setIsSaving(true);
    try {
      console.log(`Sending request to update settings: paywallEnabled=${localPaywallEnabled}, freeTierLimit=${localFreeTierLimit}, prices=${localMonthlyPrice}/${localYearlyPrice}`);
      
      const { data, error } = await supabase.functions.invoke('toggle-paywall', {
        body: {
          paywallEnabled: localPaywallEnabled,
          freeTierLimit: localFreeTierLimit,
          monthlyPrice: localMonthlyPrice,
          yearlyPrice: localYearlyPrice,
          yearlyDiscountPercent: localYearlyDiscount
        }
      });

      if (error) {
        console.error('Error response:', error);
        throw new Error(error.message || 'Failed to update paywall settings');
      }

      console.log('Settings update response:', data);
      
      setPaywallEnabled(localPaywallEnabled);
      setFreeTierLimit(localFreeTierLimit);
      setMonthlyPrice(localMonthlyPrice);
      setYearlyPrice(localYearlyPrice);
      setYearlyDiscountPercent(localYearlyDiscount);
      setHasChanges(false);
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save settings');
      
      setLocalPaywallEnabled(paywallEnabled);
      setLocalFreeTierLimit(freeTierLimit);
      setLocalMonthlyPrice(monthlyPrice);
      setLocalYearlyPrice(yearlyPrice);
      setLocalYearlyDiscount(yearlyDiscountPercent);
      setHasChanges(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="max-w-xl">
      <CardHeader>
        <CardTitle>Paywall Configuration</CardTitle>
        <CardDescription>
          Control the paywall feature for meal scanning
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-8">
        <PaywallToggle 
          paywallEnabled={localPaywallEnabled} 
          onToggle={handlePaywallToggle} 
          disabled={isSaving} 
        />
        
        <FreeTierLimitSlider 
          freeTierLimit={localFreeTierLimit} 
          onChange={handleFreeTierChange} 
          disabled={!localPaywallEnabled || isSaving} 
        />

        <PricingConfig 
          monthlyPrice={localMonthlyPrice}
          yearlyPrice={localYearlyPrice}
          yearlyDiscountPercent={localYearlyDiscount}
          onMonthlyPriceChange={handleMonthlyPriceChange}
          onYearlyPriceChange={handleYearlyPriceChange}
          onYearlyDiscountChange={handleYearlyDiscountChange}
          disabled={!localPaywallEnabled || isSaving}
        />
      </CardContent>
      
      <CardFooter>
        <Button 
          onClick={saveSettings} 
          disabled={isSaving || !hasChanges}
          className="ml-auto"
          variant={hasChanges ? "default" : "outline"}
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Settings
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PaywallSettings;
