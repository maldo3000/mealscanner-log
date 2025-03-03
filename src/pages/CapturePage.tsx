
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import PhotoUploader from "@/components/PhotoUploader";
import { analyzeMealPhoto } from "@/utils/api";
import { useMealJournal } from "@/context/MealJournalContext";
import { MealType, MealAnalysisResponse, NutritionScore } from "@/types";
import { formatDate, formatTime, getMealTypeOptions } from "@/utils/helpers";
import LoadingSpinner from "@/components/LoadingSpinner";
import { toast } from "sonner";
import { CalendarDays, Clock, Plus } from "lucide-react";

const CapturePage: React.FC = () => {
  const navigate = useNavigate();
  const { addMeal } = useMealJournal();
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<MealAnalysisResponse | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [title, setTitle] = useState("");
  const [mealType, setMealType] = useState<MealType>("random");
  const [notes, setNotes] = useState("");
  
  const handlePhotoSelected = (file: File) => {
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setAnalysisResult(null);
    setIsAnalyzing(false);
  };
  
  const handleAnalyze = async () => {
    if (!selectedFile) return;
    
    try {
      setIsAnalyzing(true);
      const result = await analyzeMealPhoto(selectedFile);
      setAnalysisResult(result);
      setTitle(result.title);
    } catch (error) {
      console.error("Error analyzing meal photo:", error);
      toast.error("Failed to analyze the photo. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  const handleSave = () => {
    if (!selectedFile || !analysisResult) return;
    
    const timestamp = new Date().toISOString();
    
    addMeal({
      title,
      description: analysisResult.description,
      foodItems: analysisResult.foodItems,
      nutrition: analysisResult.nutrition,
      nutritionScore: analysisResult.nutritionScore,
      imageUrl: previewUrl!,
      mealType,
      notes,
      timestamp,
    });
    
    navigate('/journal');
  };
  
  const mealTypeOptions = getMealTypeOptions();
  const now = new Date();
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">Capture Meal</h1>
        <p className="text-muted-foreground">
          Take a photo of your meal for automatic nutrition analysis
        </p>
      </div>
      
      <PhotoUploader onPhotoSelected={handlePhotoSelected} />
      
      {selectedFile && !isAnalyzing && !analysisResult && (
        <div className="flex justify-center mt-6">
          <button
            onClick={handleAnalyze}
            className="bg-primary text-white py-2 px-6 rounded-full font-medium flex items-center"
          >
            <Plus className="h-4 w-4 mr-1" />
            Analyze meal
          </button>
        </div>
      )}
      
      {isAnalyzing && (
        <div className="glass-card rounded-2xl p-8 text-center">
          <LoadingSpinner className="mb-4" />
          <h3 className="text-lg font-medium mb-2">Analyzing your meal...</h3>
          <p className="text-muted-foreground">
            Our AI is identifying food items and calculating nutrition data
          </p>
        </div>
      )}
      
      {analysisResult && (
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
            </div>
          </div>
          
          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-lg font-medium mb-4">Food Identified</h3>
            <ul className="space-y-2">
              {analysisResult.foodItems.map((item, index) => (
                <li key={index} className="flex items-center">
                  <span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-lg font-medium mb-2">Nutrition Information</h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="bg-secondary/50 rounded-lg p-3 text-center">
                <span className="block text-sm text-muted-foreground">Calories</span>
                <span className="text-xl font-medium">{analysisResult.nutrition.calories}</span>
              </div>
              <div className="bg-secondary/50 rounded-lg p-3 text-center">
                <span className="block text-sm text-muted-foreground">Protein</span>
                <span className="text-xl font-medium">{analysisResult.nutrition.protein}g</span>
              </div>
              <div className="bg-secondary/50 rounded-lg p-3 text-center">
                <span className="block text-sm text-muted-foreground">Fat</span>
                <span className="text-xl font-medium">{analysisResult.nutrition.fat}g</span>
              </div>
              <div className="bg-secondary/50 rounded-lg p-3 text-center">
                <span className="block text-sm text-muted-foreground">Carbs</span>
                <span className="text-xl font-medium">{analysisResult.nutrition.carbs}g</span>
              </div>
            </div>
            
            <div className="mt-4 text-center">
              <span className="text-sm text-muted-foreground mr-2">Health Score:</span>
              <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full font-medium capitalize">
                {analysisResult.nutritionScore}
              </span>
            </div>
          </div>
          
          <div className="flex justify-center mt-8">
            <button
              onClick={handleSave}
              className="bg-primary text-white py-3 px-8 rounded-full font-medium"
            >
              Save to Journal
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CapturePage;
