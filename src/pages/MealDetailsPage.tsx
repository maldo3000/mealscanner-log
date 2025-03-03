
import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useMealJournal } from "@/context/MealJournalContext";
import { MealType } from "@/types";
import { formatDate, formatTime, getMealTypeOptions, getNutritionScoreBadgeColor } from "@/utils/helpers";
import NutritionChart from "@/components/NutritionChart";
import { Badge } from "@/components/ui/Badge";
import { CalendarDays, Clock, ArrowLeft, Trash2, Edit, X, Check } from "lucide-react";
import { toast } from "sonner";

const MealDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getMeal, updateMeal, deleteMeal } = useMealJournal();
  
  const meal = getMeal(id!);
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(meal?.title || "");
  const [mealType, setMealType] = useState<MealType>(meal?.mealType || "random");
  const [notes, setNotes] = useState(meal?.notes || "");
  
  if (!meal) {
    navigate("/journal");
    return null;
  }
  
  const mealTypeOptions = getMealTypeOptions();
  
  const handleSaveChanges = () => {
    updateMeal(id!, {
      title,
      mealType,
      notes,
    });
    setIsEditing(false);
    toast.success("Meal updated successfully");
  };
  
  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this meal?")) {
      deleteMeal(id!);
      navigate("/journal");
    }
  };
  
  return (
    <div className="space-y-6 pb-8 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <Link to="/journal" className="flex items-center text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4 mr-1" />
          <span>Back</span>
        </Link>
        
        <div className="flex space-x-2">
          {isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(false)}
                className="p-2 text-muted-foreground hover:text-foreground rounded-full"
              >
                <X className="h-5 w-5" />
              </button>
              <button
                onClick={handleSaveChanges}
                className="p-2 text-primary hover:text-primary/80 rounded-full"
              >
                <Check className="h-5 w-5" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="p-2 text-muted-foreground hover:text-foreground rounded-full"
              >
                <Edit className="h-5 w-5" />
              </button>
              <button
                onClick={handleDelete}
                className="p-2 text-destructive hover:text-destructive/80 rounded-full"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </>
          )}
        </div>
      </div>
      
      <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-muted">
        <img
          src={meal.imageUrl}
          alt={meal.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-4 right-4">
          <Badge 
            className={`capitalize font-medium py-1 px-3 ${getNutritionScoreBadgeColor(meal.nutritionScore)}`}
          >
            {meal.nutritionScore}
          </Badge>
        </div>
      </div>
      
      <div className="glass-card rounded-2xl p-6">
        {isEditing ? (
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium mb-1">
                Title
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background"
              />
            </div>
            
            <div>
              <label htmlFor="mealType" className="block text-sm font-medium mb-1">
                Meal Type
              </label>
              <select
                id="mealType"
                value={mealType}
                onChange={(e) => setMealType(e.target.value as MealType)}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background"
              >
                {mealTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ) : (
          <div>
            <h1 className="text-2xl font-bold mb-2">{meal.title}</h1>
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mb-4">
              <Badge className="capitalize bg-primary/10 text-primary">{meal.mealType}</Badge>
              <div className="flex items-center">
                <CalendarDays className="w-4 h-4 mr-1" />
                <span>{formatDate(meal.createdAt)}</span>
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                <span>{formatTime(meal.createdAt)}</span>
              </div>
            </div>
            <p className="text-muted-foreground">{meal.description}</p>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card rounded-2xl p-6">
          <h2 className="text-lg font-medium mb-4">Food Items</h2>
          <ul className="space-y-2">
            {meal.foodItems.map((item, index) => (
              <li key={index} className="flex items-start">
                <span className="w-2 h-2 mt-1.5 bg-primary rounded-full mr-2 flex-shrink-0"></span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
        
        <NutritionChart nutrition={meal.nutrition} />
      </div>
      
      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-lg font-medium mb-2">Notes</h2>
        
        {isEditing ? (
          <div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-border bg-background"
              rows={4}
              placeholder="Add notes about this meal..."
            />
          </div>
        ) : (
          <div>
            {meal.notes ? (
              <p className="text-muted-foreground">{meal.notes}</p>
            ) : (
              <p className="text-muted-foreground italic">No notes added</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MealDetailsPage;
