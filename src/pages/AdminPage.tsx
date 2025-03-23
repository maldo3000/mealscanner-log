
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShieldAlert, Info, Save } from 'lucide-react';

const AdminPage: React.FC = () => {
  const [paywallEnabled, setPaywallEnabled] = useState(false);
  const [freeTierLimit, setFreeTierLimit] = useState(80);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Load current settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('app_settings')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1);

        if (error) {
          console.error('Error loading app settings:', error);
          toast.error('Failed to load settings');
          return;
        }

        if (data && data.length > 0) {
          setPaywallEnabled(data[0].paywall_enabled);
          setFreeTierLimit(data[0].free_tier_limit);
        }
      } catch (error) {
        console.error('Failed to load app settings:', error);
        toast.error('Failed to load settings');
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  const saveSettings = async () => {
    if (!user) {
      toast.error('You must be logged in to perform this action');
      return;
    }

    setIsSaving(true);
    try {
      // Get the current session for the auth token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Authentication required');
        return;
      }

      // Call the edge function to update settings
      const response = await fetch(`${window.location.origin}/functions/v1/toggle-paywall`, {
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

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to update settings');
      }

      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  // Simple admin check - in a real app you would have proper role-based auth
  if (!user || user.email !== 'admin@example.com') {
    return (
      <div className="container py-10">
        <Alert variant="destructive">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            You don't have permission to access this page.
          </AlertDescription>
        </Alert>
        <Button 
          className="mt-4" 
          variant="outline" 
          onClick={() => navigate('/')}
        >
          Return to Home
        </Button>
      </div>
    );
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
    </div>
  );
};

export default AdminPage;
