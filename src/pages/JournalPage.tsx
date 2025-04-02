
import React, { useState } from "react";
import { useMealJournal, FilterPeriod } from "@/context/mealJournal";
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
    if (date) {
      setFilterPeriod(null);
    }
  };

  const handlePeriodChange = (period: FilterPeriod) => {
    setFilterPeriod(period);
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
    setFilterDate(null);
    setCustomDateRange({ start: null, end: null });
    setFilterPeriod(period);
  };
  
  const handleExportCsv = () => {
    try {
      if (filteredMeals.length === 0) {
        toast.error("No meals to export in the selected time range");
        return;
      }
      
      const csvContent = convertMealsToCSV(filteredMeals);
      
      const dateStr = new Date().toISOString().split('T')[0];
      const filename = `meals-export-${dateStr}.csv`;
      
      downloadCSV(csvContent, filename);
      
      toast.success(`Exported ${filteredMeals.length} meals to CSV`);
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export meals");
    }
  };
  
  return (
    <div className="space-y-6 animate-fade-in relative">
      {/* Gradient overlays for background effect */}
      <div className="absolute inset-0 bg-gradient-radial from-primary/5 to-transparent opacity-70 -z-10"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 -z-10"></div>
      
      {/* Decorative circles */}
      <div className="absolute top-1/4 -left-24 w-64 h-64 rounded-full bg-primary/10 blur-3xl -z-10"></div>
      <div className="absolute bottom-1/4 -right-24 w-64 h-64 rounded-full bg-primary/10 blur-3xl -z-10"></div>
      
      <div className="flex justify-between items-center glass-card rounded-xl p-4 backdrop-blur-md bg-card/50 border-border/30 shadow-sm">
        <JournalHeader />
        
        <button
          onClick={handleExportCsv}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
          title="Export to CSV"
          disabled={isLoading || (filteredMeals.length === 0)}
        >
          <Download className="h-4 w-4" />
          <span className="hidden sm:inline">Export CSV</span>
        </button>
      </div>
      
      <div className="space-y-4">
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
        
        {showFilters && (
          <div className="glass-card rounded-xl p-4 backdrop-blur-md bg-card/50 border-border/30 shadow-sm">
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
          </div>
        )}
        
        {filteredMeals.length > 0 && !isLoading && (
          <StatsCard
            totalCalories={totalCalories}
            filterPeriod={filterPeriod}
            filterDate={filterDate}
            customDateRange={customDateRange}
          />
        )}
        
        <div className="glass-card rounded-xl p-4 backdrop-blur-md bg-card/50 border-border/30 shadow-sm">
          <MealsList
            meals={filteredMeals}
            areFiltersActive={areFiltersActive}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default JournalPage;
