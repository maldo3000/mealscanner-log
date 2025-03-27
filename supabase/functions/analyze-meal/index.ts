
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { corsHeaders, handleCors } from "./utils/cors.ts";
import { validateRequest } from "./utils/validation.ts";
import { verifyAndIncrementScanCount } from "./utils/auth.ts";
import { analyzePhotoMeal, analyzeTextMeal } from "./handlers/analyze.ts";

// Main handler function
serve(async (req) => {
  // Handle CORS preflight requests
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    console.log('Received request to analyze meal');
    
    // Parse the request body
    const requestData = await req.json();
    console.log('Request type:', requestData.type);
    
    // Validate input
    const validation = validateRequest(requestData);
    if (!validation.isValid) {
      return new Response(
        JSON.stringify({ error: validation.error }), 
        { status: validation.status as number, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Verify user can scan and increment count if allowed
    const scanVerification = await verifyAndIncrementScanCount(req);
    if (!scanVerification.canProceed) {
      return new Response(
        JSON.stringify({ 
          error: scanVerification.error,
          scanLimitReached: true,
          remainingScans: 0
        }), 
        { status: scanVerification.status || 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const requestType = requestData.type || 'photo';
    
    // Process the meal analysis based on request type
    try {
      if (requestType === 'photo') {
        const result = await analyzePhotoMeal(requestData);
        
        // Add scan verification data to the response
        if (scanVerification.remainingScans !== undefined) {
          result.remainingScans = scanVerification.remainingScans;
          result.scanCount = scanVerification.scanCount;
        }
        
        return new Response(
          JSON.stringify(result),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } else {
        const result = await analyzeTextMeal(requestData);
        
        // Add scan verification data to the response
        if (scanVerification.remainingScans !== undefined) {
          result.remainingScans = scanVerification.remainingScans;
          result.scanCount = scanVerification.scanCount;
        }
        
        return new Response(
          JSON.stringify(result),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } catch (analysisError) {
      console.error('Error in meal analysis:', analysisError);
      return new Response(
        JSON.stringify({ 
          error: analysisError.message || 'Failed to analyze meal',
          details: analysisError.details || analysisError.stack
        }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Unexpected error in analyze-meal function:', error);
    return new Response(
      JSON.stringify({ error: `Unexpected error: ${error.message}` }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
