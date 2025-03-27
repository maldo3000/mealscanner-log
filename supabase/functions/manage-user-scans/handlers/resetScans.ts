
import { createAdminClient } from "../utils/auth.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export const resetScans = async (userId: string) => {
  console.log(`Admin requested scan count reset for user: ${userId}`);
  
  const supabaseAdmin = createAdminClient();
  
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
    return {
      success: false,
      error: 'Failed to reset scan count',
      status: 500
    };
  }
  
  // Create a regular client for invoking functions
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    {
      auth: { persistSession: false }
    }
  );
  
  // Trigger cache invalidation for that user
  try {
    await supabaseClient.functions.invoke('invalidate-settings-cache', {
      body: { 
        action: 'invalidate',
        adminVerified: true
      }
    });
  } catch (error) {
    console.log('Cache invalidation not available or failed:', error);
    // Continue even if cache invalidation fails
  }
  
  return {
    success: true,
    data: {
      message: 'User scan count reset successfully'
    }
  };
};
