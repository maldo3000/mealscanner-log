
import React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { useSubscription } from "@/context/subscription";
import { useCaptureState } from "./hooks/useCaptureState";
import CaptureHeader from "./components/CaptureHeader";
import CaptureTabs from "./components/CaptureTabs";
import AnalysisInProgress from "./components/AnalysisInProgress";
import AnalysisError from "./components/AnalysisError";
import MealDetailsForm from "./components/MealDetailsForm";
import CaptureLoadingState from "./components/CaptureLoadingState";

const CapturePage: React.FC = () => {
  const { remainingScans, paywallEnabled, loadingSubscription } = useSubscription();
  const isMobile = useIsMobile();
  
  const {
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
    setTitle,
    setMealType,
    setNotes,
    setMealDescription,
    handlePhotoSelected,
    handleAnalyzePhoto,
    handleAnalyzeText,
    handleSave,
    handleTabChange
  } = useCaptureState();
  
  if (loadingSubscription) {
    return <CaptureLoadingState />;
  }
  
  return (
    <div className={cn("space-y-6 animate-fade-in", isMobile && isAnalyzing ? "pt-0" : "")}>
      <div className="glass-card rounded-xl p-4 backdrop-blur-md bg-card/50 border-border/30 shadow-sm">
        <CaptureHeader
          paywallEnabled={paywallEnabled}
          remainingScans={remainingScans}
          isMobile={isMobile}
          isAnalyzing={isAnalyzing}
        />
      </div>
      
      <div className="glass-card rounded-xl p-4 backdrop-blur-md bg-card/50 border-border/30 shadow-sm">
        <CaptureTabs
          activeTab={activeTab}
          onTabChange={handleTabChange}
          isMobile={isMobile}
          isAnalyzing={isAnalyzing}
          selectedFile={selectedFile}
          previewUrl={previewUrl}
          onPhotoSelected={handlePhotoSelected}
          onAnalyzePhoto={handleAnalyzePhoto}
          notes={notes}
          setNotes={setNotes}
          analysisResult={analysisResult}
          mealDescription={mealDescription}
          setMealDescription={setMealDescription}
          onAnalyzeText={handleAnalyzeText}
        />
      </div>
      
      {isAnalyzing && (
        <div className="glass-card rounded-xl p-6 backdrop-blur-md bg-card/50 border-border/30 shadow-sm">
          <AnalysisInProgress />
        </div>
      )}
      
      {analysisError && !isAnalyzing && !analysisResult && (
        <div className="glass-card rounded-xl p-6 backdrop-blur-md bg-card/50 border-border/30 shadow-sm">
          <AnalysisError 
            error={analysisError} 
            onRetry={() => activeTab === "photo" ? handleAnalyzePhoto(false) : handleAnalyzeText()} 
          />
        </div>
      )}
      
      {analysisResult && (
        <div className="glass-card rounded-xl p-6 backdrop-blur-md bg-card/50 border-border/30 shadow-sm">
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
        </div>
      )}
    </div>
  );
};

export default CapturePage;
