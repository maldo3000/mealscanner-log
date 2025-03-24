
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Info, Save, Loader2, DollarSign } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { supabase } from '@/integrations/supabase/client';

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

  // Local state for tracking UI changes without immediately updating parent
  const [localPaywallEnabled, setLocalPaywallEnabled] = useState(paywallEnabled);
  const [localFreeTierLimit, setLocalFreeTierLimit] = useState(freeTierLimit);
  const [localMonthlyPrice, setLocalMonthlyPrice] = useState(monthlyPrice);
  const [localYearlyPrice, setLocalYearlyPrice] = useState(yearlyPrice);
  const [localYearlyDiscount, setLocalYearlyDiscount] = useState(yearlyDiscountPercent);
  const [hasChanges, setHasChanges] = useState(false);
  
  // Sync local state with props when they change from the parent
  useEffect(() => {
    setLocalPaywallEnabled(paywallEnabled);
    setLocalFreeTierLimit(freeTierLimit);
    setLocalMonthlyPrice(monthlyPrice);
    setLocalYearlyPrice(yearlyPrice);
    setLocalYearlyDiscount(yearlyDiscountPercent);
    setHasChanges(false);
  }, [paywallEnabled, freeTierLimit, monthlyPrice, yearlyPrice, yearlyDiscountPercent]);
  
  // Handle toggling the paywall switch
  const handlePaywallToggle = (checked: boolean) => {
    setLocalPaywallEnabled(checked);
    setHasChanges(true);
  };
  
  // Handle changing the free tier limit slider
  const handleFreeTierChange = (value: number[]) => {
    setLocalFreeTierLimit(value[0]);
    setHasChanges(true);
  };

  // Handle price changes
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
      
      // Use Supabase function invocation
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
      
      // Update parent state only after successful save
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
      
      // Revert local state to match parent on error
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
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Enable Paywall</h3>
              <p className="text-sm text-muted-foreground">
                When enabled, users will be limited to the free tier scan limit
              </p>
            </div>
            <Switch 
              checked={localPaywallEnabled} 
              onCheckedChange={handlePaywallToggle}
              disabled={isSaving}
            />
          </div>
          
          <Alert className={!localPaywallEnabled ? "bg-muted/50" : ""}>
            <Info className="h-4 w-4" />
            <AlertTitle>Paywall Status</AlertTitle>
            <AlertDescription>
              Paywall is currently {localPaywallEnabled ? 'enabled' : 'disabled'}. 
              Users {localPaywallEnabled ? 'will' : 'will not'} be limited to the free tier.
            </AlertDescription>
          </Alert>
        </div>
        
        <div className="space-y-4">
          <div>
            <h3 className="font-medium">Free Tier Limit</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Set the number of free scans before paywall is enforced
            </p>
            
            <div className="px-4">
              <Slider
                value={[localFreeTierLimit]}
                min={10}
                max={200}
                step={5}
                onValueChange={handleFreeTierChange}
                disabled={!localPaywallEnabled || isSaving}
              />
              
              <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                <span>10</span>
                <span className="font-medium text-base text-foreground">
                  {localFreeTierLimit} scans
                </span>
                <span>200</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6 pt-2">
          <h3 className="font-medium">Pricing Configuration</h3>
          
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="monthlyPrice">Monthly Price ($)</Label>
              <div className="relative">
                <DollarSign className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                <Input
                  id="monthlyPrice"
                  type="number"
                  min="0.99"
                  step="0.01"
                  value={localMonthlyPrice}
                  onChange={(e) => handleMonthlyPriceChange(e.target.value)}
                  className="pl-9"
                  disabled={!localPaywallEnabled || isSaving}
                />
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="yearlyPrice">Yearly Price ($)</Label>
              <div className="relative">
                <DollarSign className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                <Input
                  id="yearlyPrice"
                  type="number"
                  min="0.99"
                  step="0.01"
                  value={localYearlyPrice}
                  onChange={(e) => handleYearlyPriceChange(e.target.value)}
                  className="pl-9"
                  disabled={!localPaywallEnabled || isSaving}
                />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-2">
                <Label htmlFor="yearlyDiscount">Yearly Discount Percentage</Label>
                <span className="text-sm font-medium">{localYearlyDiscount}%</span>
              </div>
              <Slider
                id="yearlyDiscount"
                value={[localYearlyDiscount]}
                min={0}
                max={50}
                step={1}
                onValueChange={handleYearlyDiscountChange}
                disabled={!localPaywallEnabled || isSaving}
              />
              <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                <span>0%</span>
                <span>25%</span>
                <span>50%</span>
              </div>
              
              {localMonthlyPrice && localYearlyPrice && (
                <p className="text-sm text-muted-foreground mt-2">
                  Yearly price (${localYearlyPrice.toFixed(2)}) is {Math.round((1 - (localYearlyPrice / (localMonthlyPrice * 12))) * 100)}% off monthly pricing (${(localMonthlyPrice * 12).toFixed(2)})
                </p>
              )}
            </div>
          </div>
        </div>
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
