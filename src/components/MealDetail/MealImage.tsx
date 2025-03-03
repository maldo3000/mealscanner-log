
import React from "react";
import { Badge } from "@/components/ui/CustomBadge";
import { getNutritionScoreBadgeColor } from "@/utils/helpers";
import { NutritionScore } from "@/types";

interface MealImageProps {
  imageUrl: string;
  title: string;
  nutritionScore: NutritionScore;
}

const MealImage: React.FC<MealImageProps> = ({ imageUrl, title, nutritionScore }) => {
  return (
    <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-muted">
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="flex items-center justify-center h-full w-full text-muted-foreground">
          No image available
        </div>
      )}
      <div className="absolute top-4 right-4">
        <Badge 
          className={`capitalize font-medium py-1 px-3 ${getNutritionScoreBadgeColor(nutritionScore)}`}
        >
          {nutritionScore}
        </Badge>
      </div>
    </div>
  );
};

export default MealImage;
