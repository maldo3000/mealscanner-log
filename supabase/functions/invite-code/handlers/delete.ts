
import { corsHeaders } from "../utils.ts";

export async function deleteHandler(supabase: any, code: string) {
  console.log(`Deleting invite code: ${code}`);
  
  // Delete the specified code
  const { error: deleteError } = await supabase
    .from('invite_codes')
    .delete()
    .eq('code', code);
  
  if (deleteError) {
    console.error("Code deletion error:", deleteError);
    throw new Error(`Failed to delete invite code: ${deleteError.message}`);
  }
  
  console.log(`Successfully deleted code: ${code}`);
  
  return new Response(
    JSON.stringify({ success: true }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
