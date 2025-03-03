
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import PhotoUploader from "@/components/PhotoUploader";
import { analyzeMealPhoto } from "@/utils/api";
import { useMealJournal } from "@/context/MealJournalContext";
import { MealType, MealAnalysisResponse, NutritionScore } from "@/types";
import { formatDate, formatTime, getMealTypeOptions } from "@/utils/helpers";
import LoadingSpinner from "@/components/LoadingSpinner";
import { toast } from "sonner";
import { CalendarDays, Clock, Plus, RefreshCw } from "lucide-react";

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
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  
  const handlePhotoSelected = (file: File) => {
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setAnalysisResult(null);
    setIsAnalyzing(false);
    setAnalysisError(null);
  };
  
  const handleAnalyze = async (includeNotes = false) => {
    if (!selectedFile) {
      toast.error("Please select a photo first");
      return;
    }
    
    try {
      setIsAnalyzing(true);
      setAnalysisError(null);
      toast.info("Analyzing your meal photo...");
      
      // Pass notes as context if requested
      const notesToUse = includeNotes ? notes : undefined;
      console.log("Analyzing with notes:", notesToUse);
      
      const result = await analyzeMealPhoto(selectedFile, notesToUse);
      
      // Update the state with analysis results
      setAnalysisResult(result);
      setTitle(result.title);
      
      // Automatically determine meal type based on time of day if it's set to random
      if (mealType === "random") {
        const currentHour = new Date().getHours();
        if (currentHour >= 5 && currentHour < 10) {
          setMealType("breakfast");
        } else if (currentHour >= 10 && currentHour < 15) {
          setMealType("lunch");
        } else if (currentHour >= 15 && currentHour < 21) {
          setMealType("dinner");
        } else {
          setMealType("snack");
        }
      }
      
      toast.success("Analysis complete!");
    } catch (error) {
      console.error("Error analyzing meal photo:", error);
      setAnalysisError(error instanceof Error ? error.message : "Failed to analyze the photo");
      toast.error("Failed to analyze the photo. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  const handleSave = () => {
    if (!selectedFile || !analysisResult) {
      toast.error("Please analyze a photo first");
      return;
    }
    
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
    
    toast.success("Meal saved to your journal!");
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
            onClick={() => handleAnalyze(false)}
            className="bg-primary text-white py-2 px-6 rounded-full font-medium flex items-center"
          >
            <Plus className="h-4 w-4 mr-1" />
            Analyze with AI
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
      
      {analysisError && !isAnalyzing && !analysisResult && (
        <div className="glass-card rounded-2xl p-6 border border-red-200 bg-red-50 dark:bg-red-900/10">
          <h3 className="text-lg font-medium mb-2 text-red-600 dark:text-red-400">Analysis Failed</h3>
          <p className="text-red-600 dark:text-red-400 mb-4">{analysisError}</p>
          <button
            onClick={() => handleAnalyze(false)}
            className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 py-2 px-4 rounded-lg font-medium flex items-center mx-auto"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Try Again
          </button>
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
              
              <div className="flex justify-end">
                <button
                  onClick={() => handleAnalyze(true)}
                  className="flex items-center gap-1 text-sm px-4 py-2 bg-secondary/60 hover:bg-secondary/80 rounded-lg transition-colors"
                  disabled={isAnalyzing}
                >
                  <RefreshCw className="h-4 w-4" />
                  Re-analyze with notes
                </button>
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
