
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info, Save, Loader2 } from 'lucide-react';

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
  // Track local state to avoid UI jumping during saving
  const [localInviteOnlyState, setLocalInviteOnlyState] = useState(inviteOnlyEnabled);
  
  // Sync local state with prop when it changes from parent
  useEffect(() => {
    setLocalInviteOnlyState(inviteOnlyEnabled);
  }, [inviteOnlyEnabled]);
  
  // Handle toggling the switch
  const handleToggleChange = (checked: boolean) => {
    setLocalInviteOnlyState(checked);
    // We don't immediately update the parent state until save is successful
  };

  const saveSettings = async () => {
    if (!session?.access_token) {
      toast.error('You must be logged in to perform this action');
      return;
    }

    setIsSaving(true);
    try {
      // Save invite-only settings
      const response = await fetch(`${window.location.origin}/functions/v1/toggle-invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          inviteOnly: localInviteOnlyState
        })
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to update invite settings');
      }

      // Update parent state with the new value on success
      setInviteOnlyEnabled(localInviteOnlyState);
      toast.success(result.message || 'Settings saved successfully');
      
      console.log('Settings updated successfully:', result);
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save settings');
      
      // In case of error, revert the local UI state to match the parent state
      setLocalInviteOnlyState(inviteOnlyEnabled);
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
            checked={localInviteOnlyState} 
            onCheckedChange={handleToggleChange}
          />
        </div>
        
        <Alert className={!localInviteOnlyState ? "bg-muted/50" : ""}>
          <Info className="h-4 w-4" />
          <AlertTitle>Registration Status</AlertTitle>
          <AlertDescription>
            Registration is currently {localInviteOnlyState ? 'invite-only' : 'open to everyone'}. 
            New users {localInviteOnlyState ? 'will' : 'will not'} need an invite code.
          </AlertDescription>
        </Alert>
      </CardContent>
      
      <CardFooter>
        <Button 
          onClick={saveSettings} 
          disabled={isSaving || localInviteOnlyState === inviteOnlyEnabled}
          className="ml-auto"
          variant={localInviteOnlyState !== inviteOnlyEnabled ? "default" : "outline"}
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

export default InviteToggle;
