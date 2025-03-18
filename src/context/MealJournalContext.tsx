
import React, { createContext, useContext, useState, useEffect } from 'react';
import { MealEntry, MealType, NutritionScore } from '@/types';
import { generateId } from '@/utils/helpers';
import { toast } from 'sonner';
import { 
  startOfDay, 
  endOfDay, 
  startOfWeek, 
  endOfWeek, 
  isWithinInterval, 
  isSameDay,
} from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

export type FilterPeriod = 'day' | 'week' | 'custom' | null;

interface MealJournalContextType {
  meals: MealEntry[];
  addMeal: (meal: Omit<MealEntry, 'id' | 'createdAt'>) => void;
  updateMeal: (id: string, updates: Partial<MealEntry>) => void;
  deleteMeal: (id: string) => void;
  getMeal: (id: string) => MealEntry | undefined;
  filteredMeals: MealEntry[];
  setFilterDate: (date: Date | null) => void;
  setFilterMealType: (type: MealType | null) => void;
  setFilterNutritionScore: (score: NutritionScore | null) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  clearFilters: () => void;
  filterDate: Date | null;
  filterMealType: MealType | null;
  filterNutritionScore: NutritionScore | null;
  filterPeriod: FilterPeriod;
  setFilterPeriod: (period: FilterPeriod) => void;
  customDateRange: { start: Date | null; end: Date | null };
  setCustomDateRange: (range: { start: Date | null; end: Date | null }) => void;
  totalCalories: number;
}

const MealJournalContext = createContext<MealJournalContextType | undefined>(undefined);

