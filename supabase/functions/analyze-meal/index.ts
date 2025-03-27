
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

// CORS headers for all responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Create a Supabase client with admin privileges
const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Handle CORS preflight requests
const handleCors = (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  return null;
};

// Validate request data and environment variables
const validateRequest = (requestData: any) => {
  if (!openAIApiKey) {
    console.error('OpenAI API key not found');
    return { 
      isValid: false, 
      error: 'OpenAI API key not found in environment variables', 
      status: 500 
    };
  }

  if (requestData.type === 'photo' && !requestData.imageData) {
    console.error('No image data provided');
    return { 
      isValid: false, 
      error: 'No image data provided', 
      status: 400 
    };
  }

  if (requestData.type === 'text' && !requestData.description) {
    console.error('No meal description provided');
    return { 
      isValid: false, 
      error: 'No meal description provided', 
      status: 400 
    };
  }

  return { isValid: true };
};

// Verify user can scan and increment count if allowed
const verifyAndIncrementScanCount = async (req: Request) => {
  const authHeader = req.headers.get('Authorization');
  
  // If no auth header, anonymous user (continue without verification)
  if (!authHeader) {
    console.log('Anonymous user, skipping scan verification');
    return { canProceed: true };
  }
  
  try {
    // Get the JWT token from the Authorization header
    const token = authHeader.replace('Bearer ', '');
    
    // Verify the token and get the user
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      console.error('Auth error:', authError);
      return { 
        canProceed: false, 
        error: 'Authentication failed',
        status: 401
      };
    }
    
    // Get user subscription data
    const { data: subscriptionData, error: subError } = await supabaseAdmin
      .from('user_subscriptions')
      .select('is_subscribed, scan_count')
      .eq('user_id', user.id)
      .single();
    
    // Get app settings
    const { data: settingsData, error: settingsError } = await supabaseAdmin
      .from('app_settings')
      .select('paywall_enabled, free_tier_limit')
      .order('created_at', { ascending: false })
      .limit(1);
    
    // Handle errors with subscription or settings data
    if (subError || settingsError || !settingsData || settingsData.length === 0) {
      console.error('Error fetching data:', { subError, settingsError });
      
      // Default to allowing scan if data can't be fetched
      return { canProceed: true, message: 'Allowed due to data fetch error' };
    }
    
    const { paywall_enabled, free_tier_limit } = settingsData[0];
    
    // If paywall is disabled or user is subscribed, allow scanning
    if (!paywall_enabled || (subscriptionData && subscriptionData.is_subscribed)) {
      // Still increment the count for analytics
      await incrementScanCount(user.id, subscriptionData ? subscriptionData.scan_count + 1 : 1);
      return { canProceed: true };
    }
    
    // For non-subscribed users with paywall enabled, check if they've reached limit
    if (subscriptionData && subscriptionData.scan_count >= free_tier_limit) {
      return { 
        canProceed: false, 
        error: `You've reached your free scan limit of ${free_tier_limit}. Please subscribe to continue.`,
        status: 403
      };
    }
    
    // Increment the scan count and allow
    const newCount = subscriptionData ? subscriptionData.scan_count + 1 : 1;
    await incrementScanCount(user.id, newCount);
    
    return { 
      canProceed: true, 
      scanCount: newCount,
      remainingScans: free_tier_limit - newCount 
    };
    
  } catch (error) {
    console.error('Error in scan verification:', error);
    // Default to allowing scan on error
    return { canProceed: true, message: 'Allowed due to verification error' };
  }
};

// Helper function to increment scan count
const incrementScanCount = async (userId: string, newCount: number) => {
  try {
    const { error } = await supabaseAdmin
      .from('user_subscriptions')
      .update({ 
        scan_count: newCount, 
        updated_at: new Date().toISOString() 
      })
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error updating scan count:', error);
    }
  } catch (error) {
    console.error('Failed to update scan count:', error);
  }
};

// Create the system prompt with optional user notes
const createSystemPrompt = (requestType: string, notes?: string) => {
  let systemPrompt = `You are a nutritional analysis AI. ${requestType === 'photo' ? 'Analyze the food in the image' : 'Analyze the food description'} and provide the following information in JSON format:
1. "title": A concise title for this meal (just the food name)
2. "description": A detailed description of ${requestType === 'photo' ? 'what you see in the image' : 'the meal based on the description'}
3. "foodItems": An array of individual food items ${requestType === 'photo' ? 'visible in the image' : 'mentioned in the description'}
4. "nutrition": An object containing estimated nutritional information with these numeric properties:
   - "calories": Total calories
   - "protein": Protein in grams
   - "fat": Fat in grams
   - "carbs": Carbohydrates in grams
5. "nutritionScore": Overall healthiness rating (one of: "very healthy", "healthy", "moderate", "unhealthy", "not healthy")

Your analysis must be accurate to ${requestType === 'photo' ? 'what is visible in the image' : 'the information provided in the description'}. Provide your best estimate for nutrition values.
Your response MUST be valid JSON without any extra text, markdown, or explanations.`;

  if (notes && notes.trim().length > 0) {
    systemPrompt += `\n\nAdditional context from the user: ${notes}`;
  }

  return systemPrompt;
};

// Create the OpenAI API request payload for image analysis
const createImageOpenAIRequest = (systemPrompt: string, imageData: string) => {
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

// Create the OpenAI API request payload for text analysis
const createTextOpenAIRequest = (systemPrompt: string, description: string) => {
  return {
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: systemPrompt
      },
      {
        role: "user",
        content: `Analyze this meal description and provide nutritional information in the exact JSON format specified: "${description}"`
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

// Generate a simple placeholder image URL for text-based analysis
const generatePlaceholderImage = (foodTitle: string) => {
  // You could implement logic here to generate a more specific placeholder
  // For now, we'll just use a simple placeholder URL
  return `/placeholder.svg`;
};

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

    let openAIRequest;
    const requestType = requestData.type || 'photo';
    
    // Create the system prompt
    const systemPrompt = createSystemPrompt(
      requestType, 
      requestType === 'photo' ? requestData.notes : undefined
    );
    
    console.log(`Analyzing food ${requestType === 'photo' ? 'image' : 'description'} with OpenAI...`);
    
    // Create the OpenAI API request based on request type
    if (requestType === 'photo') {
      openAIRequest = createImageOpenAIRequest(systemPrompt, requestData.imageData);
    } else {
      openAIRequest = createTextOpenAIRequest(systemPrompt, requestData.description);
    }

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
      
      // Set the imageUrl based on request type
      if (requestType === 'photo') {
        // For photo analysis, use the provided image data as a data URL
        normalizedResult.imageUrl = `data:image/jpeg;base64,${requestData.imageData}`;
      } else {
        // For text analysis, generate a placeholder image URL
        normalizedResult.imageUrl = generatePlaceholderImage(normalizedResult.title);
      }
      
      console.log('Successfully parsed and validated meal analysis data');
      
      // Add scan verification data to the response
      if (scanVerification.remainingScans !== undefined) {
        normalizedResult.remainingScans = scanVerification.remainingScans;
        normalizedResult.scanCount = scanVerification.scanCount;
      }
      
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
