
import React from 'react';
import { FilterPeriod } from '@/context/MealJournalContext';

interface QuickFiltersProps {
  filterPeriod: FilterPeriod;
  onQuickFilter: (period: FilterPeriod) => void;
}

export const QuickFilters: React.FC<QuickFiltersProps> = ({ 
  filterPeriod, 
  onQuickFilter 
}) => {
  return (
    <div className="flex items-center space-x-2 ml-4">
      <button
        onClick={() => onQuickFilter('day')}
        className={`px-3 py-1 text-xs rounded-full border ${
          filterPeriod === 'day' ? 'bg-primary text-primary-foreground border-primary' : 'border-border'
        }`}
      >
        Today
      </button>
      <button
        onClick={() => onQuickFilter('week')}
        className={`px-3 py-1 text-xs rounded-full border ${
          filterPeriod === 'week' ? 'bg-primary text-primary-foreground border-primary' : 'border-border'
        }`}
      >
        This Week
      </button>
    </div>
  );
};
