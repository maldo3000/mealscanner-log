
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '@/context/SubscriptionContext';
import { useAuth } from '@/context/auth';
import { CreditCard, Check, Leaf, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

const SubscriptionPage: React.FC = () => {
  const { isSubscribed, scanCount, freeTierLimit, remainingScans, paywallEnabled } = useSubscription();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const subscribeNow = async () => {
    // In a real implementation, this would redirect to a payment processor
    // For now, we'll just show a toast that this is a demo
    toast.info("This is a demo. In a real app, this would connect to a payment processor like Stripe.");
    
    // Redirect back to the capture page after subscription UI is shown
    navigate('/capture');
  };

  if (!paywallEnabled) {
    return (
      <div className="container max-w-4xl py-10">
        <div className="text-center space-y-4">
          <Leaf className="h-12 w-12 text-primary mx-auto" />
          <h1 className="text-3xl font-bold">Subscription Not Required</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            MealScanner is currently free to use without limits. Enjoy all features without a subscription!
          </p>
          <Button onClick={() => navigate('/capture')} className="mt-6">
            Continue to Capture
          </Button>
        </div>
      </div>
    );
  }

  if (isSubscribed) {
    return (
      <div className="container max-w-4xl py-10">
        <div className="text-center space-y-4">
          <div className="bg-primary/10 p-4 rounded-full inline-block mx-auto">
            <Check className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">You're Subscribed!</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Thank you for subscribing to MealScanner Pro. You have unlimited access to all features.
          </p>
          <Button onClick={() => navigate('/capture')} className="mt-6">
            Continue to Capture
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold">Upgrade Your MealScanner Experience</h1>
        <p className="text-muted-foreground mt-2 max-w-xl mx-auto">
          {scanCount >= freeTierLimit 
            ? "You've reached your free scan limit. Subscribe to continue analyzing meals." 
            : `You have ${remainingScans} free scans remaining.`}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Free Plan</CardTitle>
            <CardDescription>Basic meal scanning for occasional use</CardDescription>
            <div className="mt-4 text-3xl font-bold">Free</div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center">
              <Check className="h-5 w-5 text-primary mr-2" />
              <span>{freeTierLimit} meal scans</span>
            </div>
            <div className="flex items-center">
              <Check className="h-5 w-5 text-primary mr-2" />
              <span>Basic meal analysis</span>
            </div>
            <div className="flex items-center">
              <Check className="h-5 w-5 text-primary mr-2" />
              <span>Meal journaling</span>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" disabled={true}>
              Current Plan
            </Button>
          </CardFooter>
        </Card>

        <Card className="border-primary">
          <CardHeader className="bg-primary/5">
            <CardTitle>Pro Plan</CardTitle>
            <CardDescription>Advanced features for nutrition enthusiasts</CardDescription>
            <div className="mt-4 text-3xl font-bold">$4.99<span className="text-lg font-normal">/month</span></div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center">
              <Check className="h-5 w-5 text-primary mr-2" />
              <span className="font-bold">Unlimited meal scans</span>
            </div>
            <div className="flex items-center">
              <Check className="h-5 w-5 text-primary mr-2" />
              <span>Advanced nutritional insights</span>
            </div>
            <div className="flex items-center">
              <Check className="h-5 w-5 text-primary mr-2" />
              <span>Meal journaling</span>
            </div>
            <div className="flex items-center">
              <Check className="h-5 w-5 text-primary mr-2" />
              <span>Data export options</span>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={subscribeNow}>
              <CreditCard className="h-4 w-4 mr-2" />
              Subscribe Now
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="mt-10 text-center text-sm text-muted-foreground flex items-center justify-center">
        <Lock className="h-4 w-4 mr-1" />
        Secure payment processing. Cancel anytime.
      </div>
    </div>
  );
};

export default SubscriptionPage;
