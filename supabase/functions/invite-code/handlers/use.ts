
import { corsHeaders } from "../utils.ts";

export async function useHandler(supabase: any, code: string, email: string) {
  console.log(`Using invite code: ${code} for email: ${email}`);
  
  const { data: useResult, error: useError } = await supabase.rpc(
    'use_invite_code', 
    { code_to_use: code, user_email: email }
  );
  
  if (useError) {
    console.error("Use code error:", useError);
    throw new Error(`Failed to use invite code: ${useError.message}`);
  }
  
  return new Response(
    JSON.stringify({ success: useResult }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
