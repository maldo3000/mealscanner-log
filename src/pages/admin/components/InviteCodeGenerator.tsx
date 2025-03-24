
import React, { useState } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAdmin } from '../context/AdminContext';

const InviteCodeGenerator: React.FC = () => {
  const { session, loadInviteCodes } = useAdmin();
  const [specificEmail, setSpecificEmail] = useState('');
  const [selectedExpiry, setSelectedExpiry] = useState('never');
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);

  const generateInviteCode = async () => {
    if (!session?.access_token) {
      toast.error('Authentication required');
      return;
    }

    setIsGeneratingCode(true);
    try {
      let expiresInDays = null;
      if (selectedExpiry !== 'never') {
        expiresInDays = parseInt(selectedExpiry);
      }

      console.log(`Generating invite code with email: ${specificEmail || 'none'}, expires: ${expiresInDays || 'never'}`);

      // Use Supabase's function invocation instead of fetch
      const { data, error } = await supabase.functions.invoke('invite-code', {
        body: {
          action: 'generate',
          email: specificEmail || null,
          expiresInDays
        }
      });

      if (error) {
        console.error('Error generating invite code:', error);
        throw new Error(error.message || 'Failed to generate invite code');
      }
      
      if (!data || !data.success) {
        throw new Error(data?.error || 'Failed to generate invite code');
      }
      
      console.log('Generated code result:', data);
      toast.success('Invite code generated successfully');
      await loadInviteCodes(); // Refresh the list
      setSpecificEmail('');
    } catch (error) {
      console.error('Error generating invite code:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate invite code');
    } finally {
      setIsGeneratingCode(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generate Invite Code</CardTitle>
        <CardDescription>
          Create new invite codes for users
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email (Optional)</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="user@example.com" 
              value={specificEmail}
              onChange={(e) => setSpecificEmail(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              If specified, this code will be tied to this email
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="expiry">Expiration</Label>
            <Select 
              value={selectedExpiry} 
              onValueChange={setSelectedExpiry}
            >
              <SelectTrigger id="expiry">
                <SelectValue placeholder="Select expiration time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="never">Never Expires</SelectItem>
                <SelectItem value="1">1 Day</SelectItem>
                <SelectItem value="7">7 Days</SelectItem>
                <SelectItem value="30">30 Days</SelectItem>
                <SelectItem value="90">90 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
      
      <CardFooter>
        <Button 
          onClick={generateInviteCode} 
          disabled={isGeneratingCode}
          className="ml-auto"
        >
          {isGeneratingCode ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              Generate Code
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default InviteCodeGenerator;
