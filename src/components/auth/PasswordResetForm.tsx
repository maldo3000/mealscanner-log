
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import LoadingSpinner from '@/components/LoadingSpinner';

interface PasswordResetFormProps {
  email: string;
  setEmail: (email: string) => void;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onCancel: () => void;
}

const PasswordResetForm: React.FC<PasswordResetFormProps> = ({
  email,
  setEmail,
  loading,
  onSubmit,
  onCancel
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4" autoComplete="on">
      <div className="space-y-2">
        <Label htmlFor="reset-email" className="text-foreground/90">Email</Label>
        <Input
          id="reset-email"
          type="email"
          name="email"
          autoComplete="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="bg-background/50 border-border/50 backdrop-blur-sm focus:border-primary/50"
        />
      </div>
      
      <div className="flex space-x-2 pt-2">
        <Button 
          type="submit" 
          className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground shadow-md"
          disabled={loading}
        >
          {loading ? (
            <LoadingSpinner size="small" className="mr-2" />
          ) : null}
          Send Reset Link
        </Button>
        <Button 
          type="button" 
          variant="outline"
          className="flex-1 border-border/50"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
      </div>

      <p className="text-sm text-foreground/70 text-center mt-2">
        We'll send you an email with a link to reset your password.
      </p>
    </form>
  );
};

export default PasswordResetForm;
