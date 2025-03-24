
import { corsHeaders } from "../utils.ts";

export async function listHandler(supabase: any) {
  console.log("Listing all invite codes");
  
  // Get all invite codes
  const { data: codes, error: codesError } = await supabase
    .from('invite_codes')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (codesError) {
    console.error("Code listing error:", codesError);
    throw new Error(`Failed to fetch invite codes: ${codesError.message}`);
  }
  
  console.log(`Retrieved ${codes?.length || 0} invite codes`);
  
  return new Response(
    JSON.stringify({ success: true, codes }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
