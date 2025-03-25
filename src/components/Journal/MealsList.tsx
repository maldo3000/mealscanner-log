
import React from 'react';
import MealCard from '@/components/MealCard';
import { MealEntry } from '@/types';
import { EmptyJournal } from './EmptyJournal';
import LoadingSpinner from '@/components/LoadingSpinner';

interface MealsListProps {
  meals: MealEntry[];
  areFiltersActive: boolean;
  isLoading?: boolean;
}

export const MealsList: React.FC<MealsListProps> = ({ 
  meals, 
  areFiltersActive, 
  isLoading = false 
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-10 sm:py-12">
        <LoadingSpinner size="large" />
      </div>
    );
  }
  
  if (meals.length === 0) {
    return <EmptyJournal areFiltersActive={areFiltersActive} />;
  }
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mt-3 sm:mt-4">
      {meals.map((meal) => (
        <MealCard key={meal.id} meal={meal} />
      ))}
    </div>
  );
};
