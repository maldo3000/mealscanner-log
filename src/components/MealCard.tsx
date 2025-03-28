
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { MealEntry } from "@/types";
import { formatDate, formatTime, getNutritionScoreBadgeColor } from "@/utils/helpers";
import { Badge } from "@/components/ui/CustomBadge";
import { Clock, CalendarDays, Utensils, Trash2, Award } from "lucide-react";
import { useMealJournal } from "@/context/mealJournal";
import { toast } from "sonner";

interface MealCardProps {
  meal: MealEntry;
}

const MealCard: React.FC<MealCardProps> = ({ meal }) => {
  const { deleteMeal } = useMealJournal();
  const [showDeleteButton, setShowDeleteButton] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (window.confirm("Are you sure you want to delete this meal?")) {
      deleteMeal(meal.id);
      toast.success("Meal deleted successfully");
    }
  };
  
  // Check if this is a text-only entry
  const hasNoImage = !meal.imageUrl || imageError;
  
  return (
    <div 
      className="block w-full relative"
      onMouseEnter={() => setShowDeleteButton(true)}
      onMouseLeave={() => setShowDeleteButton(false)}
      onTouchStart={() => setShowDeleteButton(true)}
    >
      <Link
        to={`/meal/${meal.id}`}
        className="block w-full"
      >
        <div className="glass-card glass-card-hover rounded-2xl overflow-hidden transition-all duration-300 h-full">
          <div className="relative aspect-video w-full overflow-hidden bg-muted">
            {!hasNoImage ? (
              <img
                src={meal.imageUrl}
                alt={meal.title}
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                loading="lazy"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full w-full text-muted-foreground bg-muted/30">
                <Utensils className="w-16 h-16 mb-2 opacity-80" />
                <span className="text-sm">No image available</span>
              </div>
            )}
            <div className="absolute top-3 left-3">
              <Badge 
                className="capitalize font-medium py-1 px-3 text-xs bg-black/50 text-white backdrop-blur-xs"
              >
                {meal.mealType}
              </Badge>
            </div>
            <div className="absolute bottom-3 left-3">
              <Badge 
                className={`capitalize font-medium py-1 px-3 text-xs ${getNutritionScoreBadgeColor(meal.nutritionScore)} flex items-center gap-1`}
              >
                <Award className="w-3 h-3" />
                {meal.nutritionScore}
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
      
      {showDeleteButton && (
        <button
          onClick={handleDelete}
          className="absolute top-3 right-3 z-10 p-3 bg-red-500 text-white rounded-full opacity-90 hover:opacity-100 transition-opacity duration-200"
          aria-label="Delete meal"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};

export default MealCard;
