
import { corsHeaders } from "../utils/cors.ts";
import { 
  createSystemPrompt, 
  createImageOpenAIRequest, 
  createTextOpenAIRequest,
  callOpenAI,
  parseOpenAIResponse,
  validateAnalysisResult,
  normalizeNutritionFields,
  generatePlaceholderImage
} from "../utils/openai.ts";

// Analyze a meal photo
export const analyzePhotoMeal = async (requestData: any) => {
  try {
    console.log(`Analyzing food image with OpenAI...`);
    
    // Create the system prompt
    const systemPrompt = createSystemPrompt('photo', requestData.notes);
    
    // Create the OpenAI API request
    const openAIRequest = createImageOpenAIRequest(systemPrompt, requestData.imageData);

    // Call the OpenAI API
    const openAIResult = await callOpenAI(openAIRequest);
    
    if (!openAIResult.isSuccess) {
      throw new Error(openAIResult.error || 'Failed to call OpenAI API');
    }

    const data = openAIResult.data;
    console.log('Received response from OpenAI');
    
    if (!data.choices || data.choices.length === 0) {
      console.error('No choices in OpenAI response:', data);
      throw new Error('Invalid response from OpenAI API');
    }

    // Parse the OpenAI response
    const content = data.choices[0].message.content;
    const analysisResult = parseOpenAIResponse(content);
    
    // Validate the analysis result
    const resultValidation = validateAnalysisResult(analysisResult);
    if (!resultValidation.isValid) {
      throw new Error(resultValidation.error || 'Invalid analysis result');
    }
    
    // Normalize nutrition fields
    const normalizedResult = normalizeNutritionFields(analysisResult);
    
    // Set the imageUrl for photo analysis
    normalizedResult.imageUrl = `data:image/jpeg;base64,${requestData.imageData}`;
    
    console.log('Successfully parsed and validated meal analysis data');
    
    return normalizedResult;
  } catch (error) {
    console.error('Error in photo meal analysis:', error);
    throw error;
  }
};

// Analyze a meal text description
export const analyzeTextMeal = async (requestData: any) => {
  try {
    console.log(`Analyzing food description with OpenAI...`);
    
    // Create the system prompt
    const systemPrompt = createSystemPrompt('text');
    
    // Create the OpenAI API request
    const openAIRequest = createTextOpenAIRequest(systemPrompt, requestData.description);

    // Call the OpenAI API
    const openAIResult = await callOpenAI(openAIRequest);
    
    if (!openAIResult.isSuccess) {
      throw new Error(openAIResult.error || 'Failed to call OpenAI API');
    }

    const data = openAIResult.data;
    console.log('Received response from OpenAI');
    
    if (!data.choices || data.choices.length === 0) {
      console.error('No choices in OpenAI response:', data);
      throw new Error('Invalid response from OpenAI API');
    }

    // Parse the OpenAI response
    const content = data.choices[0].message.content;
    const analysisResult = parseOpenAIResponse(content);
    
    // Validate the analysis result
    const resultValidation = validateAnalysisResult(analysisResult);
    if (!resultValidation.isValid) {
      throw new Error(resultValidation.error || 'Invalid analysis result');
    }
    
    // Normalize nutrition fields
    const normalizedResult = normalizeNutritionFields(analysisResult);
    
    // For text analysis, use a placeholder image
    normalizedResult.imageUrl = normalizedResult.imageUrl || generatePlaceholderImage();
    
    console.log('Successfully parsed and validated meal text analysis data');
    
    return normalizedResult;
  } catch (error) {
    console.error('Error in text meal analysis:', error);
    throw error;
  }
};
