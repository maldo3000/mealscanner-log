
import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AuthErrorAlertProps {
  error: string | null;
}

const AuthErrorAlert: React.FC<AuthErrorAlertProps> = ({ error }) => {
  if (!error) return null;
  
  return (
    <Alert className="mb-6 max-w-md border-destructive/30 bg-destructive/10">
      <AlertCircle className="h-4 w-4 text-destructive mr-2" />
      <AlertDescription className="text-sm text-destructive">
        {error}
      </AlertDescription>
    </Alert>
  );
};

export default AuthErrorAlert;
