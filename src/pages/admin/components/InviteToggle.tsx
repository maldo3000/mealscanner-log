
import React from 'react';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info, Save } from 'lucide-react';

interface InviteToggleProps {
  inviteOnlyEnabled: boolean;
  setInviteOnlyEnabled: (enabled: boolean) => void;
  session: any;
  isSaving: boolean;
  setIsSaving: (saving: boolean) => void;
}

const InviteToggle: React.FC<InviteToggleProps> = ({
  inviteOnlyEnabled,
  setInviteOnlyEnabled,
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
      // Save invite-only settings
      const inviteResponse = await fetch(`${window.location.origin}/functions/v1/invite-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          action: 'update_settings',
          inviteOnly: inviteOnlyEnabled
        })
      });

      if (!inviteResponse.ok) {
        const inviteResult = await inviteResponse.json();
        throw new Error(inviteResult.error || 'Failed to update invite settings');
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
    <Card>
      <CardHeader>
        <CardTitle>Invite-Only Registration</CardTitle>
        <CardDescription>
          Control whether new users need an invite code to register
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">Enable Invite-Only Mode</h3>
            <p className="text-sm text-muted-foreground">
              When enabled, new users will need a valid invite code to register
            </p>
          </div>
          <Switch 
            checked={inviteOnlyEnabled} 
            onCheckedChange={setInviteOnlyEnabled}
          />
        </div>
        
        <Alert className={!inviteOnlyEnabled ? "bg-muted/50" : ""}>
          <Info className="h-4 w-4" />
          <AlertTitle>Registration Status</AlertTitle>
          <AlertDescription>
            Registration is currently {inviteOnlyEnabled ? 'invite-only' : 'open to everyone'}. 
            New users {inviteOnlyEnabled ? 'will' : 'will not'} need an invite code.
          </AlertDescription>
        </Alert>
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

export default InviteToggle;
