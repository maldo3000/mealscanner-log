
// Validate request data and environment variables
export const validateRequest = (requestData: any) => {
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  
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
