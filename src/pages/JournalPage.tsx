
import React, { useState } from "react";
import { useMealJournal, FilterPeriod } from "@/context/MealJournalContext";
import { MealType, NutritionScore } from "@/types";
import { JournalHeader } from "@/components/Journal/JournalHeader";
import { FilterBar } from "@/components/Journal/FilterBar";
import { FilterOptions } from "@/components/Journal/FilterOptions";
import { StatsCard } from "@/components/Journal/StatsCard";
import { MealsList } from "@/components/Journal/MealsList";
import { toast } from "sonner";
import { Download } from "lucide-react";
import { convertMealsToCSV, downloadCSV } from "@/utils/exportUtils";

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
    isLoading,
    meals,
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
  
  const handleExportCsv = () => {
    try {
      // Determine which meals to export (filtered or all)
      const mealsToExport = filteredMeals.length > 0 ? filteredMeals : meals;
      
      if (mealsToExport.length === 0) {
        toast.error("No meals to export");
        return;
      }
      
      // Convert meals to CSV format
      const csvContent = convertMealsToCSV(mealsToExport);
      
      // Generate filename with current date
      const dateStr = new Date().toISOString().split('T')[0];
      const filename = `meals-export-${dateStr}.csv`;
      
      // Trigger download
      downloadCSV(csvContent, filename);
      
      // Show success message
      toast.success(
        areFiltersActive 
          ? `Exported ${filteredMeals.length} filtered meals to CSV` 
          : `Exported all ${meals.length} meals to CSV`
      );
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export meals");
    }
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <JournalHeader />
        
        {/* Export button */}
        <button
          onClick={handleExportCsv}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
          title="Export to CSV"
          disabled={isLoading || (meals.length === 0)}
        >
          <Download className="h-4 w-4" />
          <span className="hidden sm:inline">Export CSV</span>
        </button>
      </div>
      
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
        {filteredMeals.length > 0 && !isLoading && (
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
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default JournalPage;
