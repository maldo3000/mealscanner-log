
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMealJournal } from "@/context/MealJournalContext";
import { MealType } from "@/types";
import { toast } from "sonner";
import MealHeader from "@/components/MealDetail/MealHeader";
import MealImage from "@/components/MealDetail/MealImage";
import MealInfo from "@/components/MealDetail/MealInfo";
import MealNotes from "@/components/MealDetail/MealNotes";
import NutritionSection from "@/components/MealDetail/NutritionSection";
import BackgroundGradient from "@/components/ui/background-gradient";

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
    // Use a simple confirm dialog which works better on mobile
    if (window.confirm("Are you sure you want to delete this meal?")) {
      deleteMeal(id!);
      toast.success("Meal deleted successfully");
      navigate("/journal");
    }
  };
  
  return (
    <>
      <BackgroundGradient />
      <div className="space-y-6 pb-8 animate-fade-in relative">
        {/* Title section is now separate for better organization */}
        <div className="mb-2 glass-card rounded-xl p-4 backdrop-blur-md bg-card/50 border-border/30 shadow-sm">
          <h1 className="text-2xl font-bold">Meal Details</h1>
        </div>
        
        <div className="glass-card rounded-xl p-4 backdrop-blur-md bg-card/50 border-border/30 shadow-sm">
          <MealHeader 
            isEditing={isEditing}
            onEditToggle={() => setIsEditing(!isEditing)}
            onSaveChanges={handleSaveChanges}
            onDelete={handleDelete}
          />
        </div>
        
        <div className="glass-card rounded-xl overflow-hidden backdrop-blur-md bg-card/50 border-border/30 shadow-sm">
          <MealImage 
            imageUrl={meal.imageUrl}
            title={meal.title}
            nutritionScore={meal.nutritionScore}
          />
        </div>
        
        <div className="glass-card rounded-xl p-4 backdrop-blur-md bg-card/50 border-border/30 shadow-sm">
          <MealInfo
            title={title}
            mealType={mealType}
            createdAt={meal.createdAt}
            description={meal.description}
            isEditing={isEditing}
            onTitleChange={setTitle}
            onMealTypeChange={setMealType}
          />
        </div>
        
        <div className="glass-card rounded-xl p-4 backdrop-blur-md bg-card/50 border-border/30 shadow-sm">
          <NutritionSection 
            nutrition={meal.nutrition}
            foodItems={meal.foodItems}
          />
        </div>
        
        <div className="glass-card rounded-xl p-4 backdrop-blur-md bg-card/50 border-border/30 shadow-sm">
          <MealNotes
            notes={notes}
            isEditing={isEditing}
            onNotesChange={setNotes}
          />
        </div>
      </div>
    </>
  );
};

export default MealDetailsPage;
