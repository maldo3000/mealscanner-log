import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createCheckoutHandler } from "./handlers/checkout.ts";
import { corsHeaders } from "./utils/cors.ts";

// Create a Supabase client configuration that can be passed to handlers
const supabaseConfig = {
  url: Deno.env.get('SUPABASE_URL') ?? '',
  serviceRoleKey: Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
};

// Main function to serve all requests
serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Extract the endpoint from the URL path
  const url = new URL(req.url);
  const endpoint = url.pathname.split('/').pop();

  try {
    // Route to appropriate handler based on the endpoint
    switch (endpoint) {
      case 'checkout':
        return await createCheckoutHandler(req, supabaseConfig);
      // Add more endpoints here as needed
      // case 'webhook':
      //   return await webhookHandler(req);
      default:
        // Default to checkout if no specific endpoint is provided
        return await createCheckoutHandler(req, supabaseConfig);
    }
  } catch (error) {
    console.error('Error in stripe-payment function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
