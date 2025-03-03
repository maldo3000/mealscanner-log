
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Get the request body
    const { imageData, notes } = await req.json();
    
    if (!imageData) {
      console.error('No image data provided');
      return new Response(
        JSON.stringify({ error: 'No image data provided' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Get OpenAI API key from environment variable
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!openAIApiKey) {
      console.error('OpenAI API key not configured');
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log('Analyzing food image with OpenAI Vision...');
    
    // Prepare the system prompt
    let systemPrompt = `You are a nutritional analysis AI. Analyze the food in the image and provide the following information in JSON format:
1. A concise title for the meal (property: title)
2. A short description of the meal (property: description)
3. A list of identified food items (property: foodItems as string array)
4. Estimated nutrition information (property: nutrition with calories, protein in grams, fat in grams, and carbs in grams)
5. A nutritional score (property: nutritionScore) which must be one of: "very healthy", "healthy", "moderate", "unhealthy", or "not healthy"

Your response must be valid JSON with these exact property names.`;

    // Add the notes into the system prompt if provided
    if (notes && notes.trim().length > 0) {
      systemPrompt += `\n\nAdditional context from the user: "${notes}"\nPlease take this context into account when analyzing the image.`;
    }
    
    // Make the OpenAI API request
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openAIApiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${imageData}`,
                },
              },
            ],
          },
        ],
        max_tokens: 800,
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      return new Response(
        JSON.stringify({ error: `OpenAI API error: ${response.status} ${response.statusText}`, details: errorData }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const responseData = await response.json();
    
    // Extract the content from the response
    const content = responseData.choices[0].message.content;
    console.log('OpenAI Response:', content);
    
    try {
      // Parse the JSON from the content
      const analysisResult = JSON.parse(content);
      
      // Validate the analysis result has required fields
      const requiredFields = ['title', 'description', 'foodItems', 'nutrition', 'nutritionScore'];
      const missingFields = requiredFields.filter(field => !analysisResult[field]);
      
      if (missingFields.length > 0) {
        console.error('Missing required fields in analysis result:', missingFields);
        return new Response(
          JSON.stringify({ 
            error: `Missing required fields in analysis result: ${missingFields.join(', ')}`,
            content: content
          }), 
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Ensure nutrition has all required properties
      const nutritionFields = ['calories', 'protein', 'fat', 'carbs'];
      const missingNutritionFields = nutritionFields.filter(field => 
        !analysisResult.nutrition || analysisResult.nutrition[field] === undefined
      );
      
      if (missingNutritionFields.length > 0) {
        console.error('Missing nutrition fields in analysis result:', missingNutritionFields);
        return new Response(
          JSON.stringify({ 
            error: `Missing nutrition fields in analysis result: ${missingNutritionFields.join(', ')}`,
            content: content
          }), 
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Return the analysis result
      return new Response(
        JSON.stringify(analysisResult),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (jsonError) {
      console.error('Error parsing OpenAI response as JSON:', jsonError);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid response format from OpenAI',
          content: content // Include the raw content for debugging
        }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Error in analyze-meal function:', error);
    return new Response(
      JSON.stringify({ error: error.message }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
