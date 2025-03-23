
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { analyzeMealPhoto, analyzeMealText } from "@/utils/api";
import { useMealJournal } from "@/context/MealJournalContext";
import { MealType, MealAnalysisResponse } from "@/types";
import PhotoUploadSection from "./components/PhotoUploadSection";
import AnalysisInProgress from "./components/AnalysisInProgress";
import AnalysisError from "./components/AnalysisError";
import MealDetailsForm from "./components/MealDetailsForm";
import TextInputSection from "./components/TextInputSection";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  const [mealDescription, setMealDescription] = useState("");
  const [activeTab, setActiveTab] = useState("photo");
  
  const handlePhotoSelected = (file: File) => {
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setAnalysisResult(null);
    setIsAnalyzing(false);
    setAnalysisError(null);
  };
  
  const handleAnalyzePhoto = async (includeNotes = false) => {
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
      setMealTypeBasedOnTime();
      
      toast.success("Analysis complete!");
    } catch (error) {
      console.error("Error analyzing meal photo:", error);
      setAnalysisError(error instanceof Error ? error.message : "Failed to analyze the photo");
      toast.error("Failed to analyze the photo. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAnalyzeText = async () => {
    if (!mealDescription || mealDescription.trim() === "") {
      toast.error("Please describe your meal first");
      return;
    }
    
    try {
      setIsAnalyzing(true);
      setAnalysisError(null);
      toast.info("Analyzing your meal description...");
      
      const result = await analyzeMealText(mealDescription);
      
      setAnalysisResult(result);
      setTitle(result.title);
      
      // Determine meal type based on time of day if it's set to random
      setMealTypeBasedOnTime();
      
      toast.success("Analysis complete!");
    } catch (error) {
      console.error("Error analyzing meal description:", error);
      setAnalysisError(error instanceof Error ? error.message : "Failed to analyze the description");
      toast.error("Failed to analyze your meal description. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  const setMealTypeBasedOnTime = () => {
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
  };
  
  const handleSave = () => {
    if (!analysisResult) {
      toast.error("Please analyze your meal first");
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

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // Reset analysis state when switching tabs
    setAnalysisResult(null);
    setAnalysisError(null);
    setIsAnalyzing(false);
    setNotes("");
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">Capture Meal</h1>
        <p className="text-muted-foreground">
          Take a photo or describe your meal for automatic nutrition analysis
        </p>
      </div>
      
      <Tabs defaultValue="photo" value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid grid-cols-2 mb-6">
          <TabsTrigger value="photo">Photo</TabsTrigger>
          <TabsTrigger value="text">Text Description</TabsTrigger>
        </TabsList>
        
        <TabsContent value="photo" className="mt-0">
          <PhotoUploadSection 
            selectedFile={selectedFile}
            previewUrl={previewUrl}
            isAnalyzing={isAnalyzing}
            onPhotoSelected={handlePhotoSelected}
            onAnalyze={handleAnalyzePhoto}
            analysisResult={analysisResult}
            notes={notes}
            setNotes={setNotes}
          />
        </TabsContent>
        
        <TabsContent value="text" className="mt-0">
          <TextInputSection
            mealDescription={mealDescription}
            setMealDescription={setMealDescription}
            isAnalyzing={isAnalyzing}
            onAnalyze={handleAnalyzeText}
            analysisResult={analysisResult}
          />
        </TabsContent>
      </Tabs>
      
      {isAnalyzing && <AnalysisInProgress />}
      
      {analysisError && !isAnalyzing && !analysisResult && (
        <AnalysisError 
          error={analysisError} 
          onRetry={() => activeTab === "photo" ? handleAnalyzePhoto(false) : handleAnalyzeText()} 
        />
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
          onReanalyze={() => activeTab === "photo" ? handleAnalyzePhoto(true) : handleAnalyzeText()}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default CapturePage;
