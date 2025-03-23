
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Navigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import VerificationAlert from '@/components/auth/VerificationAlert';
import AuthErrorAlert from '@/components/auth/AuthErrorAlert';
import SignInForm from '@/components/auth/SignInForm';
import SignUpForm from '@/components/auth/SignUpForm';
import AuthHeader from '@/components/auth/AuthHeader';

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const [showVerificationAlert, setShowVerificationAlert] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const { signIn, signUp, loading, isAuthenticated } = useAuth();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (!isLogin) {
      setPasswordsMatch(confirmPassword === password || confirmPassword === '');
    }
  }, [password, confirmPassword, isLogin]);

  // Check if we should show the verification message based on URL params
  useEffect(() => {
    if (searchParams.get('signup') === 'success') {
      setShowVerificationAlert(true);
      // Remove the query param to avoid showing the message after page refreshes
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    
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
      if (loginAttempts >= 5) {
        setAuthError('Too many login attempts. Please try again later.');
        toast.error('Too many login attempts. Please try again later.');
        return;
      }
      
      const result = await signIn(email, password);
      if (result.error) {
        setLoginAttempts(prev => prev + 1);
        if (result.error.message === 'Invalid login credentials') {
          setAuthError('Incorrect email or password');
        } else if (result.error.message?.includes('rate limit')) {
          setAuthError('Too many login attempts. Please try again later.');
        } else {
          setAuthError(result.error.message || 'Error signing in');
        }
      }
    }
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setPassword('');
    setConfirmPassword('');
    setAcceptedTerms(false);
    setAuthError(null);
    setLoginAttempts(0);
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
      
      {/* Email verification and error messages */}
      <VerificationAlert visible={isLogin && showVerificationAlert} />
      <AuthErrorAlert error={authError} />
      
      <Card className="w-full max-w-md glass-card border-border/30 backdrop-blur-md bg-card/60 animate-fade-in">
        <CardHeader className="pb-2 text-center">
          <AuthHeader isLogin={isLogin} />
        </CardHeader>

        <CardContent className="pt-4">
          {isLogin ? (
            <SignInForm
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              loading={loading}
              onSubmit={handleSubmit}
              disabled={loginAttempts >= 5}
            />
          ) : (
            <SignUpForm
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              confirmPassword={confirmPassword}
              setConfirmPassword={setConfirmPassword}
              acceptedTerms={acceptedTerms}
              setAcceptedTerms={setAcceptedTerms}
              passwordsMatch={passwordsMatch}
              loading={loading}
              onSubmit={handleSubmit}
            />
          )}
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
