
import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/auth';

const EmailConfirmedPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [countdown, setCountdown] = useState(5);

  // Check if there's an error in the URL parameters
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  // If user is already authenticated, redirect to home
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/home');
    }
  }, [isAuthenticated, navigate]);

  // Countdown timer to automatically redirect to login
  useEffect(() => {
    if (countdown > 0 && !error) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && !error) {
      navigate('/auth');
    }
  }, [countdown, navigate, error]);

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-background">
      <Card className="w-full max-w-md shadow-lg border-border">
        <CardHeader className="pb-2 text-center">
          {error ? (
            <h2 className="text-2xl font-bold text-destructive">Confirmation Error</h2>
          ) : (
            <>
              <CheckCircle className="w-16 h-16 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-primary">Email Confirmed!</h2>
            </>
          )}
        </CardHeader>

        <CardContent className="pt-4 text-center">
          {error ? (
            <div className="space-y-2">
              <p className="text-destructive">There was an error confirming your email:</p>
              <p className="bg-destructive/10 p-3 rounded-md text-destructive">{errorDescription || 'Unknown error'}</p>
              <p className="mt-4">Please try again or contact support if the problem persists.</p>
            </div>
          ) : (
            <div className="space-y-2">
              <p>Thank you for confirming your email address.</p>
              <p>Your account is now active and you can sign in to access all features.</p>
              <p className="text-sm text-muted-foreground mt-4">
                Redirecting to login in {countdown} seconds...
              </p>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-center pt-2">
          <Button asChild className="w-full gap-2">
            <Link to="/auth">
              Sign In Now <ArrowRight size={16} />
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default EmailConfirmedPage;
