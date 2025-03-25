
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import Stripe from 'https://esm.sh/stripe@12.18.0';

// Configure CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Create a Supabase client with the auth context of the function
const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      return new Response(
        JSON.stringify({ error: 'Stripe API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    });

    // Extract the Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing Authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the JWT token from the Authorization header
    const token = authHeader.replace('Bearer ', '');
    
    // Verify the token and get the user
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get URL and path
    const url = new URL(req.url);
    const path = url.pathname.split('/').pop();

    // Create checkout session
    if (path === 'create-checkout-session' && req.method === 'POST') {
      const { priceId, billingCycle, successUrl, cancelUrl } = await req.json();

      if (!priceId || !billingCycle || !successUrl || !cancelUrl) {
        return new Response(
          JSON.stringify({ error: 'Missing required parameters' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Create Stripe checkout session
      const session = await stripe.checkout.sessions.create({
        customer_email: user.email,
        client_reference_id: user.id,
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        subscription_data: {
          metadata: {
            userId: user.id,
          },
        },
        success_url: successUrl,
        cancel_url: cancelUrl,
      });

      return new Response(
        JSON.stringify({ url: session.url }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Handle subscription webhook (for Stripe webhook integration)
    if (path === 'webhook' && req.method === 'POST') {
      const payload = await req.text();
      const signature = req.headers.get('stripe-signature');
      
      if (!signature) {
        return new Response(
          JSON.stringify({ error: 'Missing Stripe signature' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
      if (!webhookSecret) {
        return new Response(
          JSON.stringify({ error: 'Stripe webhook secret not configured' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      let event;
      try {
        event = stripe.webhooks.constructEvent(
          payload,
          signature,
          webhookSecret
        );
      } catch (err) {
        console.error(`Webhook signature verification failed: ${err.message}`);
        return new Response(
          JSON.stringify({ error: `Webhook Error: ${err.message}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Handle the event
      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object;
          const userId = session.client_reference_id;
          
          if (userId) {
            // Update user subscription status in database
            const { error } = await supabaseAdmin
              .from('user_subscriptions')
              .update({ 
                is_subscribed: true,
                subscription_start: new Date().toISOString(),
                subscription_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year from now
              })
              .eq('user_id', userId);

            if (error) {
              console.error('Error updating subscription:', error);
            }
          }
          break;
        }
        
        case 'customer.subscription.deleted': {
          const subscription = event.data.object;
          const userId = subscription.metadata.userId;
          
          if (userId) {
            // Update user subscription status in database
            const { error } = await supabaseAdmin
              .from('user_subscriptions')
              .update({ 
                is_subscribed: false,
                subscription_end: new Date().toISOString(),
              })
              .eq('user_id', userId);

            if (error) {
              console.error('Error updating subscription:', error);
            }
          }
          break;
        }
      }

      return new Response(JSON.stringify({ received: true }), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    // If we reach here, the requested endpoint wasn't found
    return new Response(
      JSON.stringify({ error: 'Endpoint not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error in stripe-payment function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
