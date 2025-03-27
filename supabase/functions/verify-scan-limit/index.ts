
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

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
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Extract the Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing Authorization header',
          canScan: false 
        }), 
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get the JWT token from the Authorization header
    const token = authHeader.replace('Bearer ', '');
    
    // Verify the token and get the user
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ 
          error: 'Unauthorized',
          canScan: false 
        }), 
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Check if user is already subscribed (subscribed users can always scan)
    const { data: subscriptionData, error: subscriptionError } = await supabaseAdmin
      .from('user_subscriptions')
      .select('is_subscribed, scan_count')
      .eq('user_id', user.id)
      .single();
    
    if (subscriptionError) {
      console.error('Error fetching subscription data:', subscriptionError);
      // Create a subscription record if it doesn't exist
      if (subscriptionError.code === 'PGRST116') { // not_found
        await supabaseAdmin
          .from('user_subscriptions')
          .insert([
            { user_id: user.id, scan_count: 0, is_subscribed: false }
          ]);
        
        // New users can scan
        return new Response(
          JSON.stringify({ 
            canScan: true, 
            scanCount: 0,
            isSubscribed: false,
            remainingScans: null, // Will be calculated in the frontend
            newUser: true
          }), 
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      
      return new Response(
        JSON.stringify({ 
          error: 'Failed to fetch subscription data',
          canScan: false 
        }), 
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // If user is subscribed, they can always scan
    if (subscriptionData.is_subscribed) {
      return new Response(
        JSON.stringify({ 
          canScan: true,
          isSubscribed: true,
          scanCount: subscriptionData.scan_count
        }), 
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get the app settings to check paywall and free tier limit
    const { data: settingsData, error: settingsError } = await supabaseAdmin
      .from('app_settings')
      .select('paywall_enabled, free_tier_limit')
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (settingsError || !settingsData || settingsData.length === 0) {
      console.error('Error fetching app settings:', settingsError);
      
      // Default to allowing scan if settings can't be fetched
      return new Response(
        JSON.stringify({ 
          canScan: true,
          isSubscribed: false,
          scanCount: subscriptionData.scan_count,
          error: 'Failed to fetch app settings, defaulting to allow'
        }), 
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const { paywall_enabled, free_tier_limit } = settingsData[0];
    
    // If paywall is disabled, user can scan
    if (!paywall_enabled) {
      return new Response(
        JSON.stringify({ 
          canScan: true,
          isSubscribed: false,
          scanCount: subscriptionData.scan_count,
          paywallEnabled: false
        }), 
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Check if user has reached the free tier limit
    const canScan = subscriptionData.scan_count < free_tier_limit;
    const remainingScans = free_tier_limit - subscriptionData.scan_count;
    
    return new Response(
      JSON.stringify({ 
        canScan,
        isSubscribed: false,
        scanCount: subscriptionData.scan_count,
        remainingScans,
        paywallEnabled: true,
        freeTierLimit: free_tier_limit
      }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Error in verify-scan-limit function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        canScan: false 
      }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
