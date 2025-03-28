import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "./utils/cors.ts";
import { verifyAuth } from "./utils/auth.ts";
import { findUserByEmail } from "./handlers/findUserByEmail.ts";
import { resetScans } from "./handlers/resetScans.ts";
import { getUserDetails } from "./handlers/getUserDetails.ts";
import { getAllUsers } from "./handlers/getAllUsers.ts";

// This function manages user scan counts
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the request body
    const { action, userId, email, adminVerified } = await req.json();
    
    // Verify authentication and admin role
    const { authenticated, response } = await verifyAuth(req);
    if (!authenticated) {
      return response;
    }
    
    // Handle different actions
    if (action === 'find-user-by-email' && email) {
      const result = await findUserByEmail(email);
      
      if (!result.success) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: result.error 
          }), 
          { 
            status: result.status || 404,
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
          userId: result.data.userId,
          email: result.data.email
        }), 
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json'
          }
        }
      );
    }

    if (action === 'get-all-users') {
      const result = await getAllUsers();
      
      if (!result.success) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: result.error 
          }), 
          { 
            status: result.status || 500,
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
          data: result.data
        }), 
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json'
          }
        }
      );
    }

    if (action === 'reset-scans' && userId) {
      const result = await resetScans(userId);
      
      if (!result.success) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: result.error 
          }), 
          { 
            status: result.status || 500,
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
          ...result.data
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
      const result = await getUserDetails(userId);
      
      if (!result.success) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: result.error 
          }), 
          { 
            status: result.status || 500,
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
          user: result.data
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
