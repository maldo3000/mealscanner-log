
import React, { useState } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';

interface InviteCodeGeneratorProps {
  session: any;
  loadInviteCodes: () => Promise<void>;
}

const InviteCodeGenerator: React.FC<InviteCodeGeneratorProps> = ({
  session,
  loadInviteCodes
}) => {
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

      const response = await fetch(`${window.location.origin}/functions/v1/invite-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          action: 'generate',
          email: specificEmail || null,
          expiresInDays
        })
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to generate invite code');
      }

      toast.success('Invite code generated successfully');
      loadInviteCodes(); // Refresh the list
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
            <>Generating...</>
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
