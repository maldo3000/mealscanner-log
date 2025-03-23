
import React from 'react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Copy, Trash2, User, CalendarRange, CheckCircle, XCircle } from 'lucide-react';

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
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success('Copied to clipboard');
    }).catch(err => {
      console.error('Could not copy text: ', err);
      toast.error('Failed to copy to clipboard');
    });
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
  );
};

export default InviteCodeList;
