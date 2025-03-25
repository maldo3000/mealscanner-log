
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSubscription } from '@/context/subscription';

const SubscriptionSuccess: React.FC = () => {
  const navigate = useNavigate();
  const { setIsSubscribed } = useSubscription();
  
  useEffect(() => {
    // Update subscription status in context
    setIsSubscribed(true);
    
    // Show success message
    toast.success('Your subscription has been activated');
  }, [setIsSubscribed]);
  
  return (
    <div className="container max-w-md py-16 flex flex-col items-center text-center">
      <div className="bg-primary/10 p-6 rounded-full mb-6">
        <CheckCircle className="h-16 w-16 text-primary" />
      </div>
      
      <h1 className="text-3xl font-bold mb-4">Subscription Activated!</h1>
      
      <p className="text-muted-foreground mb-8">
        Thank you for subscribing to MealScanner Pro. You now have unlimited access to all premium features.
      </p>
      
      <div className="space-y-4 w-full">
        <Button 
          className="w-full" 
          onClick={() => navigate('/capture')}
        >
          Start Scanning
        </Button>
        
        <Button 
          variant="outline" 
          className="w-full" 
          onClick={() => navigate('/profile')}
        >
          View Profile
        </Button>
      </div>
    </div>
  );
};

export default SubscriptionSuccess;
