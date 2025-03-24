
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, X, Zap, CalendarCheck, Lock } from 'lucide-react';
import { PricingInfo } from '@/context/subscription';

interface SubscriptionPlanCardsProps {
  billingCycle: 'monthly' | 'yearly';
  freeTierLimit: number;
  pricing: PricingInfo | null;
  pricingKey: number;
}

const SubscriptionPlanCards: React.FC<SubscriptionPlanCardsProps> = ({ 
  billingCycle, 
  freeTierLimit, 
  pricing,
  pricingKey
}) => {
  const navigate = useNavigate();

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

  const subscribeNow = async (cycle: 'monthly' | 'yearly') => {
    // In a real implementation, this would redirect to a payment processor
    // For now, we'll just show a toast that this is a demo
    toast.info(`This is a demo. In a real app, this would connect to a payment processor for ${cycle} billing.`, {
      duration: 5000,
    });
    
    // Redirect back to the capture page after subscription UI is shown
    navigate('/capture');
  };

  return (
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
  );
};

export default SubscriptionPlanCards;
