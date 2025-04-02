
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import LoadingSpinner from '@/components/LoadingSpinner';
import TurnstileWidget from './TurnstileWidget';

interface SignUpFormProps {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  confirmPassword: string;
  setConfirmPassword: (confirmPassword: string) => void;
  inviteCode: string;
  setInviteCode: (inviteCode: string) => void;
  acceptedTerms: boolean;
  setAcceptedTerms: (accepted: boolean) => void;
  passwordsMatch: boolean;
  loading: boolean;
  inviteCodeError: string | null;
  inviteRequired: boolean;
  onSubmit: (e: React.FormEvent, captchaToken?: string) => Promise<void>;
}

const SignUpForm: React.FC<SignUpFormProps> = ({
  email,
  setEmail,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  inviteCode,
  setInviteCode,
  acceptedTerms,
  setAcceptedTerms,
  passwordsMatch,
  loading,
  inviteCodeError,
  inviteRequired,
  onSubmit
}) => {
  const [captchaToken, setCaptchaToken] = useState<string | undefined>();
  
  // Cloudflare Turnstile site key - this is visible to users so it's okay to be in the code
  const TURNSTILE_SITE_KEY = '1x00000000000000000000AA'; // Replace with your actual site key

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(e, captchaToken);
  };

  const handleCaptchaVerify = (token: string) => {
    setCaptchaToken(token);
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4" autoComplete="on">
      <div className="space-y-2">
        <Label htmlFor="signup-email" className="text-foreground/90">Email</Label>
        <Input
          id="signup-email"
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
      
      {inviteRequired && (
        <div className="space-y-2">
          <Label htmlFor="inviteCode" className="text-foreground/90">Invite Code</Label>
          <Input
            id="inviteCode"
            type="text"
            name="inviteCode"
            autoComplete="off"
            placeholder="Enter your invite code"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
            required
            className={`bg-background/50 border-border/50 backdrop-blur-sm focus:border-primary/50 ${inviteCodeError ? "border-destructive" : ""}`}
          />
          {inviteCodeError && (
            <p className="text-destructive text-sm mt-1">{inviteCodeError}</p>
          )}
        </div>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="signup-password" className="text-foreground/90">Password</Label>
        <Input
          id="signup-password"
          type="password"
          name="password"
          autoComplete="new-password"
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
          name="confirmPassword"
          autoComplete="new-password"
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
      
      {/* Turnstile captcha widget */}
      <TurnstileWidget 
        siteKey={TURNSTILE_SITE_KEY} 
        onVerify={handleCaptchaVerify} 
      />
      
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
        disabled={loading || !passwordsMatch || !acceptedTerms || (inviteRequired && !inviteCode) || !captchaToken}
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
