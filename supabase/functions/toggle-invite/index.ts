
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
  console.log("Toggle invite function called with method:", req.method);
  
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: corsHeaders 
    });
  }

  try {
    // Verify the request method
    if (req.method !== 'POST') {
      console.error("Method not allowed:", req.method);
      return new Response(
        JSON.stringify({ success: false, error: 'Method not allowed' }), 
        { 
          status: 405, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      );
    }

    // Extract the Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error("Missing Authorization header");
      return new Response(
        JSON.stringify({ success: false, error: 'Missing Authorization header' }), 
        { 
          status: 401, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      );
    }

    // Get the JWT token from the Authorization header
    const token = authHeader.replace('Bearer ', '');
    
    // Verify the token and get the user
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      console.error("Auth error:", authError);
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }), 
        { 
          status: 401, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      );
    }

    // Parse the request body to get the new settings
    const requestData = await req.json();
    const { inviteOnly } = requestData;
    
    console.log(`Updating app settings: inviteOnly=${inviteOnly}`);

    // Check if the user is an admin
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin');

    if (roleError) {
      console.error("Role check error:", roleError);
      return new Response(
        JSON.stringify({ success: false, error: 'Error checking user role', details: roleError.message }), 
        { 
          status: 500, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      );
    }

    if (!roleData || roleData.length === 0) {
      console.error("User is not an admin:", user.id);
      return new Response(
        JSON.stringify({ success: false, error: 'Admin access required' }), 
        { 
          status: 403, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      );
    }

    // Get the most recent app settings ID
    const { data: settingsData, error: settingsError } = await supabaseAdmin
      .from('app_settings')
      .select('id')
      .order('created_at', { ascending: false })
      .limit(1);

    if (settingsError) {
      console.error('Error getting app settings ID:', settingsError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to get app settings', details: settingsError.message }), 
        { 
          status: 500, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      );
    }

    if (!settingsData || settingsData.length === 0) {
      console.log('No settings found, creating new settings');
      // If no settings exist, create one
      const { data: newSettings, error: createError } = await supabaseAdmin
        .from('app_settings')
        .insert({ invite_only_registration: inviteOnly })
        .select();
      
      if (createError) {
        console.error('Error creating app settings:', createError);
        return new Response(
          JSON.stringify({ success: false, error: 'Failed to create app settings', details: createError.message }), 
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
          message: `Invite-only mode ${inviteOnly ? 'enabled' : 'disabled'}`,
          data: newSettings[0]
        }), 
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      );
    }

    // Update the app settings
    const settingsId = settingsData[0].id;
    console.log(`Updating settings with ID ${settingsId} to invite_only_registration=${inviteOnly}`);
    
    // Update the app settings
    const { data, error } = await supabaseAdmin
      .from('app_settings')
      .update({ 
        invite_only_registration: inviteOnly, 
        updated_at: new Date().toISOString()
      })
      .eq('id', settingsId)
      .select();

    if (error) {
      console.error('Error updating invite settings:', error);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to update invite settings', details: error.message }), 
        { 
          status: 500, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      );
    }

    if (!data || data.length === 0) {
      console.error('No data returned after update');
      return new Response(
        JSON.stringify({ success: false, error: 'No data returned after update' }), 
        { 
          status: 500, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      );
    }

    console.log('Update successful:', data[0]);
    
    // Verify update was applied correctly
    const { data: verifySettings, error: verifyError } = await supabaseAdmin
      .from('app_settings')
      .select('invite_only_registration')
      .eq('id', settingsId)
      .single();
      
    if (verifyError) {
      console.error('Error verifying settings update:', verifyError);
    } else {
      console.log('Verified settings after update:', verifySettings);
      
      if (verifySettings.invite_only_registration !== inviteOnly) {
        console.error('CRITICAL ERROR: The database value does not match what was requested!');
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Database update verification failed',
            expected: inviteOnly,
            actual: verifySettings.invite_only_registration
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
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Invite-only mode ${inviteOnly ? 'enabled' : 'disabled'}`,
        data: data[0] 
      }), 
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  } catch (error) {
    console.error('Error in toggle-invite function:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error', details: error.message }), 
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
