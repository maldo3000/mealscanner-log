
import React, { useState } from "react";
import { useMealJournal, FilterPeriod } from "@/context/MealJournalContext";
import { MealType, NutritionScore } from "@/types";
import { JournalHeader } from "@/components/Journal/JournalHeader";
import { FilterBar } from "@/components/Journal/FilterBar";
import { FilterOptions } from "@/components/Journal/FilterOptions";
import { StatsCard } from "@/components/Journal/StatsCard";
import { MealsList } from "@/components/Journal/MealsList";

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
  
  const handleQuickFilter = (period: FilterPeriod) => {
    // Clear other filters when using quick filters
    setFilterDate(null);
    setCustomDateRange({ start: null, end: null });
    setFilterPeriod(period);
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      <JournalHeader />
      
      <div className="space-y-4">
        {/* Search and filter bar */}
        <FilterBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          showFilters={showFilters}
          toggleFilters={toggleFilters}
          areFiltersActive={areFiltersActive}
          clearFilters={clearFilters}
          filterPeriod={filterPeriod}
          onQuickFilter={handleQuickFilter}
        />
        
        {/* Filter options */}
        {showFilters && (
          <FilterOptions
            filterPeriod={filterPeriod}
            handlePeriodChange={handlePeriodChange}
            filterDate={filterDate}
            handleDateChange={handleDateChange}
            setFilterDate={setFilterDate}
            customDateRange={customDateRange}
            handleCustomStartDateChange={handleCustomStartDateChange}
            handleCustomEndDateChange={handleCustomEndDateChange}
            filterMealType={filterMealType}
            setFilterMealType={setFilterMealType}
            filterNutritionScore={filterNutritionScore}
            setFilterNutritionScore={setFilterNutritionScore}
          />
        )}
        
        {/* Total calories for filtered meals */}
        {filteredMeals.length > 0 && (
          <StatsCard
            totalCalories={totalCalories}
            filterPeriod={filterPeriod}
            filterDate={filterDate}
            customDateRange={customDateRange}
          />
        )}
        
        {/* Meals grid */}
        <MealsList
          meals={filteredMeals}
          areFiltersActive={areFiltersActive}
        />
      </div>
    </div>
  );
};

export default JournalPage;
