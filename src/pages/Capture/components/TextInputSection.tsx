
import React from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { MealAnalysisResponse } from "@/types";

interface TextInputSectionProps {
  mealDescription: string;
  setMealDescription: (description: string) => void;
  isAnalyzing: boolean;
  analysisResult: MealAnalysisResponse | null;
  onAnalyze: () => Promise<void>;
}

const TextInputSection: React.FC<TextInputSectionProps> = ({
  mealDescription,
  setMealDescription,
  isAnalyzing,
  analysisResult,
  onAnalyze
}) => {
  return (
    <div className="glass-card rounded-2xl p-6 animate-fade-in">
      <div className="space-y-4">
        <div>
          <Label htmlFor="meal-description" className="text-base font-medium mb-2 block">
            Describe Your Meal
          </Label>
          <Textarea
            id="meal-description"
            placeholder="Describe your meal in detail (e.g., 'I had a fistful of brown rice, a palm-sized grilled chicken breast with herbs, and a large handful of steamed broccoli with a teaspoon of olive oil')"
            value={mealDescription}
            onChange={(e) => setMealDescription(e.target.value)}
            className="min-h-[150px]"
            disabled={isAnalyzing || !!analysisResult}
          />
          <p className="text-sm text-muted-foreground mt-2">
            Be specific about portion sizes, ingredients, and preparation methods for more accurate analysis
          </p>
        </div>
        
        {!isAnalyzing && !analysisResult && (
          <div className="flex justify-center mt-4">
            <button
              onClick={onAnalyze}
              className="bg-primary text-white py-2 px-6 rounded-full font-medium flex items-center"
              disabled={!mealDescription.trim()}
            >
              <Plus className="h-4 w-4 mr-1" />
              Analyze with AI
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TextInputSection;
