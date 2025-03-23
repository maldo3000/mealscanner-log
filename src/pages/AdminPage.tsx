
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  ShieldAlert, 
  Info, 
  Save, 
  Ticket, 
  Plus, 
  Trash2, 
  Copy, 
  CalendarRange, 
  User, 
  CheckCircle, 
  XCircle 
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell 
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface InviteCode {
  id: string;
  code: string;
  email: string | null;
  used: boolean;
  created_by: string;
  created_at: string;
  used_at: string | null;
  expires_at: string | null;
}

const AdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('paywall');
  const [paywallEnabled, setPaywallEnabled] = useState(false);
  const [inviteOnlyEnabled, setInviteOnlyEnabled] = useState(true);
  const [freeTierLimit, setFreeTierLimit] = useState(80);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [inviteCodes, setInviteCodes] = useState<InviteCode[]>([]);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [selectedExpiry, setSelectedExpiry] = useState('never');
  const [specificEmail, setSpecificEmail] = useState('');
  const [isLoadingCodes, setIsLoadingCodes] = useState(false);
  const { isAdmin, user, session } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const loadSettings = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('app_settings')
          .select('paywall_enabled, free_tier_limit, invite_only_registration')
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
          setInviteOnlyEnabled(data[0].invite_only_registration);
        }
      } catch (error) {
        console.error('Failed to load app settings:', error);
        toast.error('Failed to load settings');
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
    loadInviteCodes();
  }, []);

  const loadInviteCodes = async () => {
    if (!session?.access_token) return;
    
    try {
      setIsLoadingCodes(true);
      
      const response = await fetch(`${window.location.origin}/functions/v1/invite-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ action: 'list' })
      });
      
      if (!response.ok) {
        throw new Error('Failed to load invite codes');
      }
      
      const result = await response.json();
      setInviteCodes(result.codes || []);
    } catch (error) {
      console.error('Error loading invite codes:', error);
      toast.error('Failed to load invite codes');
    } finally {
      setIsLoadingCodes(false);
    }
  };

  const saveSettings = async () => {
    if (!isAdmin || !session?.access_token) {
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

  const deleteInviteCode = async (code: string) => {
    if (!session?.access_token) {
      toast.error('Authentication required');
      return;
    }

    try {
      const response = await fetch(`${window.location.origin}/functions/v1/invite-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          action: 'delete',
          code
        })
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to delete invite code');
      }

      toast.success('Invite code deleted successfully');
      loadInviteCodes(); // Refresh the list
    } catch (error) {
      console.error('Error deleting invite code:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete invite code');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success('Copied to clipboard');
    }).catch(err => {
      console.error('Could not copy text: ', err);
      toast.error('Failed to copy to clipboard');
    });
  };

  if (!isAdmin) {
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
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="paywall">Paywall Settings</TabsTrigger>
          <TabsTrigger value="invite">Invite Codes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="paywall">
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
        </TabsContent>
        
        <TabsContent value="invite">
          <div className="grid gap-6">
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
            
            <Card>
              <CardHeader>
                <CardTitle>Invite Codes</CardTitle>
                <CardDescription>
                  Manage existing invite codes
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                {isLoadingCodes ? (
                  <div className="py-4 text-center text-muted-foreground">
                    Loading invite codes...
                  </div>
                ) : inviteCodes.length === 0 ? (
                  <div className="py-4 text-center text-muted-foreground">
                    No invite codes found. Generate some codes to get started.
                  </div>
                ) : (
                  <div className="overflow-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Code</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead>Expires</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {inviteCodes.map((code) => (
                          <TableRow key={code.id}>
                            <TableCell className="font-mono font-medium">
                              {code.code}
                            </TableCell>
                            <TableCell>
                              {code.used ? (
                                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                                  <XCircle className="h-3.5 w-3.5 mr-1" />
                                  Used
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                  <CheckCircle className="h-3.5 w-3.5 mr-1" />
                                  Available
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              {code.email ? (
                                <div className="flex items-center">
                                  <User className="h-3.5 w-3.5 mr-1.5" />
                                  <span className="text-sm truncate max-w-[120px]">{code.email}</span>
                                </div>
                              ) : (
                                <span className="text-muted-foreground text-sm">Any</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center text-sm text-muted-foreground">
                                <CalendarRange className="h-3.5 w-3.5 mr-1.5" />
                                {new Date(code.created_at).toLocaleDateString()}
                              </div>
                            </TableCell>
                            <TableCell>
                              {code.expires_at ? (
                                format(new Date(code.expires_at), 'MMM d, yyyy')
                              ) : (
                                <span className="text-muted-foreground text-sm">Never</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => copyToClipboard(code.code)}
                                  title="Copy code"
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                                {!code.used && (
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => deleteInviteCode(code.code)}
                                    title="Delete code"
                                    className="text-red-500 hover:text-red-700"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
              
              <CardFooter className="flex justify-end">
                <Button 
                  variant="outline" 
                  onClick={loadInviteCodes} 
                  disabled={isLoadingCodes}
                >
                  Refresh List
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPage;
