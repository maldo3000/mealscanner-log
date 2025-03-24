
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
  console.log("Invite-code function called with method:", req.method);
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;
  
  try {
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Supabase credentials missing");
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error("Missing Authorization header");
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Verify user's auth token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      console.error("User auth error:", userError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized', details: userError }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Check if user is admin
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin');
    
    if (roleError) {
      console.error("Role check error:", roleError);
      return new Response(
        JSON.stringify({ error: 'Error checking user role', details: roleError }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const isAdmin = roleData && roleData.length > 0;
    
    // Parse request body
    const requestBody = await req.json();
    const { action, code, email, expiresInDays } = requestBody;
    
    console.log(`Processing action: ${action}, code: ${code}, email: ${email}`);
    
    // Handle each action type
    switch (action) {
      case 'validate': {
        // Anyone can validate a code
        const { data: validationResult, error: validationError } = await supabase.rpc(
          'validate_invite_code', 
          { code_to_check: code }
        );
        
        if (validationError) {
          console.error("Validation error:", validationError);
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
          console.error("Use code error:", useError);
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
        if (!isAdmin) {
          console.error("Non-admin attempted to generate code:", user.id);
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
        
        console.log(`Generating new code: ${newCode}, expires: ${expiresAt || 'never'}`);
        
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
          console.error("Code insertion error:", codeError);
          return new Response(
            JSON.stringify({ error: 'Failed to generate invite code', details: codeError }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        console.log("Successfully generated code:", codeData);
        
        return new Response(
          JSON.stringify({ success: true, code: codeData }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      case 'list': {
        // Only admins can list codes
        if (!isAdmin) {
          console.error("Non-admin attempted to list codes:", user.id);
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
          console.error("Code listing error:", codesError);
          return new Response(
            JSON.stringify({ error: 'Failed to fetch invite codes', details: codesError }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        console.log(`Retrieved ${codes?.length || 0} invite codes`);
        
        return new Response(
          JSON.stringify({ success: true, codes }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      case 'delete': {
        // Only admins can delete codes
        if (!isAdmin) {
          console.error("Non-admin attempted to delete code:", user.id);
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
          console.error("Code deletion error:", deleteError);
          return new Response(
            JSON.stringify({ error: 'Failed to delete invite code', details: deleteError }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        console.log(`Successfully deleted code: ${code}`);
        
        return new Response(
          JSON.stringify({ success: true }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      default:
        console.error("Invalid action requested:", action);
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
