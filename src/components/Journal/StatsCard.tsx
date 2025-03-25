
import React from 'react';
import { Clock } from 'lucide-react';
import { format } from 'date-fns';
import { FilterPeriod } from '@/context/mealJournal';

interface StatsCardProps {
  totalCalories: number;
  filterPeriod: FilterPeriod;
  filterDate: Date | null;
  customDateRange: { start: Date | null; end: Date | null };
}

export const StatsCard: React.FC<StatsCardProps> = ({
  totalCalories,
  filterPeriod,
  filterDate,
  customDateRange
}) => {
  let timeLabel = 'All Meals';
  
  if (filterPeriod === 'day') {
    timeLabel = 'Today';
  } else if (filterPeriod === 'week') {
    timeLabel = 'This Week';
  } else if (filterPeriod === 'custom' && customDateRange.start && customDateRange.end) {
    timeLabel = `${format(customDateRange.start, 'MMM d')} - ${format(customDateRange.end, 'MMM d')}`;
  } else if (filterDate) {
    timeLabel = format(filterDate, 'MMMM d, yyyy');
  }
  
  return (
    <div className="glass-card rounded-2xl p-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Clock className="h-5 w-5 text-primary" />
        <span className="text-sm font-medium">{timeLabel}</span>
      </div>
      <div className="bg-muted p-2 px-3 rounded-lg">
        <span className="text-sm font-semibold">{totalCalories.toLocaleString()} calories</span>
      </div>
    </div>
  );
};
