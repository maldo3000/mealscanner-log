
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { MealType, MealAnalysisResponse } from "@/types";
import { analyzeMealPhoto, analyzeMealText } from "@/utils/api";
import { useMealJournal } from "@/context/MealJournalContext";
import { useSubscription } from "@/context/subscription";

export function useCaptureState() {
  const navigate = useNavigate();
  const { addMeal } = useMealJournal();
  const { incrementScanCount, canScan, paywallEnabled, loadingSubscription } = useSubscription();
  
  // State
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
  
  // Check if user has reached scan limit
  useEffect(() => {
    if (!loadingSubscription && paywallEnabled && !canScan) {
      toast.error("You've reached your free scan limit. Please subscribe to continue.");
      navigate('/subscription');
    }
  }, [canScan, loadingSubscription, navigate, paywallEnabled]);
  
  // Handle photo selection
  const handlePhotoSelected = (file: File) => {
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setAnalysisResult(null);
    setIsAnalyzing(false);
    setAnalysisError(null);
  };
  
  // Set meal type based on time of day
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
  
  // Analyze photo
  const handleAnalyzePhoto = async (includeNotes = false) => {
    if (!selectedFile) {
      toast.error("Please select a photo first");
      return;
    }
    
    if (paywallEnabled) {
      const canProceed = await incrementScanCount();
      if (!canProceed) {
        navigate('/subscription');
        return;
      }
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

  // Analyze text description
  const handleAnalyzeText = async () => {
    if (!mealDescription || mealDescription.trim() === "") {
      toast.error("Please describe your meal first");
      return;
    }
    
    if (paywallEnabled) {
      const canProceed = await incrementScanCount();
      if (!canProceed) {
        navigate('/subscription');
        return;
      }
    }
    
    try {
      setIsAnalyzing(true);
      setAnalysisError(null);
      toast.info("Analyzing your meal description...");
      
      const result = await analyzeMealText(mealDescription);
      
      setAnalysisResult(result);
      setTitle(result.title);
      
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
  
  // Save meal to journal
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

  // Handle tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setAnalysisResult(null);
    setAnalysisError(null);
    setIsAnalyzing(false);
    setNotes("");
  };
  
  return {
    // State
    selectedFile,
    previewUrl,
    analysisResult,
    isAnalyzing,
    title,
    mealType,
    notes,
    analysisError,
    mealDescription,
    activeTab,
    loadingSubscription,
    paywallEnabled,
    // Setters
    setTitle,
    setMealType,
    setNotes,
    setMealDescription,
    // Handlers
    handlePhotoSelected,
    handleAnalyzePhoto,
    handleAnalyzeText,
    handleSave,
    handleTabChange
  };
}
