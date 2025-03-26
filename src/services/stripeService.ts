
import { supabase } from '@/integrations/supabase/client';

export async function createCheckoutSession(priceId: string, billingCycle: 'monthly' | 'yearly'): Promise<string | null> {
  try {
    // Get current user's session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw new Error('You must be logged in to subscribe');
    }
    
    // Call our Stripe edge function
    const { data, error } = await supabase.functions.invoke('stripe-payment', {
      body: {
        priceId,
        billingCycle,
        successUrl: `${window.location.origin}/subscription/success`,
        cancelUrl: `${window.location.origin}/subscription`,
      },
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });
    
    if (error) {
      console.error('Error creating checkout session:', error);
      throw new Error(error.message || 'Failed to create checkout session');
    }
    
    return data.url;
  } catch (error) {
    console.error('Error in createCheckoutSession:', error);
    return null;
  }
}
