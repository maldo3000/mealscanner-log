
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';

export type HealthGoal = 'weight_loss' | 'maintenance' | 'muscle_gain';

export interface MacroTarget {
  protein: number; // in grams
  carbs: number; // in grams
  fat: number; // in grams
}

export interface UserHealthData {
  height?: number; // in cm
  weight?: number; // in kg
  age?: number;
  gender?: 'male' | 'female' | 'other';
  activityLevel?: ActivityLevel;
  goal?: HealthGoal;
  calorieTarget?: number;
  macroTarget?: MacroTarget;
  isCustomPlan?: boolean;
}
