
// CORS headers for all responses
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Handle preflight CORS requests
export function handleCors(req: Request) {
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: corsHeaders 
    });
  }
  return null;
}

// Create a random invite code
export function generateCode(length = 8) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excluding characters that can be confusing: 0, 1, I, O
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Create Supabase client
export function getSupabaseClient() {
  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase credentials missing');
  }
  
  return { supabaseUrl, supabaseServiceKey };
}

// Verify authentication token
export async function verifyAuth(supabase: any, authHeader: string | null) {
  if (!authHeader) {
    throw new Error('Missing Authorization header');
  }
  
  // Verify user's auth token
  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: userError } = await supabase.auth.getUser(token);
  
  if (userError || !user) {
    throw new Error(`Unauthorized: ${userError?.message || 'Invalid token'}`);
  }
  
  return user;
}

// Check if user is admin
export async function isUserAdmin(supabase: any, userId: string) {
  const { data: roleData, error: roleError } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .eq('role', 'admin');
  
  if (roleError) {
    throw new Error(`Error checking user role: ${roleError.message}`);
  }
  
  return roleData && roleData.length > 0;
}
