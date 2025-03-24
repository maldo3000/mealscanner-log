
import React, { useState } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clipboard, Trash2, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

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

interface InviteCodeListProps {
  inviteCodes: InviteCode[];
  isLoadingCodes: boolean;
  session: any;
  loadInviteCodes: () => Promise<void>;
}

const InviteCodeList: React.FC<InviteCodeListProps> = ({
  inviteCodes,
  isLoadingCodes,
  session,
  loadInviteCodes
}) => {
  const [deletingCodes, setDeletingCodes] = useState<Record<string, boolean>>({});

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code)
      .then(() => toast.success('Code copied to clipboard'))
      .catch(err => toast.error('Failed to copy code'));
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const deleteInviteCode = async (code: string) => {
    if (!session?.access_token) {
      toast.error('Authentication required');
      return;
    }

    setDeletingCodes(prev => ({ ...prev, [code]: true }));
    
    try {
      const { data, error } = await supabase.functions.invoke('invite-code', {
        body: {
          action: 'delete',
          code
        }
      });

      if (error) {
        console.error('Error deleting invite code:', error);
        throw new Error(error.message || 'Failed to delete invite code');
      }
      
      if (!data?.success) {
        throw new Error(data?.error || 'Failed to delete invite code');
      }
      
      toast.success('Invite code deleted');
      await loadInviteCodes(); // Refresh the list
    } catch (error) {
      console.error('Error deleting invite code:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete invite code');
    } finally {
      setDeletingCodes(prev => ({ ...prev, [code]: false }));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invite Codes</CardTitle>
        <CardDescription>
          Manage existing invite codes
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {isLoadingCodes ? (
          <div className="flex justify-center items-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : inviteCodes.length === 0 ? (
          <div className="text-center p-8 text-muted-foreground">
            No invite codes found. Generate some using the form above.
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-md border">
              <div className="grid grid-cols-12 p-3 font-medium bg-muted/50 text-xs md:text-sm">
                <div className="col-span-4 md:col-span-3">Code</div>
                <div className="col-span-3 md:col-span-2">Status</div>
                <div className="hidden md:block md:col-span-3">Email</div>
                <div className="col-span-3 md:col-span-2">Expires</div>
                <div className="col-span-2 text-right">Actions</div>
              </div>
              
              {inviteCodes.map(invite => (
                <div 
                  key={invite.id} 
                  className="grid grid-cols-12 p-3 items-center text-xs md:text-sm border-t"
                >
                  <div className="col-span-4 md:col-span-3 font-mono">
                    {invite.code}
                  </div>
                  <div className="col-span-3 md:col-span-2">
                    {invite.used ? (
                      <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">
                        Used
                      </span>
                    ) : (
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                        Active
                      </span>
                    )}
                  </div>
                  <div className="hidden md:block md:col-span-3 truncate" title={invite.email || 'None'}>
                    {invite.email || 'Any user'}
                  </div>
                  <div className="col-span-3 md:col-span-2">
                    {formatDate(invite.expires_at)}
                  </div>
                  <div className="col-span-2 flex justify-end gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => copyToClipboard(invite.code)}
                      title="Copy to clipboard"
                    >
                      <Clipboard className="h-4 w-4" />
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => deleteInviteCode(invite.code)}
                      disabled={deletingCodes[invite.code] || invite.used}
                      title={invite.used ? "Cannot delete used codes" : "Delete code"}
                      className={invite.used ? "opacity-30" : ""}
                    >
                      {deletingCodes[invite.code] ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4 text-red-500" />
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InviteCodeList;
