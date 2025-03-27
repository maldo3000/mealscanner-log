
import { createAdminClient } from "../utils/auth.ts";

export const getUserDetails = async (userId: string) => {
  const supabaseAdmin = createAdminClient();
  
  // Get user subscription info
  const { data: subscriptionData, error: subscriptionError } = await supabaseAdmin
    .from('user_subscriptions')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  // Get user auth details (email)
  const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId);
  
  if (subscriptionError || userError) {
    console.error('Error fetching user details:', { subscriptionError, userError });
    return {
      success: false,
      error: 'Failed to fetch user details',
      status: 500
    };
  }
  
  return {
    success: true,
    data: {
      ...subscriptionData,
      email: userData?.user?.email
    }
  };
};
