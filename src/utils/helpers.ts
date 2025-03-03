
import { MealType, NutritionScore } from "@/types";

export const formatDate = (date: Date | string): string => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatTime = (date: Date | string): string => {
  const d = new Date(date);
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

export const getMealTypeOptions = (): { value: MealType; label: string }[] => {
  return [
    { value: 'breakfast', label: 'Breakfast' },
    { value: 'lunch', label: 'Lunch' },
    { value: 'dinner', label: 'Dinner' },
    { value: 'snack', label: 'Snack' },
    { value: 'random', label: 'Random Meal' },
  ];
};

export const getNutritionScoreColor = (score: NutritionScore): string => {
  switch (score) {
    case 'very healthy':
      return 'text-green-500';
    case 'healthy':
      return 'text-green-400';
    case 'moderate':
      return 'text-yellow-500';
    case 'unhealthy':
      return 'text-orange-500';
    case 'not healthy':
      return 'text-red-500';
    default:
      return 'text-gray-500';
  }
};

export const getNutritionScoreBadgeColor = (score: NutritionScore): string => {
  switch (score) {
    case 'very healthy':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
    case 'healthy':
      return 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400';
    case 'moderate':
      return 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400';
    case 'unhealthy':
      return 'bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400';
    case 'not healthy':
      return 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
  }
};
