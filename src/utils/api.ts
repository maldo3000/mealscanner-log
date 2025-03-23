
import { MealAnalysisResponse } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { v4 as uuidv4 } from 'uuid';

// Function to encode an image file to base64
const encodeImageToBase64 = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === "string") {
        // Extract the base64 part (removing the data:image/jpeg;base64, prefix)
        const base64String = reader.result.split(',')[1];
        resolve(base64String);
      } else {
        reject(new Error("Failed to convert image to base64"));
      }
    };
    reader.onerror = error => reject(error);
  });
};

// Function to upload an image to Supabase Storage
export const uploadImageToStorage = async (file: File, userId?: string): Promise<string> => {
  try {
    // Create a unique file name
    const fileExt = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = userId 
      ? `${userId}/${fileName}`  // If logged in, store in user's folder
      : `public/${fileName}`;    // Otherwise, store in public folder
    
    // Upload to the 'meal-images' bucket
    const { data, error } = await supabase.storage
      .from('meal-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type
      });
    
    if (error) {
      console.error("Error uploading image:", error);
      throw error;
    }
    
    // Get public URL for the uploaded image
    const { data: urlData } = supabase.storage
      .from('meal-images')
      .getPublicUrl(filePath);
    
    return urlData.publicUrl;
  } catch (error) {
    console.error("Error uploading image to storage:", error);
    
    // For development/testing fallback: store locally if upload fails
    if (process.env.NODE_ENV === 'development') {
      const reader = new FileReader();
      return new Promise((resolve, reject) => {
        reader.onload = () => typeof reader.result === "string" ? resolve(reader.result) : reject();
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    }
    
    throw error;
  }
};

// Analyzing meal photo using GPT-4 Vision via Supabase Edge Function
export const analyzeMealPhoto = async (imageFile: File, notes?: string): Promise<MealAnalysisResponse & { imageUrl: string }> => {
  try {
    console.log("Analyzing meal photo:", imageFile.name);
    
    // Get user ID if authenticated
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;
    
    // Upload image to Supabase Storage
    const imageUrl = await uploadImageToStorage(imageFile, userId);
    
    // Encode the image to base64
    const base64Image = await encodeImageToBase64(imageFile);
    
    if (!base64Image || base64Image.length === 0) {
      throw new Error("Failed to encode image to base64");
    }
    
    console.log(`Image encoded successfully. Size: ${Math.round(base64Image.length / 1024)}KB`);
    
    // Call the Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('analyze-meal', {
      body: { 
        imageData: base64Image,
        notes: notes || ""
      }
    });
    
    if (error) {
      console.error("Edge function error:", error);
      throw new Error(`Edge function error: ${error.message}`);
    }
    
    if (!data) {
      throw new Error("No analysis data returned");
    }
    
    // Check if there's an error in the response data
    if (data.error) {
      console.error("API response error:", data.error);
      throw new Error(`API error: ${data.error}`);
    }
    
    console.log("Analysis successful:", data);
    
    // Validate the response structure
    const requiredFields = ['title', 'description', 'foodItems', 'nutrition', 'nutritionScore'];
    const missingFields = requiredFields.filter(field => !data[field]);
    
    if (missingFields.length > 0) {
      throw new Error(`Analysis data missing required fields: ${missingFields.join(', ')}`);
    }
    
    // Return the analysis data with the image URL
    return {
      ...data as MealAnalysisResponse,
      imageUrl
    };
  } catch (error) {
    console.error("Error in analyzeMealPhoto:", error);
    
    // For development/testing when Supabase integration is not available or fails
    if (process.env.NODE_ENV === 'development') {
      console.warn("Using mock data for meal analysis in development mode");
      
      // Upload image even in mock mode to get a persistent URL
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id;
      
      // Try to upload, but fall back to local storage if that fails
      let imageUrl;
      try {
        imageUrl = await uploadImageToStorage(imageFile, userId);
      } catch (err) {
        // Fall back to local URL if upload fails
        imageUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => typeof reader.result === "string" ? resolve(reader.result) : reject();
          reader.onerror = reject;
          reader.readAsDataURL(imageFile);
        });
      }
      
      // Use mock data with some randomization
      return new Promise((resolve) => {
        setTimeout(() => {
          // Randomize some values for testing different scenarios
          const mockFoodItems = [
            ["Whole grain toast", "Avocado", "Poached egg", "Red pepper flakes", "Microgreens"],
            ["Grilled chicken", "Brown rice", "Steamed broccoli", "Olive oil"],
            ["Beef burger", "White bun", "Cheese", "Lettuce", "Tomato", "Fries"],
            ["Strawberry smoothie", "Banana", "Protein powder", "Almond milk"],
            ["Garden salad", "Cherry tomatoes", "Cucumber", "Balsamic vinaigrette", "Feta cheese"]
          ];
          
          const mockDescriptions = [
            "A nutritious breakfast consisting of whole grain toast topped with mashed avocado, a perfectly poached egg, and a sprinkle of red pepper flakes and microgreens.",
            "A balanced meal featuring lean grilled chicken breast, a serving of brown rice, and steamed broccoli with a light drizzle of olive oil.",
            "A classic beef burger on a white bun with melted cheese, fresh lettuce, and tomato slices. Served with a side of french fries.",
            "A refreshing strawberry smoothie made with banana, protein powder, and almond milk. A perfect post-workout meal or breakfast option.",
            "A light and refreshing garden salad with cherry tomatoes, diced cucumber, crumbled feta cheese, and a light balsamic vinaigrette dressing."
          ];
          
          const mockTitles = [
            "Avocado Toast with Poached Egg",
            "Grilled Chicken with Brown Rice and Broccoli",
            "Cheeseburger with Fries",
            "Strawberry Banana Protein Smoothie",
            "Garden Salad with Balsamic Vinaigrette"
          ];
          
          // Random index for variety
          const randomIndex = Math.floor(Math.random() * mockFoodItems.length);
          
          // Random nutrition values with some constraints
          const mockCalories = 100 + Math.floor(Math.random() * 800);
          const mockProtein = 5 + Math.floor(Math.random() * 40);
          const mockFat = 3 + Math.floor(Math.random() * 35);
          const mockCarbs = 5 + Math.floor(Math.random() * 80);
          
          // Determine nutrition score based on calories
          let nutritionScore: "very healthy" | "healthy" | "moderate" | "unhealthy" | "not healthy";
          if (mockCalories < 300) nutritionScore = "very healthy";
          else if (mockCalories < 500) nutritionScore = "healthy";
          else if (mockCalories < 700) nutritionScore = "moderate";
          else if (mockCalories < 900) nutritionScore = "unhealthy";
          else nutritionScore = "not healthy";
          
          // If notes were provided, make small modifications to the mockup data
          let title = mockTitles[randomIndex];
          let description = mockDescriptions[randomIndex];
          let foodItems = [...mockFoodItems[randomIndex]];
          
          if (notes && notes.trim().length > 0) {
            console.log("Using notes for analysis:", notes);
            
            // Simple logic for mock implementation to simulate using notes
            if (notes.toLowerCase().includes("homemade")) {
              title = "Homemade " + title;
              description = "Homemade version of " + description;
            }
            
            if (notes.toLowerCase().includes("protein")) {
              foodItems.push("Extra protein");
              nutritionScore = "healthy";
            }
            
            if (notes.toLowerCase().includes("vegan") || notes.toLowerCase().includes("vegetarian")) {
              title = title + " (Plant-based)";
              foodItems = foodItems.map(item => {
                if (item.toLowerCase().includes("chicken") || item.toLowerCase().includes("beef")) {
                  return "Plant-based " + item;
                }
                return item;
              });
            }
          }
          
          resolve({
            title,
            description,
            foodItems,
            nutrition: {
              calories: mockCalories,
              protein: mockProtein,
              fat: mockFat,
              carbs: mockCarbs
            },
            nutritionScore,
            imageUrl
          });
        }, 2000); // Simulate 2-second API delay
      });
    }
    
    throw error;
  }
};
