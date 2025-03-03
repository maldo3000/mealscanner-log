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
  parseISO
} from 'date-fns';

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
    localStorage.setItem('mealJournal', JSON.stringify(meals));
  }, [meals]);

  const addMeal = (meal: Omit<MealEntry, 'id' | 'createdAt'>) => {
    const newMeal: MealEntry = {
      ...meal,
      id: generateId(),
      createdAt: new Date(),
    };
    
    console.log("Adding new meal with image:", newMeal.imageUrl ? "Image present" : "No image");
    
    setMeals(prevMeals => [newMeal, ...prevMeals]);
    toast.success('Meal added to your journal');
  };

  const updateMeal = (id: string, updates: Partial<MealEntry>) => {
    setMeals(prevMeals => 
      prevMeals.map(meal => 
        meal.id === id ? { ...meal, ...updates } : meal
      )
    );
    toast.success('Meal updated successfully');
  };

  const deleteMeal = (id: string) => {
    setMeals(prevMeals => prevMeals.filter(meal => meal.id !== id));
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
