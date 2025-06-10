
import React from "react";
import { NutritionInfo, NutritionScore, FiberScore } from "@/types";

interface MealNutritionInfoProps {
  nutrition: NutritionInfo;
  nutritionScore: NutritionScore;
  fiberScore: FiberScore;
  fiberNote: string;
  healthReason?: string;
}

const getFiberScoreBadgeColor = (score: FiberScore): string => {
  switch (score) {
    case 'excellent':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'good':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'moderate':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'low':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'very low':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const MealNutritionInfo: React.FC<MealNutritionInfoProps> = ({ 
  nutrition, 
  nutritionScore,
  fiberScore,
  fiberNote,
  healthReason 
}) => {
  return (
    <div className="glass-card rounded-2xl p-6">
      <h3 className="text-lg font-medium mb-2">Nutrition Information</h3>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <div className="bg-secondary/50 rounded-lg p-3 text-center">
          <span className="block text-sm text-muted-foreground">Calories</span>
          <span className="text-xl font-medium">{nutrition.calories}</span>
        </div>
        <div className="bg-secondary/50 rounded-lg p-3 text-center">
          <span className="block text-sm text-muted-foreground">Protein</span>
          <span className="text-xl font-medium">{nutrition.protein}g</span>
        </div>
        <div className="bg-secondary/50 rounded-lg p-3 text-center">
          <span className="block text-sm text-muted-foreground">Fat</span>
          <span className="text-xl font-medium">{nutrition.fat}g</span>
        </div>
        <div className="bg-secondary/50 rounded-lg p-3 text-center">
          <span className="block text-sm text-muted-foreground">Carbs</span>
          <span className="text-xl font-medium">{nutrition.carbs}g</span>
        </div>
        <div className="bg-secondary/50 rounded-lg p-3 text-center">
          <span className="block text-sm text-muted-foreground">Fiber</span>
          <span className="text-xl font-medium">{nutrition.fiber}g</span>
        </div>
      </div>
      
      <div className="mt-4 space-y-3">
        <div className="text-center">
          <span className="text-sm text-muted-foreground mr-2">Health Score:</span>
          <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full font-medium capitalize">
            {nutritionScore}
          </span>
          {healthReason && (
            <p className="mt-2 text-sm text-muted-foreground">{healthReason}</p>
          )}
        </div>
        
        <div className="text-center">
          <span className="text-sm text-muted-foreground mr-2">Fiber Score:</span>
          <span className={`inline-block px-3 py-1 rounded-full font-medium capitalize border ${getFiberScoreBadgeColor(fiberScore)}`}>
            {fiberScore}
          </span>
          <p className="mt-2 text-sm text-muted-foreground italic">{fiberNote}</p>
        </div>
      </div>
    </div>
  );
};

export default MealNutritionInfo;
