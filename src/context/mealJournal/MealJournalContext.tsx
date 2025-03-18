
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
          const supabaseMeals = await loadMealsFromSupabase(user.id);
          setMeals(supabaseMeals);
        } catch (error) {
          console.error('Error fetching meals from Supabase:', error);
          const localMeals = loadMealsFromLocalStorage();
          setMeals(localMeals);
        }
      } else {
        const localMeals = loadMealsFromLocalStorage();
        setMeals(localMeals);
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
    const newMeal = createNewMeal(meal);
    
    console.log("Adding new meal with image:", newMeal.imageUrl ? "Image present" : "No image");
    
    setMeals(prevMeals => [newMeal, ...prevMeals]);
    
    if (isAuthenticated && user) {
      await saveMealToSupabase(newMeal, user.id);
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
      await updateMealInSupabase(id, updates);
    }
    
    toast.success('Meal updated successfully');
  };

  const deleteMeal = async (id: string) => {
    setMeals(prevMeals => prevMeals.filter(meal => meal.id !== id));
    
    if (isAuthenticated && user) {
      await deleteMealFromSupabase(id);
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
