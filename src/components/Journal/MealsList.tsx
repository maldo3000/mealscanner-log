
import React from 'react';
import MealCard from '@/components/MealCard';
import { MealEntry } from '@/types';

interface MealsListProps {
  meals: MealEntry[];
  areFiltersActive: boolean;
}

export const MealsList: React.FC<MealsListProps> = ({ meals, areFiltersActive }) => {
  if (meals.length === 0) {
    return (
      <div className="glass-card rounded-2xl py-12 px-4 text-center mt-8">
        <p className="text-muted-foreground mb-2">No meals found</p>
        <p className="text-sm text-muted-foreground">
          {areFiltersActive 
            ? "Try adjusting your filters or search term"
            : "Start capturing your meals to build your journal"}
        </p>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
      {meals.map((meal) => (
        <MealCard key={meal.id} meal={meal} />
      ))}
    </div>
  );
};
