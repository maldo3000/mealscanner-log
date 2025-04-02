
import React, { useEffect } from "react";
import { MealType, MealAnalysisResponse } from "@/types";
import { formatDate, formatTime, getMealTypeOptions } from "@/utils/helpers";
import { CalendarDays, Clock, RefreshCw } from "lucide-react";
import MealNutritionInfo from "./MealNutritionInfo";
import FoodItemsList from "./FoodItemsList";

interface MealDetailsFormProps {
  analysisResult: MealAnalysisResponse;
  title: string;
  setTitle: (title: string) => void;
  mealType: MealType;
  setMealType: (mealType: MealType) => void;
  notes: string;
  setNotes: (notes: string) => void;
  onReanalyze: () => void;
  onSave: () => void;
}

const MealDetailsForm: React.FC<MealDetailsFormProps> = ({
  analysisResult,
  title,
  setTitle,
  mealType,
  setMealType,
  notes,
  setNotes,
  onReanalyze,
  onSave
}) => {
  const mealTypeOptions = getMealTypeOptions();
  const now = new Date();
  
  // Automatically include the health reason in the notes if available
  useEffect(() => {
    if (analysisResult.healthReason && notes.indexOf(analysisResult.healthReason) === -1) {
      const healthScoreNote = `Health Score (${analysisResult.nutritionScore}): ${analysisResult.healthReason}`;
      
      if (notes.trim() === '') {
        setNotes(healthScoreNote);
      } else {
        // Check if notes already has health score information
        if (notes.includes('Health Score (')) {
          // Replace existing health score note with new one
          const updatedNotes = notes.replace(/Health Score \([^)]+\): [^\n]+/g, healthScoreNote);
          setNotes(updatedNotes);
        } else {
          // Add health score note at the beginning followed by existing notes
          setNotes(`${healthScoreNote}\n\n${notes}`);
        }
      }
    }
  }, [analysisResult.healthReason, analysisResult.nutritionScore, notes, setNotes]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Meal details</h3>
          <div className="flex items-center text-sm text-muted-foreground">
            <CalendarDays className="w-4 h-4 mr-1" />
            <span>{formatDate(now)}</span>
            <span className="mx-2">•</span>
            <Clock className="w-4 h-4 mr-1" />
            <span>{formatTime(now)}</span>
          </div>
        </div>
        
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
              placeholder="Meal title"
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
          
          <div>
            <label htmlFor="notes" className="block text-sm font-medium mb-1">
              Notes (optional)
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-border bg-background"
              rows={3}
              placeholder="Add any additional notes about this meal..."
            />
          </div>
          
          <div className="flex justify-end">
            <button
              onClick={onReanalyze}
              className="flex items-center gap-1 text-sm px-4 py-2 bg-secondary/60 hover:bg-secondary/80 rounded-lg transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Re-analyze with notes
            </button>
          </div>
        </div>
      </div>
      
      <FoodItemsList foodItems={analysisResult.foodItems} />
      
      <MealNutritionInfo 
        nutrition={analysisResult.nutrition} 
        nutritionScore={analysisResult.nutritionScore} 
        healthReason={analysisResult.healthReason}
      />
      
      <div className="flex justify-center mt-8">
        <button
          onClick={onSave}
          className="bg-primary text-white py-3 px-8 rounded-full font-medium"
        >
          Save to Journal
        </button>
      </div>
    </div>
  );
};

export default MealDetailsForm;
