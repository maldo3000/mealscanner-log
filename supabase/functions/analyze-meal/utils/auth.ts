
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

// Create a Supabase client with admin privileges
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

// Verify user can scan and increment count if allowed
export const verifyAndIncrementScanCount = async (req: Request) => {
  const authHeader = req.headers.get('Authorization');
  
  // If no auth header, anonymous user (continue without verification)
  if (!authHeader) {
    console.log('Anonymous user, skipping scan verification');
    return { canProceed: true };
  }
  
  try {
    // Get the JWT token from the Authorization header
    const token = authHeader.replace('Bearer ', '');
    
    // Verify the token and get the user
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      console.error('Auth error:', authError);
      return { 
        canProceed: false, 
        error: 'Authentication failed',
        status: 401
      };
    }
    
    // Get user subscription data
    const { data: subscriptionData, error: subError } = await supabaseAdmin
      .from('user_subscriptions')
      .select('is_subscribed, scan_count')
      .eq('user_id', user.id)
      .single();
    
    // Get app settings
    const { data: settingsData, error: settingsError } = await supabaseAdmin
      .from('app_settings')
      .select('paywall_enabled, free_tier_limit')
      .order('created_at', { ascending: false })
      .limit(1);
    
    // Handle errors with subscription or settings data
    if (subError || settingsError || !settingsData || settingsData.length === 0) {
      console.error('Error fetching data:', { subError, settingsError });
      
      // Default to allowing scan if data can't be fetched
      return { canProceed: true, message: 'Allowed due to data fetch error' };
    }
    
    const { paywall_enabled, free_tier_limit } = settingsData[0];
    
    // If paywall is disabled or user is subscribed, allow scanning
    if (!paywall_enabled || (subscriptionData && subscriptionData.is_subscribed)) {
      // Still increment the count for analytics
      await incrementScanCount(user.id, subscriptionData ? subscriptionData.scan_count + 1 : 1);
      return { 
        canProceed: true,
        freeTierLimit: free_tier_limit // Include current free tier limit
      };
    }
    
    // For non-subscribed users with paywall enabled, check if they've reached limit
    if (subscriptionData && subscriptionData.scan_count >= free_tier_limit) {
      return { 
        canProceed: false, 
        error: `You've reached your free scan limit of ${free_tier_limit}. Please subscribe to continue.`,
        status: 403,
        freeTierLimit: free_tier_limit
      };
    }
    
    // Increment the scan count and allow
    const newCount = subscriptionData ? subscriptionData.scan_count + 1 : 1;
    await incrementScanCount(user.id, newCount);
    
    return { 
      canProceed: true, 
      scanCount: newCount,
      remainingScans: free_tier_limit - newCount,
      freeTierLimit: free_tier_limit // Include current free tier limit
    };
    
  } catch (error) {
    console.error('Error in scan verification:', error);
    // Default to allowing scan on error
    return { canProceed: true, message: 'Allowed due to verification error' };
  }
};

// Helper function to increment scan count
export const incrementScanCount = async (userId: string, newCount: number) => {
  try {
    const { error } = await supabaseAdmin
      .from('user_subscriptions')
      .update({ 
        scan_count: newCount, 
        updated_at: new Date().toISOString() 
      })
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error updating scan count:', error);
    }
  } catch (error) {
    console.error('Failed to update scan count:', error);
  }
};
