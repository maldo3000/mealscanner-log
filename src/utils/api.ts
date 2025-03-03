
import { MealAnalysisResponse } from "@/types";

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

// Analyzing meal photo using GPT-4 Vision
export const analyzeMealPhoto = async (imageFile: File): Promise<MealAnalysisResponse> => {
  try {
    console.log("Analyzing meal photo:", imageFile.name);
    
    // For development without actual API access, we'll return mock data
    // In production, uncomment the code below to make a real API call
    
    /* Real implementation would look like this:
    const base64Image = await encodeImageToBase64(imageFile);
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
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
                  url: `data:image/jpeg;base64,${base64Image}`
                }
              }
            ]
          }
        ],
        max_tokens: 1000
      })
    });
    
    const result = await response.json();
    let parsedContent;
    try {
      // Extract the JSON from the content
      parsedContent = JSON.parse(result.choices[0].message.content);
    } catch (e) {
      console.error("Failed to parse GPT response", e);
      throw new Error("Invalid response format from GPT-4 Vision");
    }
    
    return parsedContent;
    */
    
    // For development, use mock data with some randomization
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
    
  } catch (error) {
    console.error("Error in analyzeMealPhoto:", error);
    throw error;
  }
};
