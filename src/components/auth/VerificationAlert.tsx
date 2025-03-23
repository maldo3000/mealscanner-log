
import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface VerificationAlertProps {
  visible: boolean;
}

const VerificationAlert: React.FC<VerificationAlertProps> = ({ visible }) => {
  if (!visible) return null;
  
  return (
    <Alert className="mb-6 max-w-md border-primary/30 bg-primary/10">
      <AlertCircle className="h-4 w-4 text-primary mr-2" />
      <AlertDescription className="text-sm">
        Please check your email for a verification link. You need to verify your account before signing in.
      </AlertDescription>
    </Alert>
  );
};

export default VerificationAlert;
