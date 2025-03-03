
import { MealAnalysisResponse } from "@/types";
import { supabase } from "@/integrations/supabase/client";

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

// Analyzing meal photo using GPT-4 Vision via Supabase Edge Function
export const analyzeMealPhoto = async (imageFile: File): Promise<MealAnalysisResponse> => {
  try {
    console.log("Analyzing meal photo:", imageFile.name);
    
    // Encode the image to base64
    const base64Image = await encodeImageToBase64(imageFile);
    
    // Call the Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('analyze-meal', {
      body: { imageData: base64Image }
    });
    
    if (error) {
      console.error("Edge function error:", error);
      throw new Error(`Edge function error: ${error.message}`);
    }
    
    if (!data) {
      throw new Error("No analysis data returned");
    }
    
    return data as MealAnalysisResponse;
  } catch (error) {
    console.error("Error in analyzeMealPhoto:", error);
    
    // For development/testing when Supabase integration is not available or fails
    if (process.env.NODE_ENV === 'development') {
      console.warn("Using mock data for meal analysis in development mode");
      
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
          
          resolve({
            title: mockTitles[randomIndex],
            description: mockDescriptions[randomIndex],
            foodItems: mockFoodItems[randomIndex],
            nutrition: {
              calories: mockCalories,
              protein: mockProtein,
              fat: mockFat,
              carbs: mockCarbs
            },
            nutritionScore
          });
        }, 2000); // Simulate 2-second API delay
      });
    }
    
    throw error;
  }
};
