
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { 
  VerificationAlert, 
  AuthErrorAlert, 
  SignInForm, 
  SignUpForm,
  AuthHeader
} from '@/components/auth';
import { useAuthForm } from '@/hooks/useAuthForm';

const AuthPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const {
    isLogin,
    email,
    password,
    confirmPassword,
    acceptedTerms,
    passwordsMatch,
    showVerificationAlert,
    authError,
    loginAttempts,
    loading,
    setEmail,
    setPassword,
    setConfirmPassword,
    setAcceptedTerms,
    toggleAuthMode,
    handleSubmit
  } = useAuthForm();

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
