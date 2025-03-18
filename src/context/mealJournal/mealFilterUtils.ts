
import { MealEntry } from '@/types';
import { 
  startOfDay, 
  endOfDay, 
  startOfWeek, 
  endOfWeek, 
  isWithinInterval, 
  isSameDay,
} from 'date-fns';
import { FilterPeriod } from './types';

export const getFilteredMeals = (
  meals: MealEntry[],
  filterDate: Date | null,
  filterMealType: string | null,
  filterNutritionScore: string | null,
  searchTerm: string,
  filterPeriod: FilterPeriod,
  customDateRange: { start: Date | null; end: Date | null }
): MealEntry[] => {
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

export const calculateTotalCalories = (meals: MealEntry[]): number => {
  return meals.reduce((total, meal) => {
    return total + (typeof meal.nutrition.calories === 'number' ? meal.nutrition.calories : 0);
  }, 0);
};
