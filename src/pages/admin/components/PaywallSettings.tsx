
import React, { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info, Save } from 'lucide-react';

interface PaywallSettingsProps {
  paywallEnabled: boolean;
  setPaywallEnabled: (enabled: boolean) => void;
  freeTierLimit: number;
  setFreeTierLimit: (limit: number) => void;
  session: any;
  isSaving: boolean;
  setIsSaving: (saving: boolean) => void;
}

const PaywallSettings: React.FC<PaywallSettingsProps> = ({
  paywallEnabled,
  setPaywallEnabled,
  freeTierLimit,
  setFreeTierLimit,
  session,
  isSaving,
  setIsSaving
}) => {
  const saveSettings = async () => {
    if (!session?.access_token) {
      toast.error('You must be logged in to perform this action');
      return;
    }

    setIsSaving(true);
    try {
      // Save paywall settings
      const paywallResponse = await fetch(`${window.location.origin}/functions/v1/toggle-paywall`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          paywallEnabled,
          freeTierLimit
        })
      });

      if (!paywallResponse.ok) {
        const paywallResult = await paywallResponse.json();
        throw new Error(paywallResult.error || 'Failed to update paywall settings');
      }

      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save settings');
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
              checked={paywallEnabled} 
              onCheckedChange={setPaywallEnabled}
            />
          </div>
          
          <Alert className={!paywallEnabled ? "bg-muted/50" : ""}>
            <Info className="h-4 w-4" />
            <AlertTitle>Paywall Status</AlertTitle>
            <AlertDescription>
              Paywall is currently {paywallEnabled ? 'enabled' : 'disabled'}. 
              Users {paywallEnabled ? 'will' : 'will not'} be limited to the free tier.
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
                value={[freeTierLimit]}
                min={10}
                max={200}
                step={5}
                onValueChange={(value) => setFreeTierLimit(value[0])}
                disabled={!paywallEnabled}
              />
              
              <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                <span>10</span>
                <span className="font-medium text-base text-foreground">
                  {freeTierLimit} scans
                </span>
                <span>200</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter>
        <Button 
          onClick={saveSettings} 
          disabled={isSaving}
          className="ml-auto"
        >
          {isSaving ? (
            <>Saving...</>
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
