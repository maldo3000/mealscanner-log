
import { createAdminClient } from "../utils/auth.ts";
import { corsHeaders } from "../utils/cors.ts";

export const findUserByEmail = async (email: string) => {
  console.log(`Admin requested to find user with email: ${email}`);
  
  const supabaseAdmin = createAdminClient();
  
  // Use admin auth API to find a user by email
  const { data: { users }, error: findUserError } = await supabaseAdmin.auth.admin.listUsers({
    filters: {
      email: email
    }
  });
  
  if (findUserError || !users || users.length === 0) {
    console.error('Error finding user by email:', findUserError || 'No user found');
    return {
      success: false,
      error: 'User not found',
      status: 404
    };
  }
  
  const user = users[0];
  
  return {
    success: true,
    data: {
      userId: user.id,
      email: user.email
    }
  };
};
