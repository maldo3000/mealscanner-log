
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import LoadingSpinner from '@/components/LoadingSpinner';

interface SignUpFormProps {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  confirmPassword: string;
  setConfirmPassword: (confirmPassword: string) => void;
  acceptedTerms: boolean;
  setAcceptedTerms: (accepted: boolean) => void;
  passwordsMatch: boolean;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => Promise<void>;
}

const SignUpForm: React.FC<SignUpFormProps> = ({
  email,
  setEmail,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  acceptedTerms,
  setAcceptedTerms,
  passwordsMatch,
  loading,
  onSubmit
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email" className="text-foreground/90">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="bg-background/50 border-border/50 backdrop-blur-sm focus:border-primary/50"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="password" className="text-foreground/90">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          className="bg-background/50 border-border/50 backdrop-blur-sm focus:border-primary/50"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="confirmPassword" className="text-foreground/90">Confirm Password</Label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          minLength={6}
          className={`bg-background/50 border-border/50 backdrop-blur-sm focus:border-primary/50 ${!passwordsMatch ? "border-destructive" : ""}`}
        />
        {!passwordsMatch && (
          <p className="text-destructive text-sm mt-1">Passwords do not match</p>
        )}
      </div>
      
      <div className="flex items-center space-x-2 mt-4">
        <Checkbox 
          id="terms" 
          checked={acceptedTerms}
          onCheckedChange={(checked) => setAcceptedTerms(checked === true)}
          className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
        />
        <Label htmlFor="terms" className="text-sm font-normal leading-none cursor-pointer text-foreground/80">
          I understand and agree to the Terms of Service
        </Label>
      </div>
      
      <Button 
        type="submit" 
        className="w-full mt-6 bg-primary hover:bg-primary/90 text-primary-foreground shadow-md"
        disabled={loading || !passwordsMatch || !acceptedTerms}
      >
        {loading ? (
          <LoadingSpinner size="small" className="mr-2" />
        ) : null}
        Sign Up
      </Button>
    </form>
  );
};

export default SignUpForm;
