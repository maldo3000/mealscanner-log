
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { corsHeaders, handleCors, getSupabaseClient, verifyAuth, isUserAdmin } from "./utils.ts";
import { validateHandler } from "./handlers/validate.ts";
import { useHandler } from "./handlers/use.ts";
import { generateHandler } from "./handlers/generate.ts";
import { listHandler } from "./handlers/list.ts";
import { deleteHandler } from "./handlers/delete.ts";

serve(async (req: Request) => {
  // Handle CORS preflight request
  console.log("Invite-code function called with method:", req.method);
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;
  
  try {
    // Create Supabase client
    const { supabaseUrl, supabaseServiceKey } = getSupabaseClient();
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    
    // Parse request body
    const requestBody = await req.json();
    const { action, code, email, expiresInDays } = requestBody;
    
    console.log(`Processing action: ${action}, code: ${code}, email: ${email}`);
    
    // Handle each action type
    switch (action) {
      case 'validate': {
        // Anyone can validate a code
        return await validateHandler(supabase, code);
      }
      
      case 'use': {
        // Mark a code as used during signup
        return await useHandler(supabase, code, email);
      }
      
      case 'generate': {
        // Only admins can generate codes
        const user = await verifyAuth(supabase, authHeader);
        const admin = await isUserAdmin(supabase, user.id);
        
        if (!admin) {
          console.error("Non-admin attempted to generate code:", user.id);
          return new Response(
            JSON.stringify({ error: 'Unauthorized. Admin role required.' }),
            { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        return await generateHandler(supabase, user.id, email, expiresInDays);
      }
      
      case 'list': {
        // Only admins can list codes
        const user = await verifyAuth(supabase, authHeader);
        const admin = await isUserAdmin(supabase, user.id);
        
        if (!admin) {
          console.error("Non-admin attempted to list codes:", user.id);
          return new Response(
            JSON.stringify({ error: 'Unauthorized. Admin role required.' }),
            { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        return await listHandler(supabase);
      }
      
      case 'delete': {
        // Only admins can delete codes
        const user = await verifyAuth(supabase, authHeader);
        const admin = await isUserAdmin(supabase, user.id);
        
        if (!admin) {
          console.error("Non-admin attempted to delete code:", user.id);
          return new Response(
            JSON.stringify({ error: 'Unauthorized. Admin role required.' }),
            { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        return await deleteHandler(supabase, code);
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
