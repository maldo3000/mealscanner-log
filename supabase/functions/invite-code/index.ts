
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

// Configure CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Handle preflight requests
function handleCors(req: Request) {
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: corsHeaders 
    });
  }
  return null;
}

// Create a random invite code
function generateCode(length = 8) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excluding characters that can be confusing: 0, 1, I, O
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

serve(async (req: Request) => {
  // Handle CORS preflight request
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;
  
  try {
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Verify user's auth token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized', details: userError }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Check if user is admin
    const { data: roleData, error: roleError } = await supabase.rpc('has_role', { 
      _role: 'admin' 
    });
    
    // Parse request body
    const { action, code, email, expiresInDays } = await req.json();
    
    // Handle each action type
    switch (action) {
      case 'validate': {
        // Anyone can validate a code
        const { data: validationResult, error: validationError } = await supabase.rpc(
          'validate_invite_code', 
          { code_to_check: code }
        );
        
        if (validationError) {
          return new Response(
            JSON.stringify({ error: 'Failed to validate code', details: validationError }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        return new Response(
          JSON.stringify({ valid: validationResult }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      case 'use': {
        // Mark a code as used during signup
        const { data: useResult, error: useError } = await supabase.rpc(
          'use_invite_code', 
          { code_to_use: code, user_email: email }
        );
        
        if (useError) {
          return new Response(
            JSON.stringify({ error: 'Failed to use invite code', details: useError }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        return new Response(
          JSON.stringify({ success: useResult }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      case 'generate': {
        // Only admins can generate codes
        if (!roleData) {
          return new Response(
            JSON.stringify({ error: 'Unauthorized. Admin role required.' }),
            { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        const newCode = generateCode();
        let expiresAt = null;
        
        if (expiresInDays) {
          const date = new Date();
          date.setDate(date.getDate() + expiresInDays);
          expiresAt = date.toISOString();
        }
        
        // Insert the new code into the database
        const { data: codeData, error: codeError } = await supabase
          .from('invite_codes')
          .insert({
            code: newCode,
            email: email || null,
            created_by: user.id,
            expires_at: expiresAt
          })
          .select()
          .single();
        
        if (codeError) {
          return new Response(
            JSON.stringify({ error: 'Failed to generate invite code', details: codeError }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        return new Response(
          JSON.stringify({ code: codeData }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      case 'list': {
        // Only admins can list codes
        if (!roleData) {
          return new Response(
            JSON.stringify({ error: 'Unauthorized. Admin role required.' }),
            { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        // Get all invite codes
        const { data: codes, error: codesError } = await supabase
          .from('invite_codes')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (codesError) {
          return new Response(
            JSON.stringify({ error: 'Failed to fetch invite codes', details: codesError }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        return new Response(
          JSON.stringify({ codes }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      case 'delete': {
        // Only admins can delete codes
        if (!roleData) {
          return new Response(
            JSON.stringify({ error: 'Unauthorized. Admin role required.' }),
            { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        // Delete the specified code
        const { error: deleteError } = await supabase
          .from('invite_codes')
          .delete()
          .eq('code', code);
        
        if (deleteError) {
          return new Response(
            JSON.stringify({ error: 'Failed to delete invite code', details: deleteError }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        return new Response(
          JSON.stringify({ success: true }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      case 'get_settings': {
        // Only admins can get settings
        if (!roleData) {
          return new Response(
            JSON.stringify({ error: 'Unauthorized. Admin role required.' }),
            { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        // Get the app settings
        const { data: settings, error: settingsError } = await supabase
          .from('app_settings')
          .select('invite_only_registration')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        
        if (settingsError) {
          return new Response(
            JSON.stringify({ error: 'Failed to fetch app settings', details: settingsError }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        return new Response(
          JSON.stringify({ settings }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      case 'update_settings': {
        // Only admins can update settings
        if (!roleData) {
          return new Response(
            JSON.stringify({ error: 'Unauthorized. Admin role required.' }),
            { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        const { inviteOnly } = await req.json();
        
        // Get the most recent app settings record
        const { data: settingsData, error: settingsError } = await supabase
          .from('app_settings')
          .select('id')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        
        if (settingsError) {
          return new Response(
            JSON.stringify({ error: 'Failed to fetch app settings', details: settingsError }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        // Update the app settings
        const { data: updateData, error: updateError } = await supabase
          .from('app_settings')
          .update({ invite_only_registration: inviteOnly })
          .eq('id', settingsData.id)
          .select()
          .single();
        
        if (updateError) {
          return new Response(
            JSON.stringify({ error: 'Failed to update app settings', details: updateError }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        return new Response(
          JSON.stringify({ settings: updateData }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
    console.error('Error in invite-code function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
