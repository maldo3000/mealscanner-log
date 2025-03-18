
import React, { createContext, useContext, useState, useEffect } from 'react';
import { MealEntry, MealType, NutritionScore } from '@/types';
import { toast } from 'sonner';
import { useAuth } from '../AuthContext';
import { MealJournalContextType, FilterPeriod } from './types';
import { getFilteredMeals, calculateTotalCalories } from './mealFilterUtils';
import { 
  loadMealsFromSupabase, 
  loadMealsFromLocalStorage, 
  saveMealToSupabase, 
  updateMealInSupabase, 
  deleteMealFromSupabase,
  createNewMeal
} from './mealService';

const MealJournalContext = createContext<MealJournalContextType | undefined>(undefined);

export const MealJournalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [meals, setMeals] = useState<MealEntry[]>([]);
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

  // Load meals when auth state changes
  useEffect(() => {
    const loadMeals = async () => {
      try {
        if (isAuthenticated && user) {
          console.log('Loading meals for authenticated user:', user.id);
          const supabaseMeals = await loadMealsFromSupabase(user.id);
          setMeals(supabaseMeals);
        } else {
          console.log('User not authenticated, loading from localStorage');
          const localMeals = loadMealsFromLocalStorage();
          setMeals(localMeals);
        }
        setIsInitialized(true);
      } catch (error) {
        console.error('Error loading meals:', error);
        toast.error('Failed to load your meal data');
        // Fallback to localStorage if Supabase fails
        if (isAuthenticated) {
          const localMeals = loadMealsFromLocalStorage();
          setMeals(localMeals);
        }
        setIsInitialized(true);
      }
    };
    
    loadMeals();
  }, [isAuthenticated, user]);

  // Save non-authenticated user meals to localStorage
  useEffect(() => {
    if (!isAuthenticated && meals.length > 0 && isInitialized) {
      console.log('Saving meals to localStorage');
      localStorage.setItem('mealJournal', JSON.stringify(meals));
    }
  }, [meals, isAuthenticated, isInitialized]);

  const addMeal = async (meal: Omit<MealEntry, 'id' | 'createdAt'>) => {
    const newMeal = createNewMeal(meal);
    
    console.log("Adding new meal with image:", newMeal.imageUrl ? "Image present" : "No image");
    
    // Update local state immediately for responsiveness
    setMeals(prevMeals => [newMeal, ...prevMeals]);
    
    // Then persist to Supabase if authenticated
    if (isAuthenticated && user) {
      try {
        await saveMealToSupabase(newMeal, user.id);
        console.log('Meal saved to Supabase');
      } catch (error) {
        console.error('Failed to save meal to Supabase:', error);
        // The meal is already in local state, so the user won't lose it
      }
    }
    
    toast.success('Meal added to your journal');
  };

  const updateMeal = async (id: string, updates: Partial<MealEntry>) => {
    // Update local state immediately
    setMeals(prevMeals => 
      prevMeals.map(meal => 
        meal.id === id ? { ...meal, ...updates } : meal
      )
    );
    
    // Then update in Supabase if authenticated
    if (isAuthenticated && user) {
      try {
        await updateMealInSupabase(id, updates, user.id);
        console.log('Meal updated in Supabase');
      } catch (error) {
        console.error('Failed to update meal in Supabase:', error);
        // The meal update is already in local state
      }
    }
    
    toast.success('Meal updated successfully');
  };

  const deleteMeal = async (id: string) => {
    // Remove from local state immediately
    setMeals(prevMeals => prevMeals.filter(meal => meal.id !== id));
    
    // Then delete from Supabase if authenticated
    if (isAuthenticated && user) {
      try {
        await deleteMealFromSupabase(id, user.id);
        console.log('Meal deleted from Supabase');
      } catch (error) {
        console.error('Failed to delete meal from Supabase:', error);
        // The meal is already removed from local state
      }
    }
    
    toast.success('Meal removed from your journal');
  };

  const getMeal = (id: string) => {
    return meals.find(meal => meal.id === id);
  };

  const filteredMeals = getFilteredMeals(
    meals,
    filterDate,
    filterMealType,
    filterNutritionScore,
    searchTerm,
    filterPeriod,
    customDateRange
  );
  
  const totalCalories = calculateTotalCalories(filteredMeals);

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
