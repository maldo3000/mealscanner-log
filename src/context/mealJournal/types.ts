
import { MealEntry, MealType, NutritionScore } from '@/types';

export type FilterPeriod = 'day' | 'week' | 'custom' | null;

export interface MealJournalContextType {
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
  isLoading: boolean;
}
