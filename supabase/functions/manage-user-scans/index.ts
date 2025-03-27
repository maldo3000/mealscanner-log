
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Configure CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// This function manages user scan counts
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the request body
    const { action, userId, adminVerified } = await req.json();
    
    // Verify that this is an authenticated request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized request' }), 
        { 
          status: 401, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json'
          }
        }
      );
    }
    
    // Extract the token
    const token = authHeader.replace('Bearer ', '');
    
    // Create a Supabase client with the provided token
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: { headers: { Authorization: `Bearer ${token}` } },
        auth: { persistSession: false }
      }
    );
    
    // Verify the user's admin status
    const { data: isAdmin, error: roleCheckError } = await supabaseClient.rpc('has_role', { 
      _role: 'admin' 
    });
    
    if (roleCheckError || !isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Admin privileges required' }), 
        { 
          status: 403, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json'
          }
        }
      );
    }
    
    // Create admin client with service role key for operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: { persistSession: false }
      }
    );

    if (action === 'reset-scans' && userId) {
      console.log(`Admin requested scan count reset for user: ${userId}`);
      
      // Reset scan count to 0
      const { data, error } = await supabaseAdmin
        .from('user_subscriptions')
        .update({ 
          scan_count: 0,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);
      
      if (error) {
        console.error('Error resetting user scan count:', error);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Failed to reset scan count'
          }), 
          { 
            status: 500,
            headers: { 
              ...corsHeaders, 
              'Content-Type': 'application/json'
            }
          }
        );
      }
      
      // Trigger cache invalidation for that user
      await supabaseClient.functions.invoke('invalidate-settings-cache', {
        body: { 
          action: 'invalidate',
          adminVerified: true
        }
      }).catch(error => {
        console.log('Cache invalidation not available or failed:', error);
      });
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'User scan count reset successfully'
        }), 
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json'
          }
        }
      );
    }
    
    if (action === 'get-user-details' && userId) {
      // Get user subscription info
      const { data: subscriptionData, error: subscriptionError } = await supabaseAdmin
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      // Get user auth details (email)
      const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId);
      
      if (subscriptionError || userError) {
        console.error('Error fetching user details:', { subscriptionError, userError });
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Failed to fetch user details'
          }), 
          { 
            status: 500,
            headers: { 
              ...corsHeaders, 
              'Content-Type': 'application/json'
            }
          }
        );
      }
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          user: {
            ...subscriptionData,
            email: userData?.user?.email
          }
        }), 
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json'
          }
        }
      );
    }
    
    return new Response(
      JSON.stringify({ 
        error: 'Invalid action'
      }), 
      { 
        status: 400,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json'
        }
      }
    );
    
  } catch (error) {
    console.error('Error in manage-user-scans function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error'
      }), 
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json'
        }
      }
    );
  }
});