export const MealJournalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [meals, setMeals] = useState<MealEntry[]>([]);
  const { user, isAuthenticated } = useAuth();

  const [filterDate, setFilterDate] = useState<Date | null>(null);
  const [filterMealType, setFilterMealType] = useState<MealType | null>(null);
  const [filterNutritionScore, setFilterNutritionScore] = useState<NutritionScore | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterPeriod, setFilterPeriod] = useState<FilterPeriod>(null);
  const [customDateRange, setCustomDateRange] = useState<{ start: Date | null; end: Date | null }>({
    start: null,
    end: null
  });

  useEffect(() => {
    const loadMeals = async () => {
      if (isAuthenticated && user) {
        try {
          const { data, error } = await supabase
            .from('meals')
            .select('*')
            .order('created_at', { ascending: false });
            
          if (error) {
            throw error;
          }
          
          if (data) {
            const transformedData: MealEntry[] = data.map(meal => ({
              id: meal.id,
              title: meal.title,
              description: meal.description,
              mealType: meal.meal_type as MealType,
              foodItems: meal.food_items,
              imageUrl: meal.image_url || '',
              nutrition: typeof meal.nutrition === 'string' 
                ? JSON.parse(meal.nutrition) 
                : meal.nutrition,
              nutritionScore: meal.nutrition_score as NutritionScore,
              notes: meal.notes || '',
              timestamp: meal.timestamp,
              createdAt: new Date(meal.created_at)
            }));
            
            setMeals(transformedData);
            console.log("Loaded meals from Supabase:", transformedData.length);
          }
        } catch (error) {
          console.error('Error fetching meals from Supabase:', error);
          loadFromLocalStorage();
        }
      } else {
        loadFromLocalStorage();
      }
    };
    
    const loadFromLocalStorage = () => {
      const savedMeals = localStorage.getItem('mealJournal');
      if (savedMeals) {
        try {
          const parsedMeals = JSON.parse(savedMeals);
          const formattedMeals = parsedMeals.map((meal: any) => ({
            ...meal,
            createdAt: new Date(meal.createdAt)
          }));
          setMeals(formattedMeals);
          console.log("Loaded meals from localStorage:", formattedMeals.length);
        } catch (error) {
          console.error('Failed to parse saved meals:', error);
          setMeals([]);
        }
      } else {
        setMeals([]);
      }
    };
    
    loadMeals();
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (meals.length > 0) {
      localStorage.setItem('mealJournal', JSON.stringify(meals));
    }
  }, [meals]);

  const addMeal = async (meal: Omit<MealEntry, 'id' | 'createdAt'>) => {
    const now = new Date();
    const newMeal: MealEntry = {
      ...meal,
      id: generateId(),
      createdAt: now,
      timestamp: now.toISOString(),
    };
    
    console.log("Adding new meal with image:", newMeal.imageUrl ? "Image present" : "No image");
    
    setMeals(prevMeals => [newMeal, ...prevMeals]);
    
    if (isAuthenticated && user) {
      try {
        // Convert nutrition object to JSON string for Supabase
        const nutritionJson = JSON.stringify(newMeal.nutrition);
        
        const { error } = await supabase.from('meals').insert({
          id: newMeal.id,
          title: newMeal.title,
          description: newMeal.description,
          meal_type: newMeal.mealType,
          food_items: newMeal.foodItems,
          image_url: newMeal.imageUrl,
          nutrition: nutritionJson,
          nutrition_score: newMeal.nutritionScore,
          notes: newMeal.notes,
          timestamp: newMeal.timestamp,
          created_at: newMeal.createdAt.toISOString(),
          user_id: user.id
        });
        
        if (error) {
          console.error('Error saving meal to Supabase:', error);
          toast.error('Failed to save meal to the server');
        }
      } catch (error) {
        console.error('Exception saving meal to Supabase:', error);
      }
    }
    
    toast.success('Meal added to your journal');
  };

  const updateMeal = async (id: string, updates: Partial<MealEntry>) => {
    setMeals(prevMeals => 
      prevMeals.map(meal => 
        meal.id === id ? { ...meal, ...updates } : meal
      )
    );
    
    if (isAuthenticated && user) {
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
          .eq('id', id);
        
        if (error) {
          console.error('Error updating meal in Supabase:', error);
          toast.error('Failed to update meal on the server');
        }
      } catch (error) {
        console.error('Exception updating meal in Supabase:', error);
      }
    }
    
    toast.success('Meal updated successfully');
  };

  const deleteMeal = async (id: string) => {
    setMeals(prevMeals => prevMeals.filter(meal => meal.id !== id));
    
    if (isAuthenticated && user) {
      try {
        const { error } = await supabase
          .from('meals')
          .delete()
          .eq('id', id);
        
        if (error) {
          console.error('Error deleting meal from Supabase:', error);
          toast.error('Failed to delete meal from the server');
        }
      } catch (error) {
        console.error('Exception deleting meal from Supabase:', error);
      }
    }
    
    toast.success('Meal removed from your journal');
  };

  const getMeal = (id: string) => {
    return meals.find(meal => meal.id === id);
  };

  const getFilteredMeals = (): MealEntry[] => {
    return meals.filter(meal => {
      const mealDate = meal.createdAt instanceof Date ? meal.createdAt : new Date(meal.createdAt);
      
      if (filterPeriod === 'day') {
        const today = new Date();
        if (!isSameDay(mealDate, today)) {
          return false;
        }
      } else if (filterPeriod === 'week') {
        const today = new Date();
        const weekStart = startOfWeek(today, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
        
        if (!isWithinInterval(mealDate, { 
          start: startOfDay(weekStart), 
          end: endOfDay(weekEnd) 
        })) {
          return false;
        }
      } else if (filterPeriod === 'custom' && customDateRange.start && customDateRange.end) {
        const start = startOfDay(customDateRange.start);
        const end = endOfDay(customDateRange.end);
        
        if (!isWithinInterval(mealDate, { start, end })) {
          return false;
        }
      } else if (filterDate && filterPeriod === null) {
        if (!isSameDay(mealDate, filterDate)) {
          return false;
        }
      }

      if (filterMealType && meal.mealType !== filterMealType) {
        return false;
      }

      if (filterNutritionScore && meal.nutritionScore !== filterNutritionScore) {
        return false;
      }

      if (searchTerm) {
        const termLower = searchTerm.toLowerCase();
        const inTitle = meal.title.toLowerCase().includes(termLower);
        const inDescription = meal.description.toLowerCase().includes(termLower);
        const inFoodItems = meal.foodItems.some(item => 
          item.toLowerCase().includes(termLower)
        );
        const inNotes = meal.notes ? 
          meal.notes.toLowerCase().includes(termLower) : false;

        if (!(inTitle || inDescription || inFoodItems || inNotes)) {
          return false;
        }
      }

      return true;
    });
  };

  const filteredMeals = getFilteredMeals();
  
  const totalCalories = filteredMeals.reduce((total, meal) => {
    return total + (typeof meal.nutrition.calories === 'number' ? meal.nutrition.calories : 0);
  }, 0);

  const clearFilters = () => {
    setFilterDate(null);
    setFilterMealType(null);
    setFilterNutritionScore(null);
    setSearchTerm('');
    setFilterPeriod(null);
    setCustomDateRange({ start: null, end: null });
  };

  return (
    <MealJournalContext.Provider
      value={{
        meals,
        addMeal,
        updateMeal,
        deleteMeal,
        getMeal,
        filteredMeals,
        setFilterDate,
        setFilterMealType,
        setFilterNutritionScore,
        searchTerm,
        setSearchTerm,
        clearFilters,
        filterDate,
        filterMealType,
        filterNutritionScore,
        filterPeriod,
        setFilterPeriod,
        customDateRange,
        setCustomDateRange,
        totalCalories,
      }}
    >
      {children}
    </MealJournalContext.Provider>
  );
};

export const useMealJournal = () => {
  const context = useContext(MealJournalContext);
  if (context === undefined) {
    throw new Error('useMealJournal must be used within a MealJournalProvider');
  }
  return context;
};
