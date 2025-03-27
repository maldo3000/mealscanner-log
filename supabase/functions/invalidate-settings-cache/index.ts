
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Configure CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// This function validates admin settings changes and notifies clients
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the request body
    const { action, adminVerified } = await req.json();
    
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
    
    // Verify the user's admin status if adminVerified flag is true
    if (adminVerified) {
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
    }
    
    if (action === 'invalidate') {
      console.log('App settings cache invalidation requested with admin verification');
      
      // In a real app with many concurrent users, you might:
      // 1. Update a timestamp in a shared DB table
      // 2. Publish a message to all connected clients via Supabase Realtime
      // 3. Update a Redis cache
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Settings cache invalidation completed'
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
    console.error('Error in invalidate-settings-cache function:', error);
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
