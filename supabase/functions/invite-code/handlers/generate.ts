
import { corsHeaders, generateCode } from "../utils.ts";

export async function generateHandler(supabase: any, userId: string, email: string | null, expiresInDays: number | null) {
  const newCode = generateCode();
  let expiresAt = null;
  
  if (expiresInDays) {
    const date = new Date();
    date.setDate(date.getDate() + expiresInDays);
    expiresAt = date.toISOString();
  }
  
  console.log(`Generating new code: ${newCode}, expires: ${expiresAt || 'never'}, email: ${email || 'none'}`);
  
  // Insert the new code into the database
  const { data: codeData, error: codeError } = await supabase
    .from('invite_codes')
    .insert({
      code: newCode,
      email: email || null,
      created_by: userId,
      expires_at: expiresAt
    })
    .select()
    .single();
  
  if (codeError) {
    console.error("Code insertion error:", codeError);
    throw new Error(`Failed to generate invite code: ${codeError.message}`);
  }
  
  console.log("Successfully generated code:", codeData);
  
  return new Response(
    JSON.stringify({ success: true, code: codeData }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
