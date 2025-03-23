
import { MealEntry } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

export const loadMealsFromSupabase = async (userId: string): Promise<MealEntry[]> => {
  try {
    console.log('Loading meals from Supabase for user:', userId);
    
    const { data, error } = await supabase
      .from('meals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching meals from Supabase:', error);
      throw error;
    }
    
    if (!data) {
      console.log('No meals found in Supabase');
      return [];
    }
    
    const transformedData: MealEntry[] = data.map(meal => ({
      id: meal.id,
      title: meal.title,
      description: meal.description,
      mealType: meal.meal_type,
      foodItems: meal.food_items,
      imageUrl: meal.image_url || '',
      nutrition: typeof meal.nutrition === 'string' 
        ? JSON.parse(meal.nutrition) 
        : meal.nutrition,
      nutritionScore: meal.nutrition_score,
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
    console.log('Saving meal to Supabase for user:', userId);
    
    // Ensure meal has correct user_id before saving
    const mealToSave = {
      ...meal,
      user_id: userId
    };
    
    // Convert nutrition object to JSON string for Supabase
    const nutritionJson = JSON.stringify(mealToSave.nutrition);
    
    const { error } = await supabase.from('meals').insert({
      id: mealToSave.id,
      title: mealToSave.title,
      description: mealToSave.description,
      meal_type: mealToSave.mealType,
      food_items: mealToSave.foodItems,
      image_url: mealToSave.imageUrl,
      nutrition: nutritionJson,
      nutrition_score: mealToSave.nutritionScore,
      notes: mealToSave.notes,
      timestamp: mealToSave.timestamp,
      created_at: mealToSave.createdAt.toISOString(),
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
    console.log('Updating meal in Supabase:', id, 'for user:', userId);
    
    const supabaseUpdates: any = {};
    
    if (updates.title) supabaseUpdates.title = updates.title;
    if (updates.description) supabaseUpdates.description = updates.description;
    if (updates.mealType) supabaseUpdates.meal_type = updates.mealType;
    if (updates.foodItems) supabaseUpdates.food_items = updates.foodItems;
    if (updates.imageUrl !== undefined) supabaseUpdates.image_url = updates.imageUrl;
    if (updates.nutrition) supabaseUpdates.nutrition = JSON.stringify(updates.nutrition);
    if (updates.nutritionScore) supabaseUpdates.nutrition_score = updates.nutritionScore;
    if (updates.notes !== undefined) supabaseUpdates.notes = updates.notes;
    if (updates.timestamp) supabaseUpdates.timestamp = updates.timestamp;
    if (updates.createdAt) supabaseUpdates.created_at = updates.createdAt.toISOString();
    
    const { error } = await supabase
      .from('meals')
      .update(supabaseUpdates)
      .eq('id', id)
      .eq('user_id', userId);
    
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
    console.log('Deleting meal from Supabase:', id, 'for user:', userId);
    
    const { error } = await supabase
      .from('meals')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);
    
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
    id: uuidv4(), // Use UUID for more reliable ID generation
    createdAt: now,
    timestamp: now.toISOString(),
  };
};
