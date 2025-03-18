
import React from 'react';
import { Filter, ChevronDown } from 'lucide-react';
import { FilterPeriod } from '@/context/MealJournalContext';
import { QuickFilters } from './QuickFilters';
import { SearchBar } from './SearchBar';

interface FilterBarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  showFilters: boolean;
  toggleFilters: () => void;
  areFiltersActive: boolean;
  clearFilters: () => void;
  filterPeriod: FilterPeriod;
  onQuickFilter: (period: FilterPeriod) => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchTerm,
  setSearchTerm,
  showFilters,
  toggleFilters,
  areFiltersActive,
  clearFilters,
  filterPeriod,
  onQuickFilter
}) => {
  return (
    <div className="flex flex-col space-y-3">
      <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      
      <div className="flex justify-between">
        <div className="flex items-center space-x-2">
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
          
          {/* Quick filter buttons */}
          <QuickFilters 
            filterPeriod={filterPeriod} 
            onQuickFilter={onQuickFilter} 
          />
        </div>
        
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
  );
};
