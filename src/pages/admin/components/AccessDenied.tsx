
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { ShieldAlert } from 'lucide-react';

const AccessDenied: React.FC = () => {
  const navigate = useNavigate();
  
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
};

export default AccessDenied;
