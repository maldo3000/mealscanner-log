
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
  const [hasChanges, setHasChanges] = useState(false);
  
  // Sync local state with prop when it changes from parent
  useEffect(() => {
    console.log(`Parent inviteOnlyEnabled changed to: ${inviteOnlyEnabled}`);
    setLocalInviteOnlyState(inviteOnlyEnabled);
    setHasChanges(false);
  }, [inviteOnlyEnabled]);
  
  // Handle toggling the switch
  const handleToggleChange = (checked: boolean) => {
    console.log(`Switch toggled to: ${checked}`);
    setLocalInviteOnlyState(checked);
    setHasChanges(true);
  };

  const saveSettings = async () => {
    if (!session?.access_token) {
      toast.error('You must be logged in to perform this action');
      return;
    }

    setIsSaving(true);
    
    try {
      console.log(`Sending request to toggle invite: inviteOnly=${localInviteOnlyState}`);
      
      // Save invite-only settings
      const response = await fetch(`${window.location.origin}/functions/toggle-invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          inviteOnly: localInviteOnlyState
        })
      });

      if (!response.ok) {
        console.error(`Error response status: ${response.status}`, response);
        
        let errorMessage = `Server error: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
          console.error('Error data:', errorData);
        } catch (parseError) {
          console.error('Could not parse error response:', parseError);
          const text = await response.text();
          console.error('Error response text:', text);
        }
        
        throw new Error(errorMessage);
      }

      const result = await response.json();
      
      console.log('Toggle invite response:', result);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to update invite settings');
      }
      
      // Update parent state with the new value on success
      setInviteOnlyEnabled(localInviteOnlyState);
      setHasChanges(false);
      toast.success(result.message || 'Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save settings');
      
      // In case of error, revert the local UI state to match the parent state
      setLocalInviteOnlyState(inviteOnlyEnabled);
      setHasChanges(false);
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
            disabled={isSaving}
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

export default InviteToggle;
