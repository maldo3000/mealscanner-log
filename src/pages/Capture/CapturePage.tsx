
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { analyzeMealPhoto } from "@/utils/api";
import { useMealJournal } from "@/context/MealJournalContext";
import { MealType, MealAnalysisResponse } from "@/types";
import PhotoUploadSection from "./components/PhotoUploadSection";
import AnalysisInProgress from "./components/AnalysisInProgress";
import AnalysisError from "./components/AnalysisError";
import MealDetailsForm from "./components/MealDetailsForm";
import { toast } from "sonner";

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
      
      const notesToUse = includeNotes ? notes : undefined;
      console.log("Analyzing with notes:", notesToUse);
      
      const result = await analyzeMealPhoto(selectedFile, notesToUse);
      
      setAnalysisResult(result);
      setTitle(result.title);
      
      // Determine meal type based on time of day if it's set to random
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
      imageUrl: analysisResult.imageUrl,
      mealType,
      notes,
      timestamp,
    });
    
    toast.success("Meal saved to your journal!");
    navigate('/journal');
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">Capture Meal</h1>
        <p className="text-muted-foreground">
          Take a photo of your meal for automatic nutrition analysis
        </p>
      </div>
      
      <PhotoUploadSection 
        selectedFile={selectedFile}
        previewUrl={previewUrl}
        isAnalyzing={isAnalyzing}
        onPhotoSelected={handlePhotoSelected}
        onAnalyze={handleAnalyze}
        analysisResult={analysisResult}
      />
      
      {isAnalyzing && <AnalysisInProgress />}
      
      {analysisError && !isAnalyzing && !analysisResult && (
        <AnalysisError error={analysisError} onRetry={() => handleAnalyze(false)} />
      )}
      
      {analysisResult && (
        <MealDetailsForm
          analysisResult={analysisResult}
          title={title}
          setTitle={setTitle}
          mealType={mealType}
          setMealType={setMealType}
          notes={notes}
          setNotes={setNotes}
          onReanalyze={() => handleAnalyze(true)}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default CapturePage;
