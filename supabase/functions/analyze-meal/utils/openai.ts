
// Create the system prompt with optional user notes
export const createSystemPrompt = (requestType: string, notes?: string) => {
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
export const createImageOpenAIRequest = (systemPrompt: string, imageData: string) => {
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
export const createTextOpenAIRequest = (systemPrompt: string, description: string) => {
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
export const callOpenAI = async (openAIRequest: any) => {
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
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
export const parseOpenAIResponse = (content: string) => {
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
export const validateAnalysisResult = (analysisResult: any) => {
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
export const normalizeNutritionFields = (analysisResult: any) => {
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
export const generatePlaceholderImage = () => {
  return `/placeholder.svg`;
};
