
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { CreditCard, CheckCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/auth';
import { useSubscription } from '@/context/subscription';

const ProfilePage: React.FC = () => {
  const {
    user,
    isAuthenticated
  } = useAuth();
  const {
    isSubscribed,
    scanCount,
    freeTierLimit,
    remainingScans,
    paywallEnabled,
    refreshSubscriptionData
  } = useSubscription();
  const navigate = useNavigate();

  // Refresh subscription data when profile page is loaded
  useEffect(() => {
    console.log('Profile page loaded, refreshing subscription data');
    refreshSubscriptionData();
  }, [refreshSubscriptionData]);

  // Get user's initials for avatar fallback
  const getInitials = () => {
    if (!user?.email) return '?';
    const email = user.email;
    return email.substring(0, 2).toUpperCase();
  };
  
  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6 text-center">Your Profile</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-col items-center text-center">
            <Avatar className="h-20 w-20 mb-4">
              <AvatarFallback className="text-lg">{getInitials()}</AvatarFallback>
            </Avatar>
            <div className="text-center w-full">
              <CardTitle className="mx-auto">Account Information</CardTitle>
              <CardDescription className="mx-auto">Manage your account details</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center sm:text-left">
              <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
              <p className="text-base break-all">{user?.email}</p>
            </div>
            
            <div className="text-center sm:text-left">
              <h3 className="text-sm font-medium text-muted-foreground">Account ID</h3>
              <p className="text-xs text-muted-foreground font-mono break-all">{user?.id}</p>
            </div>
            
            {/* Account management buttons can be added here in the future */}
            <div className="pt-4 flex flex-col sm:flex-row gap-2 justify-center sm:justify-start">
              <Button variant="outline" disabled className="flex items-center gap-1 mx-auto sm:mx-0 w-full sm:w-auto">
                Edit Profile
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="mx-auto">Subscription</CardTitle>
            <CardDescription className="mx-auto">
              {paywallEnabled ? 'Your current plan and usage' : 'Subscription information'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <div className={`p-2 rounded-full ${isSubscribed ? 'bg-primary/10' : 'bg-muted'}`}>
                {isSubscribed ? <CheckCircle className="h-6 w-6 text-primary" /> : <CreditCard className="h-6 w-6 text-muted-foreground" />}
              </div>
              <div>
                <h3 className="font-medium">
                  {isSubscribed ? 'Pro Plan' : paywallEnabled ? 'Free Plan' : 'Unlimited Access'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {isSubscribed 
                    ? 'Unlimited scans' 
                    : paywallEnabled 
                      ? `${remainingScans} of ${freeTierLimit} scans remaining` 
                      : 'Unlimited scans (Paywall disabled)'}
                </p>
              </div>
            </div>
            
            {paywallEnabled && !isSubscribed && (
              <div className="bg-muted p-3 rounded-md text-sm text-center sm:text-left">
                <p>
                  You've used <span className="font-medium">{scanCount}</span> of your{' '}
                  <span className="font-medium">{freeTierLimit}</span> free scans.
                </p>
              </div>
            )}
            
            {paywallEnabled && (
              <div className="pt-4 flex justify-center sm:justify-start">
                <Button onClick={() => navigate('/subscription')} className="w-full" variant={isSubscribed ? "outline" : "default"}>
                  {isSubscribed ? "Manage Subscription" : (
                    <>
                      Upgrade to Pro
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;
