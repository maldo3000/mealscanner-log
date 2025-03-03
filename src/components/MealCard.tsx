
import React from "react";
import { Link } from "react-router-dom";
import { MealEntry } from "@/types";
import { formatDate, formatTime, getNutritionScoreBadgeColor } from "@/utils/helpers";
import { Badge } from "@/components/ui/Badge";
import { Clock, CalendarDays } from "lucide-react";

interface MealCardProps {
  meal: MealEntry;
}

const MealCard: React.FC<MealCardProps> = ({ meal }) => {
  return (
    <Link
      to={`/meal/${meal.id}`}
      className="block w-full"
    >
      <div className="glass-card glass-card-hover rounded-2xl overflow-hidden transition-all duration-300 h-full">
        <div className="relative aspect-video w-full overflow-hidden bg-muted">
          <img
            src={meal.imageUrl}
            alt={meal.title}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
            loading="lazy"
          />
          <div className="absolute top-3 right-3">
            <Badge 
              className={`capitalize font-medium py-1 px-3 text-xs ${getNutritionScoreBadgeColor(meal.nutritionScore)}`}
            >
              {meal.nutritionScore}
            </Badge>
          </div>
          <div className="absolute top-3 left-3">
            <Badge 
              className="capitalize font-medium py-1 px-3 text-xs bg-black/50 text-white backdrop-blur-xs"
            >
              {meal.mealType}
            </Badge>
          </div>
        </div>
        
        <div className="p-4">
          <h3 className="font-medium text-lg line-clamp-1">{meal.title}</h3>
          
          <div className="mt-2 flex items-center text-sm text-muted-foreground">
            <CalendarDays className="w-4 h-4 mr-1" />
            <span>{formatDate(meal.createdAt)}</span>
            <span className="mx-2">•</span>
            <Clock className="w-4 h-4 mr-1" />
            <span>{formatTime(meal.createdAt)}</span>
          </div>
          
          <div className="mt-3 flex justify-between items-center">
            <div className="text-sm">
              <span className="font-medium">{meal.nutrition.calories}</span> calories
            </div>
            
            <div className="flex space-x-3 text-xs text-muted-foreground">
              <span>P: {meal.nutrition.protein}g</span>
              <span>F: {meal.nutrition.fat}g</span>
              <span>C: {meal.nutrition.carbs}g</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default MealCard;
