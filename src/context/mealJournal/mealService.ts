
import { MealEntry } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { generateId } from '@/utils/helpers';
import { toast } from 'sonner';

export const loadMealsFromSupabase = async (userId: string): Promise<MealEntry[]> => {
  try {
    const { data, error } = await supabase
      .from('meals')
      .select('*')
      .eq('user_id', userId) // Explicitly filter by the current user's ID
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching meals from Supabase:', error);
      throw error;
    }
    
    if (!data) {
      return [];
    }
    
    const transformedData: MealEntry[] = data.map(meal => ({
      id: meal.id,
      title: meal.title,
      description: meal.description,
      mealType: meal.meal_type as any,
      foodItems: meal.food_items,
      imageUrl: meal.image_url || '',
      nutrition: typeof meal.nutrition === 'string' 
        ? JSON.parse(meal.nutrition) 
        : meal.nutrition,
      nutritionScore: meal.nutrition_score as any,
      notes: meal.notes || '',
      timestamp: meal.timestamp,
      createdAt: new Date(meal.created_at)
    }));
    
    console.log("Loaded meals from Supabase:", transformedData.length);
    return transformedData;
  } catch (error) {
    console.error('Error fetching meals from Supabase:', error);
    throw error;
  }
};

export const loadMealsFromLocalStorage = (): MealEntry[] => {
  const savedMeals = localStorage.getItem('mealJournal');
  if (savedMeals) {
    try {
      const parsedMeals = JSON.parse(savedMeals);
      const formattedMeals = parsedMeals.map((meal: any) => ({
        ...meal,
        createdAt: new Date(meal.createdAt)
      }));
      console.log("Loaded meals from localStorage:", formattedMeals.length);
      return formattedMeals;
    } catch (error) {
      console.error('Failed to parse saved meals:', error);
      return [];
    }
  }
  return [];
};

export const saveMealToSupabase = async (meal: MealEntry, userId: string): Promise<void> => {
  try {
    // Convert nutrition object to JSON string for Supabase
    const nutritionJson = JSON.stringify(meal.nutrition);
    
    const { error } = await supabase.from('meals').insert({
      id: meal.id,
      title: meal.title,
      description: meal.description,
      meal_type: meal.mealType,
      food_items: meal.foodItems,
      image_url: meal.imageUrl,
      nutrition: nutritionJson,
      nutrition_score: meal.nutritionScore,
      notes: meal.notes,
      timestamp: meal.timestamp,
      created_at: meal.createdAt.toISOString(),
      user_id: userId
    });
    
    if (error) {
      console.error('Error saving meal to Supabase:', error);
      toast.error('Failed to save meal to the server');
      throw error;
    }
    
    console.log('Meal saved successfully to Supabase');
  } catch (error) {
    console.error('Exception saving meal to Supabase:', error);
    throw error;
  }
};

export const updateMealInSupabase = async (id: string, updates: Partial<MealEntry>, userId: string): Promise<void> => {
  try {
    const supabaseUpdates: any = {};
    
    if (updates.title) supabaseUpdates.title = updates.title;
    if (updates.description) supabaseUpdates.description = updates.description;
    if (updates.mealType) supabaseUpdates.meal_type = updates.mealType;
    if (updates.foodItems) supabaseUpdates.food_items = updates.foodItems;
    if (updates.imageUrl) supabaseUpdates.image_url = updates.imageUrl;
    if (updates.nutrition) supabaseUpdates.nutrition = JSON.stringify(updates.nutrition);
    if (updates.nutritionScore) supabaseUpdates.nutrition_score = updates.nutritionScore;
    if (updates.notes !== undefined) supabaseUpdates.notes = updates.notes;
    if (updates.timestamp) supabaseUpdates.timestamp = updates.timestamp;
    if (updates.createdAt) supabaseUpdates.created_at = updates.createdAt.toISOString();
    
    const { error } = await supabase
      .from('meals')
      .update(supabaseUpdates)
      .eq('id', id)
      .eq('user_id', userId); // Ensure we're updating the user's own meal
    
    if (error) {
      console.error('Error updating meal in Supabase:', error);
      toast.error('Failed to update meal on the server');
      throw error;
    }
    
    console.log('Meal updated successfully in Supabase');
  } catch (error) {
    console.error('Exception updating meal in Supabase:', error);
    throw error;
  }
};

export const deleteMealFromSupabase = async (id: string, userId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('meals')
      .delete()
      .eq('id', id)
      .eq('user_id', userId); // Ensure we're deleting the user's own meal
    
    if (error) {
      console.error('Error deleting meal from Supabase:', error);
      toast.error('Failed to delete meal from the server');
      throw error;
    }
    
    console.log('Meal deleted successfully from Supabase');
  } catch (error) {
    console.error('Exception deleting meal from Supabase:', error);
    throw error;
  }
};

export const createNewMeal = (meal: Omit<MealEntry, 'id' | 'createdAt'>): MealEntry => {
  const now = new Date();
  return {
    ...meal,
    id: generateId(),
    createdAt: now,
    timestamp: now.toISOString(),
  };
};
