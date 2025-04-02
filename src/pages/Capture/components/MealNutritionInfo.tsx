
import React from "react";
import { NutritionInfo, NutritionScore } from "@/types";

interface MealNutritionInfoProps {
  nutrition: NutritionInfo;
  nutritionScore: NutritionScore;
  healthReason?: string;
}

const MealNutritionInfo: React.FC<MealNutritionInfoProps> = ({ 
  nutrition, 
  nutritionScore,
  healthReason 
}) => {
  return (
    <div className="glass-card rounded-2xl p-6">
      <h3 className="text-lg font-medium mb-2">Nutrition Information</h3>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
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
      </div>
      
      <div className="mt-4 text-center">
        <span className="text-sm text-muted-foreground mr-2">Health Score:</span>
        <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full font-medium capitalize">
          {nutritionScore}
        </span>
        {healthReason && (
          <p className="mt-2 text-sm text-muted-foreground">{healthReason}</p>
        )}
      </div>
    </div>
  );
};

export default MealNutritionInfo;
