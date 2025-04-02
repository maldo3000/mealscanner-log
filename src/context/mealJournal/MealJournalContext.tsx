
import React, { createContext, useContext, useState, useEffect } from 'react';
import { MealJournalContextType, FilterPeriod } from './types';
import * as mealService from './mealService';
import * as mealFilterUtils from './mealFilterUtils';
import { useAuth } from '@/context/auth';
import { toast } from 'sonner';
import { MealEntry, MealType, NutritionScore } from '@/types';

const MealJournalContext = createContext<MealJournalContextType | undefined>(undefined);

// Maximum number of meals to store in localStorage
const MAX_LOCAL_MEALS = 30;

export const MealJournalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [meals, setMeals] = useState<MealEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
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
      setIsLoading(true);
      try {
        if (isAuthenticated && user) {
          console.log('Loading meals for authenticated user:', user.id);
          const supabaseMeals = await mealService.loadMealsFromSupabase(user.id);
          setMeals(supabaseMeals);
        } else {
          console.log('User not authenticated, loading from localStorage');
          const localMeals = mealService.loadMealsFromLocalStorage();
          setMeals(localMeals);
        }
      } catch (error) {
        console.error('Error loading meals:', error);
        toast.error('Failed to load your meal data');
        if (isAuthenticated) {
          const localMeals = mealService.loadMealsFromLocalStorage();
          setMeals(localMeals);
        }
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
      }
    };
    
    loadMeals();
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (!isAuthenticated && meals.length > 0 && isInitialized) {
      console.log('Saving meals to localStorage');
      
      try {
        // Limit the number of meals saved to localStorage to prevent quota errors
        const mealsToSave = meals.slice(0, MAX_LOCAL_MEALS);
        
        // Remove large image data from meals before saving
        const trimmedMeals = mealsToSave.map(meal => {
          if (meal.imageUrl && meal.imageUrl.length > 1000) {
            // If image is a data URL, store a placeholder instead
            if (meal.imageUrl.startsWith('data:')) {
              return { ...meal, imageUrl: 'placeholder' };
            }
          }
          return meal;
        });
        
        localStorage.setItem('mealJournal', JSON.stringify(trimmedMeals));
      } catch (error) {
        console.error('Error saving to localStorage:', error);
        if (error instanceof DOMException && error.name === 'QuotaExceededError') {
          toast.error("Storage limit reached. Some meal data couldn't be saved locally.");
          
          // Try saving with even fewer meals if quota is still exceeded
          try {
            const fewerMeals = meals.slice(0, 10).map(meal => ({
              ...meal,
              imageUrl: 'placeholder',
              description: meal.description.slice(0, 100) // Truncate descriptions
            }));
            localStorage.setItem('mealJournal', JSON.stringify(fewerMeals));
          } catch (innerError) {
            console.error('Still unable to save to localStorage:', innerError);
          }
        }
      }
    }
  }, [meals, isAuthenticated, isInitialized]);

  const addMeal = async (meal: Omit<MealEntry, 'id' | 'createdAt'>) => {
    const newMeal = mealService.createNewMeal(meal);
    
    console.log("Adding new meal:", newMeal.title);
    
    setMeals(prevMeals => [newMeal, ...prevMeals]);
    
    if (isAuthenticated && user) {
      try {
        await mealService.saveMealToSupabase(newMeal, user.id);
        console.log('Meal saved to Supabase');
      } catch (error) {
        console.error('Failed to save meal to Supabase:', error);
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
        await mealService.updateMealInSupabase(id, updates, user.id);
        console.log('Meal updated in Supabase');
      } catch (error) {
        console.error('Failed to update meal in Supabase:', error);
      }
    }
    
    toast.success('Meal updated successfully');
  };

  const deleteMeal = async (id: string) => {
    setMeals(prevMeals => prevMeals.filter(meal => meal.id !== id));
    
    if (isAuthenticated && user) {
      try {
        await mealService.deleteMealFromSupabase(id, user.id);
        console.log('Meal deleted from Supabase');
      } catch (error) {
        console.error('Failed to delete meal from Supabase:', error);
      }
    }
    
    toast.success('Meal removed from your journal');
  };

  const getMeal = (id: string) => {
    return meals.find(meal => meal.id === id);
  };

  const filteredMeals = mealFilterUtils.getFilteredMeals(
    meals,
    filterDate,
    filterMealType,
    filterNutritionScore,
    searchTerm,
    filterPeriod,
    customDateRange
  );
  
  const totalCalories = mealFilterUtils.calculateTotalCalories(filteredMeals);

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
        isLoading,
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
