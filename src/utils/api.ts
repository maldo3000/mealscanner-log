
import { supabase } from "@/integrations/supabase/client";
import { MealAnalysisResponse } from "@/types";
import { v4 as uuidv4 } from 'uuid';

// Convert an image file to a base64 string
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        // Extract the base64 part without the prefix
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      } else {
        reject(new Error('Failed to convert file to base64'));
      }
    };
    reader.onerror = error => reject(error);
  });
};

// Upload an image to Supabase Storage and return the URL
export const uploadImageToStorage = async (imageFile: File, userId?: string): Promise<string> => {
  try {
    // Generate a unique file name
    const fileExt = imageFile.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    
    // Determine the storage path based on authentication
    const storagePath = userId 
      ? `${userId}/${fileName}` // User's folder if authenticated
      : `public/${fileName}`; // Public folder if not authenticated
    
    const { data, error } = await supabase.storage
      .from('meal-images')
      .upload(storagePath, imageFile, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
    
    // Get the public URL for the uploaded file
    const { data: urlData } = supabase.storage
      .from('meal-images')
      .getPublicUrl(storagePath);
    
    return urlData.publicUrl;
  } catch (error) {
    console.error('Failed to upload image:', error);
    // If upload fails, return a data URL as fallback
    const base64 = await fileToBase64(imageFile);
    return `data:${imageFile.type};base64,${base64}`;
  }
};

// Analyze a meal photo using the Supabase Edge Function
export const analyzeMealPhoto = async (
  photoFile: File, 
  notes?: string
): Promise<MealAnalysisResponse> => {
  try {
    // First upload the image to get a permanent URL
    const imageUrl = await uploadImageToStorage(photoFile);
    
    // Convert the photo to base64 for the AI analysis
    const base64 = await fileToBase64(photoFile);
    
    // Call the Supabase Edge Function for meal analysis
    const { data, error } = await supabase.functions.invoke('analyze-meal', {
      body: { 
        imageData: base64,
        notes,
        type: 'photo'
      }
    });
    
    if (error) {
      console.error('Error calling analyze-meal function:', error);
      throw new Error(`Analysis failed: ${error.message}`);
    }
    
    if (!data) {
      throw new Error('No data returned from meal analysis');
    }
    
    // Add the permanent image URL to the analysis result
    const result: MealAnalysisResponse = {
      ...data,
      imageUrl: imageUrl // Use the URL from Storage instead of the data URL
    };
    
    return result;
  } catch (error) {
    console.error('Error analyzing meal photo:', error);
    throw error;
  }
};

// Analyze a meal text description using the Supabase Edge Function
export const analyzeMealText = async (description: string): Promise<MealAnalysisResponse> => {
  try {
    console.log("Analyzing meal description:", description);
    
    // Call the Supabase Edge Function for meal analysis
    const { data, error } = await supabase.functions.invoke('analyze-meal', {
      body: { 
        description,
        type: 'text'
      }
    });
    
    if (error) {
      console.error('Error calling analyze-meal function for text analysis:', error);
      throw new Error(`Analysis failed: ${error.message}`);
    }
    
    if (!data) {
      throw new Error('No data returned from meal text analysis');
    }
    
    // For text analysis, we'll use a placeholder image
    const result: MealAnalysisResponse = {
      ...data,
      imageUrl: data.imageUrl || '/placeholder.svg' // Use placeholder if no image URL is provided
    };
    
    return result;
  } catch (error) {
    console.error('Error analyzing meal description:', error);
    throw error;
  }
};
