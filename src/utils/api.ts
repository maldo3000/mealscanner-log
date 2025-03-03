
import { MealAnalysisResponse } from "@/types";

// Simulating API call to GPT-4 Vision for analyzing meal photos
export const analyzeMealPhoto = async (imageFile: File): Promise<MealAnalysisResponse> => {
  // In a real implementation, this would make an API call to a backend service
  // that would then use GPT-4 Vision API to analyze the image
  console.log("Analyzing meal photo:", imageFile.name);
  
  // For development, we'll return mock data with a delay to simulate API processing
  return new Promise((resolve) => {
    setTimeout(() => {
      // Mock response with random data variation
      const calories = Math.floor(300 + Math.random() * 700);
      
      resolve({
        title: "Homemade Avocado Toast with Poached Egg",
        description: "A nutritious breakfast consisting of whole grain toast topped with mashed avocado, a perfectly poached egg, and a sprinkle of red pepper flakes and microgreens.",
        foodItems: [
          "Whole grain bread", 
          "Avocado", 
          "Poached egg", 
          "Red pepper flakes", 
          "Microgreens", 
          "Sea salt"
        ],
        nutrition: {
          calories: calories,
          protein: Math.floor(15 + Math.random() * 10),
          fat: Math.floor(15 + Math.random() * 10),
          carbs: Math.floor(20 + Math.random() * 15)
        },
        nutritionScore: calories < 500 ? "healthy" : "moderate"
      });
    }, 2000);
  });
};
