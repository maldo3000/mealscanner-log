
import React, { createContext, useContext, useState, useEffect } from 'react';
import { MealEntry, MealType, NutritionScore } from '@/types';
import { generateId } from '@/utils/helpers';
import { toast } from 'sonner';

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
}

const MealJournalContext = createContext<MealJournalContextType | undefined>(undefined);

export const MealJournalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State for meal entries
  const [meals, setMeals] = useState<MealEntry[]>(() => {
    const savedMeals = localStorage.getItem('mealJournal');
    if (savedMeals) {
      try {
        const parsedMeals = JSON.parse(savedMeals);
        return parsedMeals.map((meal: any) => ({
          ...meal,
          createdAt: new Date(meal.createdAt)
        }));
      } catch (error) {
        console.error('Failed to parse saved meals:', error);
        return [];
      }
    }
    return [];
  });

  // State for filters
  const [filterDate, setFilterDate] = useState<Date | null>(null);
  const [filterMealType, setFilterMealType] = useState<MealType | null>(null);
  const [filterNutritionScore, setFilterNutritionScore] = useState<NutritionScore | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Save meals to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('mealJournal', JSON.stringify(meals));
  }, [meals]);

  // Function to add a new meal
  const addMeal = (meal: Omit<MealEntry, 'id' | 'createdAt'>) => {
    const newMeal: MealEntry = {
      ...meal,
      id: generateId(),
      createdAt: new Date(),
    };
    
    setMeals(prevMeals => [newMeal, ...prevMeals]);
    toast.success('Meal added to your journal');
  };

  // Function to update an existing meal
  const updateMeal = (id: string, updates: Partial<MealEntry>) => {
    setMeals(prevMeals => 
      prevMeals.map(meal => 
        meal.id === id ? { ...meal, ...updates } : meal
      )
    );
    toast.success('Meal updated successfully');
  };

  // Function to delete a meal
  const deleteMeal = (id: string) => {
    setMeals(prevMeals => prevMeals.filter(meal => meal.id !== id));
    toast.success('Meal removed from your journal');
  };

  // Function to get a specific meal by ID
  const getMeal = (id: string) => {
    return meals.find(meal => meal.id === id);
  };

  // Function to apply filters and search
  const getFilteredMeals = (): MealEntry[] => {
    return meals.filter(meal => {
      // Filter by date (if set)
      if (filterDate) {
        const mealDate = new Date(meal.createdAt);
        if (
          mealDate.getDate() !== filterDate.getDate() ||
          mealDate.getMonth() !== filterDate.getMonth() ||
          mealDate.getFullYear() !== filterDate.getFullYear()
        ) {
          return false;
        }
      }

      // Filter by meal type (if set)
      if (filterMealType && meal.mealType !== filterMealType) {
        return false;
      }

      // Filter by nutrition score (if set)
      if (filterNutritionScore && meal.nutritionScore !== filterNutritionScore) {
        return false;
      }

      // Filter by search term (if set)
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

  // Filtered meals based on current filters
  const filteredMeals = getFilteredMeals();

  // Function to clear all filters
  const clearFilters = () => {
    setFilterDate(null);
    setFilterMealType(null);
    setFilterNutritionScore(null);
    setSearchTerm('');
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
