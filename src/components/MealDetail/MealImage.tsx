
import React, { useState } from "react";
import { Badge } from "@/components/ui/CustomBadge";
import { getNutritionScoreBadgeColor } from "@/utils/helpers";
import { NutritionScore } from "@/types";
import { Award, Utensils } from "lucide-react";

interface MealImageProps {
  imageUrl: string;
  title: string;
  nutritionScore: NutritionScore;
}

const MealImage: React.FC<MealImageProps> = ({ imageUrl, title, nutritionScore }) => {
  const [imageError, setImageError] = useState(false);
  
  // Check if this is a text-only entry
  const hasNoImage = !imageUrl || imageError;
  
  return (
    <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-muted">
      {!hasNoImage ? (
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <div className="flex flex-col items-center justify-center h-full w-full text-muted-foreground bg-muted/30">
          <Utensils className="w-20 h-20 mb-3 opacity-80" />
          <span>No image available</span>
        </div>
      )}
      <div className="absolute bottom-4 left-4 flex items-center">
        <Badge 
          className={`capitalize font-medium py-1 px-3 ${getNutritionScoreBadgeColor(nutritionScore)} flex items-center gap-1`}
        >
          <Award className="w-3.5 h-3.5" />
          {nutritionScore}
        </Badge>
      </div>
    </div>
  );
};

export default MealImage;
