
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '@/context/SubscriptionContext';
import { useAuth } from '@/context/auth';
import { CreditCard, Check, Leaf, Lock, ArrowRight, Zap, X, CalendarCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

const SubscriptionPage: React.FC = () => {
  const { isSubscribed, scanCount, freeTierLimit, remainingScans, paywallEnabled, pricing } = useSubscription();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const subscribeNow = async (cycle: 'monthly' | 'yearly') => {
    // In a real implementation, this would redirect to a payment processor
    // For now, we'll just show a toast that this is a demo
    toast.info(`This is a demo. In a real app, this would connect to a payment processor for ${cycle} billing.`, {
      duration: 5000,
    });
    
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

  const getDisplayPrice = () => {
    if (!pricing) return { monthly: '$4.99', yearly: '$49.99', discount: 15 };
    
    return {
      monthly: `$${pricing.monthlyPrice.toFixed(2)}`,
      yearly: `$${pricing.yearlyPrice.toFixed(2)}`,
      discount: pricing.yearlyDiscountPercent
    };
  };

  const prices = getDisplayPrice();
  const yearlyPerMonth = billingCycle === 'yearly' 
    ? (pricing?.yearlyPrice || 49.99) / 12 
    : null;

  return (
    <div className="container py-10">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold">Upgrade Your MealScanner Experience</h1>
        <p className="text-muted-foreground mt-2 max-w-xl mx-auto">
          {scanCount >= freeTierLimit 
            ? "You've reached your free scan limit. Subscribe to continue analyzing meals." 
            : `You have ${remainingScans} free scans remaining.`}
        </p>

        <div className="mt-6 max-w-xs mx-auto">
          <Tabs 
            defaultValue="monthly" 
            value={billingCycle} 
            onValueChange={(value) => setBillingCycle(value as 'monthly' | 'yearly')}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
              <TabsTrigger value="yearly">
                Yearly <span className="ml-1 text-xs text-green-500">{prices.discount}% off</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
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
            <div className="flex items-center">
              <X className="h-5 w-5 text-muted-foreground mr-2" />
              <span className="text-muted-foreground">Advanced nutritional insights</span>
            </div>
            <div className="flex items-center">
              <X className="h-5 w-5 text-muted-foreground mr-2" />
              <span className="text-muted-foreground">Data export options</span>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" disabled={true}>
              Current Plan
            </Button>
          </CardFooter>
        </Card>

        <Card className="border-primary relative overflow-hidden">
          {/* Recommended badge */}
          <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-xs font-bold">
            RECOMMENDED
          </div>
          
          <CardHeader className="bg-primary/5">
            <CardTitle>Pro Plan</CardTitle>
            <CardDescription>Advanced features for nutrition enthusiasts</CardDescription>
            <div className="mt-4">
              <div className="text-3xl font-bold">
                {billingCycle === 'monthly' ? prices.monthly : prices.yearly}
                <span className="text-lg font-normal">
                  /{billingCycle === 'monthly' ? 'month' : 'year'}
                </span>
              </div>
              {billingCycle === 'yearly' && yearlyPerMonth && (
                <div className="text-sm text-muted-foreground mt-1">
                  That's just ${yearlyPerMonth.toFixed(2)}/month
                </div>
              )}
            </div>
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
            <div className="flex items-center">
              <Check className="h-5 w-5 text-primary mr-2" />
              <span>Priority support</span>
            </div>
            <div className="flex items-center">
              <CalendarCheck className="h-5 w-5 text-primary mr-2" />
              <span>
                {billingCycle === 'monthly' ? 'Monthly billing, cancel anytime' : 'Annual billing, best value'}
              </span>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={() => subscribeNow(billingCycle)}>
              <Zap className="h-4 w-4 mr-2" />
              Upgrade Now
            </Button>
          </CardFooter>
        </Card>
      </div>

      {scanCount > 0 && (
        <div className="mt-8 max-w-md mx-auto bg-muted p-4 rounded-md">
          <h3 className="font-medium mb-2">Your current usage</h3>
          <div className="w-full bg-background rounded-full h-2.5">
            <div 
              className="bg-primary h-2.5 rounded-full" 
              style={{ width: `${Math.min(100, (scanCount / freeTierLimit) * 100)}%` }}
            ></div>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            {scanCount} of {freeTierLimit} free scans used ({remainingScans} remaining)
          </p>
        </div>
      )}

      <div className="mt-10 text-center text-sm text-muted-foreground flex items-center justify-center">
        <Lock className="h-4 w-4 mr-1" />
        Secure payment processing. Cancel anytime.
      </div>
      
      <div className="mt-6 text-center">
        <Button variant="link" onClick={() => navigate('/capture')}>
          Return to Meal Scanner
          <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default SubscriptionPage;
