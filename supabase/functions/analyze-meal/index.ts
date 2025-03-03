
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

// CORS headers to allow requests from our frontend
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
    // Parse the request body
    const { imageData } = await req.json();
    
    if (!imageData) {
      throw new Error('No image data provided');
    }
    
    console.log("Received request to analyze meal image");
    
    // Get the OpenAI API key from environment variables
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }
    
    // Call OpenAI API to analyze the image
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are a nutritionist AI that analyzes food images. 
                     Extract and return ONLY a JSON object with the following structure:
                     {
                        "title": "Brief descriptive title of the meal",
                        "description": "Detailed description of what's in the image",
                        "foodItems": ["Array of all identifiable food items"],
                        "nutrition": {
                          "calories": estimated calories (number),
                          "protein": estimated protein in grams (number),
                          "fat": estimated fat in grams (number),
                          "carbs": estimated carbs in grams (number)
                        },
                        "nutritionScore": "very healthy" | "healthy" | "moderate" | "unhealthy" | "not healthy"
                     }`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Analyze this meal image and provide nutritional information.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${imageData}`
                }
              }
            ]
          }
        ],
        max_tokens: 1000
      })
    });
    
    const result = await response.json();
    console.log("OpenAI API response received");
    
    // Extract and parse the JSON from the content
    let parsedContent;
    try {
      parsedContent = JSON.parse(result.choices[0].message.content);
      console.log("Successfully parsed OpenAI response", parsedContent.title);
    } catch (e) {
      console.error("Failed to parse OpenAI response", e);
      console.error("Raw response content:", result.choices[0].message.content);
      throw new Error("Invalid response format from GPT-4 Vision");
    }
    
    // Return the analysis result
    return new Response(
      JSON.stringify(parsedContent),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    );
    
  } catch (error) {
    console.error("Error in analyze-meal function:", error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
