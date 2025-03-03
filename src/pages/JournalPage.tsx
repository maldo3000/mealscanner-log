
import React, { useState } from "react";
import { useMealJournal, FilterPeriod } from "@/context/MealJournalContext";
import MealCard from "@/components/MealCard";
import { Search, X, Calendar, Filter, ChevronDown, Clock } from "lucide-react";
import { MealType, NutritionScore } from "@/types";
import { getMealTypeOptions } from "@/utils/helpers";
import { format } from "date-fns";

const JournalPage: React.FC = () => {
  const {
    filteredMeals,
    searchTerm,
    setSearchTerm,
    filterDate,
    setFilterDate,
    filterMealType,
    setFilterMealType,
    filterNutritionScore,
    setFilterNutritionScore,
    clearFilters,
    filterPeriod,
    setFilterPeriod,
    customDateRange,
    setCustomDateRange,
    totalCalories,
  } = useMealJournal();
  
  const [showFilters, setShowFilters] = useState(false);
  
  const mealTypeOptions = getMealTypeOptions();
  
  const nutritionScoreOptions = [
    { value: "very healthy", label: "Very Healthy" },
    { value: "healthy", label: "Healthy" },
    { value: "moderate", label: "Moderate" },
    { value: "unhealthy", label: "Unhealthy" },
    { value: "not healthy", label: "Not Healthy" },
  ];
  
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value ? new Date(e.target.value) : null;
    setFilterDate(date);
    // Clear period filter when selecting a specific date
    if (date) {
      setFilterPeriod(null);
    }
  };

  const handlePeriodChange = (period: FilterPeriod) => {
    setFilterPeriod(period);
    // Clear specific date when selecting a period
    if (period) {
      setFilterDate(null);
    }
  };

  const handleCustomStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value ? new Date(e.target.value) : null;
    setCustomDateRange({ ...customDateRange, start: date });
  };

  const handleCustomEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value ? new Date(e.target.value) : null;
    setCustomDateRange({ ...customDateRange, end: date });
  };
  
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };
  
  const areFiltersActive = !!(filterDate || filterMealType || filterNutritionScore || searchTerm || filterPeriod || (customDateRange.start && customDateRange.end));
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">Meal Journal</h1>
        <p className="text-muted-foreground">
          Browse and search your meal history
        </p>
      </div>
      
      <div className="space-y-4">
        {/* Search and filter bar */}
        <div className="flex flex-col space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <input
              type="text"
              placeholder="Search meals..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-full border border-border bg-background"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          
          <div className="flex justify-between">
            <button
              onClick={toggleFilters}
              className={`flex items-center space-x-1 text-sm ${
                areFiltersActive ? "text-primary font-medium" : "text-muted-foreground"
              }`}
            >
              <Filter className="h-4 w-4" />
              <span>Filters</span>
              <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
            </button>
            
            {areFiltersActive && (
              <button
                onClick={clearFilters}
                className="text-sm text-primary"
              >
                Clear all
              </button>
            )}
          </div>
        </div>
        
        {/* Filter options */}
        {showFilters && (
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
        )}
        
        {/* Total calories for filtered meals */}
        {filteredMeals.length > 0 && (
          <div className="glass-card rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">
                {filterPeriod === 'day' ? 'Today' : 
                 filterPeriod === 'week' ? 'This Week' : 
                 filterPeriod === 'custom' && customDateRange.start && customDateRange.end ? 
                  `${format(customDateRange.start, 'MMM d')} - ${format(customDateRange.end, 'MMM d')}` :
                 filterDate ? format(filterDate, 'MMMM d, yyyy') : 'All Meals'}
              </span>
            </div>
            <div className="bg-muted p-2 px-3 rounded-lg">
              <span className="text-sm font-semibold">{totalCalories.toLocaleString()} calories</span>
            </div>
          </div>
        )}
        
        {/* Meals grid */}
        {filteredMeals.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
            {filteredMeals.map((meal) => (
              <MealCard key={meal.id} meal={meal} />
            ))}
          </div>
        ) : (
          <div className="glass-card rounded-2xl py-12 px-4 text-center mt-8">
            <p className="text-muted-foreground mb-2">No meals found</p>
            <p className="text-sm text-muted-foreground">
              {areFiltersActive 
                ? "Try adjusting your filters or search term"
                : "Start capturing your meals to build your journal"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default JournalPage;
