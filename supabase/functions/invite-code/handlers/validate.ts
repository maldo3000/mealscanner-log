
import { corsHeaders } from "../utils.ts";

export async function validateHandler(supabase: any, code: string) {
  console.log(`Validating invite code: ${code}`);
  
  const { data: validationResult, error: validationError } = await supabase.rpc(
    'validate_invite_code', 
    { code_to_check: code }
  );
  
  if (validationError) {
    console.error("Validation error:", validationError);
    throw new Error(`Failed to validate code: ${validationError.message}`);
  }
  
  return new Response(
    JSON.stringify({ valid: validationResult }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
