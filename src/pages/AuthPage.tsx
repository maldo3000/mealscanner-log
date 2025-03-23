
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Leaf, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Navigate } from 'react-router-dom';
import LoadingSpinner from '@/components/LoadingSpinner';
import { toast } from 'sonner';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const [showVerificationAlert, setShowVerificationAlert] = useState(false);
  const { signIn, signUp, loading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isLogin) {
      setPasswordsMatch(confirmPassword === password || confirmPassword === '');
    }
  }, [password, confirmPassword, isLogin]);

  // Check if we should show the verification message based on URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('signup') === 'success') {
      setShowVerificationAlert(true);
      // Remove the query param to avoid showing the message after page refreshes
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isLogin) {
      // Signup validation
      if (password !== confirmPassword) {
        toast.error('Passwords do not match');
        return;
      }
      
      if (!acceptedTerms) {
        toast.error('You must accept the Terms of Service');
        return;
      }
      
      await signUp(email, password);
      // We'll let the signUp function handle the navigation and message
    } else {
      // Login flow
      await signIn(email, password);
    }
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setPassword('');
    setConfirmPassword('');
    setAcceptedTerms(false);
  };

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/" />;
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-background relative overflow-hidden">
      {/* Gradient overlays for background effect */}
      <div className="absolute inset-0 bg-gradient-radial from-primary/5 to-transparent opacity-70"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10"></div>
      
      {/* Decorative circles */}
      <div className="absolute top-1/4 -left-24 w-64 h-64 rounded-full bg-primary/10 blur-3xl"></div>
      <div className="absolute bottom-1/4 -right-24 w-64 h-64 rounded-full bg-primary/10 blur-3xl"></div>
      
      {/* Email verification message alert */}
      {isLogin && showVerificationAlert && (
        <Alert className="mb-6 max-w-md border-primary/30 bg-primary/10">
          <AlertCircle className="h-4 w-4 text-primary mr-2" />
          <AlertDescription className="text-sm">
            Please check your email for a verification link. You need to verify your account before signing in.
          </AlertDescription>
        </Alert>
      )}
      
      <Card className="w-full max-w-md glass-card border-border/30 backdrop-blur-md bg-card/60 animate-fade-in">
        <CardHeader className="pb-2 text-center">
          <div className="flex flex-col items-center space-y-2">
            <div className="flex items-center justify-center p-3 rounded-full bg-primary/20 backdrop-blur-sm">
              <Leaf className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-2xl font-semibold text-foreground">MealScanner</h1>
            <h2 className="text-xl font-medium text-primary mt-2">
              {isLogin ? 'Sign In' : 'Sign Up'}
            </h2>
            <p className="text-muted-foreground text-center">
              {isLogin ? 'Sign in to your account' : 'Create a new account'}
            </p>
          </div>
        </CardHeader>

        <CardContent className="pt-4">
          <form onSubmit={handleSubmit} className="space-y-4">
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
            
            {!isLogin && (
              <>
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
              </>
            )}
            
            <Button 
              type="submit" 
              className="w-full mt-6 bg-primary hover:bg-primary/90 text-primary-foreground shadow-md"
              disabled={loading || (!isLogin && (!passwordsMatch || !acceptedTerms))}
            >
              {loading ? (
                <LoadingSpinner size="small" className="mr-2" />
              ) : null}
              {isLogin ? 'Sign In' : 'Sign Up'}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex justify-center pt-0">
          <button
            type="button"
            className="text-primary hover:text-primary/90 hover:underline text-sm transition-colors"
            onClick={toggleAuthMode}
          >
            {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
          </button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AuthPage;
