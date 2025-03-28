
import { createAdminClient } from "../utils/auth.ts";

export const getAllUsers = async () => {
  console.log('Admin requested list of all users');
  
  const supabaseAdmin = createAdminClient();
  
  // Get all users from auth.users table using the admin API
  const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers();
  
  if (error) {
    console.error('Error fetching users:', error);
    return {
      success: false,
      error: 'Failed to fetch users',
      status: 500
    };
  }
  
  // Process users and fetch their subscription details
  const enhancedUsers = [];
  
  for (const user of users) {
    // Get user subscription info for each user
    const { data: subscriptionData, error: subError } = await supabaseAdmin
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    if (subError) {
      console.log(`Warning: Could not fetch subscription for user ${user.id}:`, subError);
    }
    
    enhancedUsers.push({
      id: user.id,
      email: user.email,
      created_at: user.created_at,
      ...subscriptionData
    });
  }
  
  return {
    success: true,
    data: enhancedUsers
  };
};
