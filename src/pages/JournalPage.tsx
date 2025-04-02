import React, { useState, useEffect } from "react";
import { JournalHeader, MealsList, FilterBar, EmptyJournal } from "@/components/Journal";
import { useMealJournal } from "@/context/mealJournal";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import BackgroundGradient from "@/components/ui/background-gradient";
import { useSearchParams } from "react-router-dom";
import { MealType } from "@/types";
import { format } from 'date-fns';
import { useExportData } from "@/hooks/use-export-data";

// Journal page contains the meal journal entries and filtering options
const JournalPage: React.FC = () => {
  const { meals, isLoading } = useMealJournal();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // State for search term, date, meal type, and nutrition score
  const [searchTerm, setSearchTerm] = useState<string>(searchParams.get("search") || "");
  const [filterDate, setFilterDate] = useState<Date | null>(null);
  const [filterMealType, setFilterMealType] = useState<MealType | null>(null);
  const [filterNutritionScore, setFilterNutritionScore] = useState<number | null>(null);
  const [filterPeriod, setFilterPeriod] = useState<string | null>(null);
  const [customDateRange, setCustomDateRange] = useState<{ start: Date | null; end: Date | null }>({
    start: null,
    end: null,
  });
  
  // State for exporting data
  const { isExporting, handleExportData } = useExportData(meals);
  
  // Filtered meals state
  const [filteredMeals, setFilteredMeals] = useState(meals);
  
  // Update filtered meals whenever meals data changes
  useEffect(() => {
    setFilteredMeals(meals);
  }, [meals]);
  
  // Function to apply filters
  useEffect(() => {
    let results = [...meals];
    
    // Apply search term filter
    if (searchTerm) {
      results = results.filter(meal =>
        meal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        meal.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        meal.foodItems.some(item => item.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Apply date filter
    if (filterDate) {
      results = results.filter(meal => {
        const mealDate = new Date(meal.timestamp).toLocaleDateString();
        const selectedDate = filterDate.toLocaleDateString();
        return mealDate === selectedDate;
      });
    }
    
    // Apply meal type filter
    if (filterMealType) {
      results = results.filter(meal => meal.mealType === filterMealType);
    }
    
    // Apply nutrition score filter
    if (filterNutritionScore) {
      results = results.filter(meal => meal.nutritionScore === filterNutritionScore);
    }
    
    // Apply period filter
    if (filterPeriod) {
      const today = new Date();
      let startDate: Date | null = null;
      
      if (filterPeriod === 'last7Days') {
        startDate = new Date(today.setDate(today.getDate() - 7));
      } else if (filterPeriod === 'last30Days') {
        startDate = new Date(today.setDate(today.getDate() - 30));
      } else if (filterPeriod === 'thisMonth') {
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      }
      
      if (startDate) {
        results = results.filter(meal => {
          const mealDate = new Date(meal.timestamp);
          return mealDate >= startDate;
        });
      }
    }
    
    // Apply custom date range filter
    if (customDateRange.start && customDateRange.end) {
      results = results.filter(meal => {
        const mealDate = new Date(meal.timestamp);
        return mealDate >= customDateRange.start! && mealDate <= customDateRange.end!;
      });
    }
    
    setFilteredMeals(results);
  }, [searchTerm, filterDate, filterMealType, filterNutritionScore, filterPeriod, customDateRange, meals]);
  
  // Function to clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setFilterDate(null);
    setFilterMealType(null);
    setFilterNutritionScore(null);
    setFilterPeriod(null);
    setCustomDateRange({ start: null, end: null });
    
    // Clear search params
    setSearchParams({});
  };

  // Check if any filters are applied
  const hasActiveFilters = () => {
    return !!(
      searchTerm || 
      filterDate || 
      filterMealType || 
      filterNutritionScore || 
      filterPeriod ||
      (customDateRange.start && customDateRange.end)
    );
  };
  
  return (
    <>
      <BackgroundGradient />
      <div className="space-y-6 animate-fade-in relative">
        <div className="flex justify-between items-center glass-card rounded-xl p-4 backdrop-blur-md bg-card/50 border-border/30 shadow-sm">
          <JournalHeader />
          
          <div className="flex gap-2">
            {hasActiveFilters() && (
              <button
                onClick={clearFilters}
                className="text-xs sm:text-sm px-2 py-1 rounded-md bg-secondary/80 text-secondary-foreground hover:bg-secondary/90 transition-colors"
              >
                Clear Filters
              </button>
            )}
            <button
              onClick={handleExportData}
              disabled={isExporting}
              className={cn(
                "text-xs sm:text-sm px-2 py-1 rounded-md bg-primary/80 text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-1",
                isExporting && "opacity-70 cursor-not-allowed"
              )}
            >
              {isExporting ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span>Exporting...</span>
                </>
              ) : (
                "Export Data"
              )}
            </button>
          </div>
        </div>
        
        <div className="glass-card rounded-xl p-4 backdrop-blur-md bg-card/50 border-border/30 shadow-sm">
          <FilterBar 
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            filterDate={filterDate}
            onDateChange={setFilterDate}
            filterMealType={filterMealType}
            onMealTypeChange={setFilterMealType}
            filterNutritionScore={filterNutritionScore}
            onNutritionScoreChange={setFilterNutritionScore}
            filterPeriod={filterPeriod}
            onPeriodChange={setFilterPeriod}
            customDateRange={customDateRange}
            onCustomDateRangeChange={setCustomDateRange}
          />
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredMeals.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <MealsList meals={filteredMeals} />
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="glass-card rounded-xl p-6 backdrop-blur-md bg-card/50 border-border/30 shadow-sm"
          >
            <EmptyJournal
              hasFilters={hasActiveFilters()}
              onClearFilters={clearFilters}
            />
          </motion.div>
        )}
      </div>
    </>
  );
};

export default JournalPage;
