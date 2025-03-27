
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "./cors.ts";

// Create a Supabase client with the admin service role
export const createAdminClient = () => {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    {
      auth: { persistSession: false }
    }
  );
};

// Verify admin role for the authenticated user
export const verifyAdminRole = async (token: string) => {
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false }
    }
  );
  
  const { data: isAdmin, error: roleCheckError } = await supabaseClient.rpc('has_role', { 
    _role: 'admin' 
  });
  
  if (roleCheckError || !isAdmin) {
    return { isAdmin: false, error: roleCheckError || 'Not an admin' };
  }
  
  return { isAdmin: true, error: null };
};

// Verify authentication from request
export const verifyAuth = async (req: Request) => {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return { 
      authenticated: false, 
      token: null,
      response: new Response(
        JSON.stringify({ error: 'Unauthorized request' }), 
        { 
          status: 401, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json'
          }
        }
      )
    };
  }
  
  // Extract the token
  const token = authHeader.replace('Bearer ', '');
  
  // Verify admin role
  const { isAdmin, error } = await verifyAdminRole(token);
  
  if (!isAdmin) {
    return {
      authenticated: false,
      token,
      response: new Response(
        JSON.stringify({ error: 'Admin privileges required' }), 
        { 
          status: 403, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json'
          }
        }
      )
    };
  }
  
  return { authenticated: true, token, response: null };
};
