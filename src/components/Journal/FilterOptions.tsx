
import React from 'react';
import { Calendar, X } from 'lucide-react';
import { FilterPeriod } from '@/context/MealJournalContext';
import { MealType, NutritionScore } from '@/types';
import { getMealTypeOptions } from '@/utils/helpers';

interface FilterOptionsProps {
  filterPeriod: FilterPeriod;
  handlePeriodChange: (period: FilterPeriod) => void;
  filterDate: Date | null;
  handleDateChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setFilterDate: (date: Date | null) => void;
  customDateRange: { start: Date | null; end: Date | null };
  handleCustomStartDateChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleCustomEndDateChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  filterMealType: MealType | null;
  setFilterMealType: (type: MealType | null) => void;
  filterNutritionScore: NutritionScore | null;
  setFilterNutritionScore: (score: NutritionScore | null) => void;
}

export const FilterOptions: React.FC<FilterOptionsProps> = ({
  filterPeriod,
  handlePeriodChange,
  filterDate,
  handleDateChange,
  setFilterDate,
  customDateRange,
  handleCustomStartDateChange,
  handleCustomEndDateChange,
  filterMealType,
  setFilterMealType,
  filterNutritionScore,
  setFilterNutritionScore
}) => {
  const mealTypeOptions = getMealTypeOptions();
  
  const nutritionScoreOptions = [
    { value: "very healthy", label: "Very Healthy" },
    { value: "healthy", label: "Healthy" },
    { value: "moderate", label: "Moderate" },
    { value: "unhealthy", label: "Unhealthy" },
    { value: "not healthy", label: "Not Healthy" },
  ];
  
  return (
    <div className="glass-card rounded-2xl p-4 space-y-4 animate-slide-down">
      {/* Time period filters */}
      <div>
        <label className="block text-sm font-medium mb-2">Time Period</label>
        <div className="flex flex-wrap gap-2 mb-3">
          <button
            onClick={() => handlePeriodChange('day')}
            className={`px-3 py-1 text-sm rounded-full border ${
              filterPeriod === 'day' ? 'bg-primary text-primary-foreground border-primary' : 'border-border'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => handlePeriodChange('week')}
            className={`px-3 py-1 text-sm rounded-full border ${
              filterPeriod === 'week' ? 'bg-primary text-primary-foreground border-primary' : 'border-border'
            }`}
          >
            This Week
          </button>
          <button
            onClick={() => handlePeriodChange('custom')}
            className={`px-3 py-1 text-sm rounded-full border ${
              filterPeriod === 'custom' ? 'bg-primary text-primary-foreground border-primary' : 'border-border'
            }`}
          >
            Custom Range
          </button>
        </div>
        
        {/* Specific date picker */}
        {filterPeriod !== 'custom' && (
          <div>
            <label htmlFor="date-filter" className="block text-sm font-medium mb-1">
              Specific Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <input
                id="date-filter"
                type="date"
                value={filterDate ? filterDate.toISOString().split('T')[0] : ''}
                onChange={handleDateChange}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background"
              />
              {filterDate && (
                <button
                  onClick={() => setFilterDate(null)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        )}
        
        {/* Custom date range */}
        {filterPeriod === 'custom' && (
          <div className="space-y-3">
            <div>
              <label htmlFor="start-date" className="block text-sm font-medium mb-1">
                Start Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <input
                  id="start-date"
                  type="date"
                  value={customDateRange.start ? customDateRange.start.toISOString().split('T')[0] : ''}
                  onChange={handleCustomStartDateChange}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="end-date" className="block text-sm font-medium mb-1">
                End Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <input
                  id="end-date"
                  type="date"
                  value={customDateRange.end ? customDateRange.end.toISOString().split('T')[0] : ''}
                  onChange={handleCustomEndDateChange}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background"
                />
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="meal-type-filter" className="block text-sm font-medium mb-1">
            Meal Type
          </label>
          <select
            id="meal-type-filter"
            value={filterMealType || ""}
            onChange={(e) => setFilterMealType(e.target.value as MealType || null)}
            className="w-full px-4 py-2 rounded-lg border border-border bg-background"
          >
            <option value="">All meal types</option>
            {mealTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label htmlFor="nutrition-score-filter" className="block text-sm font-medium mb-1">
            Nutrition Score
          </label>
          <select
            id="nutrition-score-filter"
            value={filterNutritionScore || ""}
            onChange={(e) => setFilterNutritionScore(e.target.value as NutritionScore || null)}
            className="w-full px-4 py-2 rounded-lg border border-border bg-background"
          >
            <option value="">All scores</option>
            {nutritionScoreOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
