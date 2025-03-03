
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'random';

export type NutritionScore = 'very healthy' | 'healthy' | 'moderate' | 'unhealthy' | 'not healthy';

export interface NutritionInfo {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}

export interface MealEntry {
  id: string;
  title: string;
  description: string;
  foodItems: string[];
  nutrition: NutritionInfo;
  nutritionScore: NutritionScore;
  imageUrl: string;
  mealType: MealType;
  notes?: string;
  timestamp: string;
  createdAt: Date;
}

export interface MealAnalysisResponse {
  title: string;
  description: string;
  foodItems: string[];
  nutrition: NutritionInfo;
  nutritionScore: NutritionScore;
}
