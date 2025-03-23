
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

// CORS headers for all responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Handle CORS preflight requests
const handleCors = (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  return null;
};

// Validate request data and environment variables
const validateRequest = (imageData: string | undefined) => {
  if (!imageData) {
    console.error('No image data provided');
    return { 
      isValid: false, 
      error: 'No image data provided', 
      status: 400 
    };
  }

  if (!openAIApiKey) {
    console.error('OpenAI API key not found');
    return { 
      isValid: false, 
      error: 'OpenAI API key not found in environment variables', 
      status: 500 
    };
  }

  return { isValid: true };
};

// Create the system prompt with optional user notes
const createSystemPrompt = (notes?: string) => {
  let systemPrompt = `You are a nutritional analysis AI. Analyze the food in the image and provide the following information in JSON format:
1. "title": A concise title for this meal (just the food name)
2. "description": A detailed description of what you see in the image
3. "foodItems": An array of individual food items visible in the image
4. "nutrition": An object containing estimated nutritional information with these numeric properties:
   - "calories": Total calories
   - "protein": Protein in grams
   - "fat": Fat in grams
   - "carbs": Carbohydrates in grams
5. "nutritionScore": Overall healthiness rating (one of: "very healthy", "healthy", "moderate", "unhealthy", "not healthy")

Your analysis must be accurate to what is visible in the image. Provide your best estimate for nutrition values.
Your response MUST be valid JSON without any extra text, markdown, or explanations.`;

  if (notes && notes.trim().length > 0) {
    systemPrompt += `\n\nAdditional context from the user: ${notes}`;
  }

  return systemPrompt;
};

// Create the OpenAI API request payload
const createOpenAIRequest = (systemPrompt: string, imageData: string) => {
  return {
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: systemPrompt
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Analyze this food image and provide nutritional information in the exact JSON format specified."
          },
          {
            type: "image_url",
            image_url: {
              url: `data:image/jpeg;base64,${imageData}`
            }
          }
        ]
      }
    ],
    max_tokens: 1500
  };
};

// Call the OpenAI API
const callOpenAI = async (openAIRequest: any) => {
  console.log('Sending request to OpenAI API...');
  
  const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${openAIApiKey}`
    },
    body: JSON.stringify(openAIRequest)
  });

  if (!openAIResponse.ok) {
    const errorText = await openAIResponse.text();
    console.error('OpenAI API error:', openAIResponse.status, errorText);
    return { 
      isSuccess: false, 
      error: `OpenAI API error: ${openAIResponse.status}`, 
      details: errorText, 
      status: 500 
    };
  }

  return { 
    isSuccess: true, 
    data: await openAIResponse.json() 
  };
};

// Extract and parse JSON content from OpenAI response
const parseOpenAIResponse = (content: string) => {
  console.log('Raw content from OpenAI:', content);

  // Try to find JSON content if it's wrapped in backticks or has text around it
  const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || 
                   content.match(/```\s*([\s\S]*?)\s*```/) || 
                   content.match(/(\{[\s\S]*\})/);
  
  if (jsonMatch && jsonMatch[1]) {
    content = jsonMatch[1];
  }
  
  console.log('Attempting to parse JSON content');
  return JSON.parse(content);
};

// Validate the analysis result has required fields
const validateAnalysisResult = (analysisResult: any) => {
  const requiredFields = ['title', 'description', 'foodItems', 'nutrition', 'nutritionScore'];
  const missingFields = requiredFields.filter(field => !analysisResult[field]);
  
  if (missingFields.length > 0) {
    console.error('Missing required fields in analysis result:', missingFields);
    return { 
      isValid: false, 
      error: `Missing required fields in analysis result: ${missingFields.join(', ')}`,
      content: JSON.stringify(analysisResult)
    };
  }
  
  return { isValid: true };
};

// Validate and normalize nutrition fields
const normalizeNutritionFields = (analysisResult: any) => {
  // Ensure nutrition has all required properties
  const nutritionFields = ['calories', 'protein', 'fat', 'carbs'];
  const missingNutritionFields = nutritionFields.filter(field => 
    !analysisResult.nutrition || analysisResult.nutrition[field] === undefined
  );
  
  if (missingNutritionFields.length > 0) {
    console.error('Missing nutrition fields in analysis result:', missingNutritionFields);
    // For fields that are missing, set them to a default value to prevent UI issues
    if (!analysisResult.nutrition) {
      analysisResult.nutrition = {};
    }
    
    missingNutritionFields.forEach(field => {
      analysisResult.nutrition[field] = 0;
    });
    
    console.log('Added default values for missing nutrition fields');
  }
  
  // Ensure all nutrition values are numbers
  Object.keys(analysisResult.nutrition).forEach(key => {
    if (typeof analysisResult.nutrition[key] === 'string') {
      // Convert string to number, removing any non-numeric characters
      const cleanedValue = analysisResult.nutrition[key].replace(/[^\d.]/g, '');
      analysisResult.nutrition[key] = parseFloat(cleanedValue) || 0;
    }
  });
  
  return analysisResult;
};

// Main handler function
serve(async (req) => {
  // Handle CORS preflight requests
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    console.log('Received request to analyze meal image');
    
    // Parse the request body
    const { imageData, notes } = await req.json();
    
    // Validate input
    const validation = validateRequest(imageData);
    if (!validation.isValid) {
      return new Response(
        JSON.stringify({ error: validation.error }), 
        { status: validation.status as number, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create the system prompt
    const systemPrompt = createSystemPrompt(notes);
    
    console.log('Analyzing food image with OpenAI Vision API...');
    
    // Create the OpenAI API request
    const openAIRequest = createOpenAIRequest(systemPrompt, imageData);

    // Call the OpenAI API
    const openAIResult = await callOpenAI(openAIRequest);
    
    if (!openAIResult.isSuccess) {
      return new Response(
        JSON.stringify({ 
          error: openAIResult.error, 
          details: openAIResult.details 
        }), 
        { status: openAIResult.status as number, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = openAIResult.data;
    console.log('Received response from OpenAI');
    
    if (!data.choices || data.choices.length === 0) {
      console.error('No choices in OpenAI response:', data);
      return new Response(
        JSON.stringify({ error: 'Invalid response from OpenAI API', data }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    try {
      // Parse the OpenAI response
      const content = data.choices[0].message.content;
      const analysisResult = parseOpenAIResponse(content);
      
      // Validate the analysis result
      const resultValidation = validateAnalysisResult(analysisResult);
      if (!resultValidation.isValid) {
        return new Response(
          JSON.stringify({ 
            error: resultValidation.error,
            content: resultValidation.content
          }), 
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Normalize nutrition fields
      const normalizedResult = normalizeNutritionFields(analysisResult);
      
      // Set the imageUrl to the data URL
      normalizedResult.imageUrl = `data:image/jpeg;base64,${imageData}`;
      
      console.log('Successfully parsed and validated meal analysis data');
      console.log('Analysis result:', JSON.stringify(normalizedResult, null, 2));
      
      // Return the analysis result
      return new Response(
        JSON.stringify(normalizedResult),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError);
      console.error('Failed to parse content:', data.choices[0].message.content);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to parse OpenAI response', 
          message: parseError.message,
          rawContent: data.choices[0].message.content 
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
