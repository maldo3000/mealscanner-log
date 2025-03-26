
import { corsHeaders } from "../utils/cors.ts";
import { createSupabaseClient, SupabaseConfig } from "../utils/supabase.ts";
import { getStripeInstance } from "../utils/stripe.ts";

export async function createCheckoutHandler(req: Request, supabaseConfig: SupabaseConfig) {
  try {
    const stripe = getStripeInstance();
    const supabaseAdmin = createSupabaseClient(supabaseConfig);

    // Get the JWT token from the Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing Authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const token = authHeader.replace('Bearer ', '');
    
    // Verify the token and get the user
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const requestData = await req.json();
    const { priceId, billingCycle, successUrl, cancelUrl } = requestData;

    if (!priceId || !billingCycle || !successUrl || !cancelUrl) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Creating checkout session for user ${user.id} with priceId ${priceId}, cycle: ${billingCycle}`);

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

    console.log(`Checkout session created: ${session.id}, URL: ${session.url}`);

    return new Response(
      JSON.stringify({ url: session.url }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in checkout handler:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}
