
import React from 'react';
import MealCard from '@/components/MealCard';
import { MealEntry } from '@/types';
import { EmptyJournal } from './EmptyJournal';

interface MealsListProps {
  meals: MealEntry[];
  areFiltersActive: boolean;
}

export const MealsList: React.FC<MealsListProps> = ({ meals, areFiltersActive }) => {
  if (meals.length === 0) {
    return <EmptyJournal areFiltersActive={areFiltersActive} />;
  }
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
      {meals.map((meal) => (
        <MealCard key={meal.id} meal={meal} />
      ))}
    </div>
  );
};
