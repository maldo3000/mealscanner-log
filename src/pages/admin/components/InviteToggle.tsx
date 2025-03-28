
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info, Save, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAdmin } from '../context/AdminContext';

const InviteToggle: React.FC = () => {
  const {
    inviteOnlyEnabled,
    setInviteOnlyEnabled,
    session,
    isSaving,
    setIsSaving
  } = useAdmin();

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
      
      // Use direct Supabase function invocation instead of fetch
      const { data, error } = await supabase.functions.invoke('toggle-invite', {
        body: { inviteOnly: localInviteOnlyState }
      });

      if (error) {
        console.error('Error invoking toggle-invite function:', error);
        throw new Error(`Failed to update invite settings: ${error.message}`);
      }
      
      if (!data || !data.success) {
        throw new Error(data?.error || 'Failed to update invite settings');
      }
      
      console.log('Toggle invite response:', data);
      
      // Update parent state with the new value on success
      setInviteOnlyEnabled(localInviteOnlyState);
      setHasChanges(false);
      toast.success(data.message || 'Settings saved successfully');
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
