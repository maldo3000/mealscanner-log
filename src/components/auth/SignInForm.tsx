
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import LoadingSpinner from '@/components/LoadingSpinner';
import TurnstileWidget from './TurnstileWidget';

interface SignInFormProps {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  loading: boolean;
  onSubmit: (e: React.FormEvent, captchaToken?: string) => Promise<void>;
  onForgotPassword: () => void;
  disabled: boolean;
}

const SignInForm: React.FC<SignInFormProps> = ({
  email,
  setEmail,
  password,
  setPassword,
  loading,
  onSubmit,
  onForgotPassword,
  disabled
}) => {
  const [captchaToken, setCaptchaToken] = useState<string | undefined>();
  
  // Cloudflare Turnstile site key
  const TURNSTILE_SITE_KEY = '0x4AAAAAABDjdvQiOXUYlGXY';

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
        <Label htmlFor="email" className="text-foreground/90">Email</Label>
        <Input
          id="email"
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
      
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label htmlFor="password" className="text-foreground/90">Password</Label>
          <button 
            type="button" 
            onClick={onForgotPassword}
            className="text-xs text-primary hover:text-primary/80 hover:underline"
          >
            Forgot password?
          </button>
        </div>
        <Input
          id="password"
          type="password"
          name="password"
          autoComplete="current-password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          className="bg-background/50 border-border/50 backdrop-blur-sm focus:border-primary/50"
        />
      </div>
      
      {/* Turnstile captcha widget */}
      <TurnstileWidget 
        siteKey={TURNSTILE_SITE_KEY} 
        onVerify={handleCaptchaVerify} 
      />
      
      <Button 
        type="submit" 
        className="w-full mt-6 bg-primary hover:bg-primary/90 text-primary-foreground shadow-md"
        disabled={disabled || loading || !captchaToken}
      >
        {loading ? (
          <LoadingSpinner size="small" className="mr-2" />
        ) : null}
        Sign In
      </Button>
    </form>
  );
};

export default SignInForm;
