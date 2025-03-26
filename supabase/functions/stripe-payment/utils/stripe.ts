
import Stripe from 'https://esm.sh/stripe@12.18.0';

// Get Stripe instance with proper configuration
export const getStripeInstance = (): Stripe => {
  const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
  if (!stripeSecretKey) {
    throw new Error('Stripe API key not configured');
  }

  return new Stripe(stripeSecretKey, {
    apiVersion: '2023-10-16',
  });
};
