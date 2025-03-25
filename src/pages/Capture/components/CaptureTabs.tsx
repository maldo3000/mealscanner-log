
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import PhotoUploadSection from "./PhotoUploadSection";
import TextInputSection from "./TextInputSection";
import { MealAnalysisResponse } from "@/types";

interface CaptureTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
  isMobile: boolean;
  isAnalyzing: boolean;
  selectedFile: File | null;
  previewUrl: string | null;
  onPhotoSelected: (file: File) => void;
  onAnalyzePhoto: (includeNotes?: boolean) => Promise<void>;
  notes: string;
  setNotes: (notes: string) => void;
  analysisResult: MealAnalysisResponse | null;
  mealDescription: string;
  setMealDescription: (description: string) => void;
  onAnalyzeText: () => Promise<void>;
}

const CaptureTabs: React.FC<CaptureTabsProps> = ({
  activeTab,
  onTabChange,
  isMobile,
  isAnalyzing,
  selectedFile,
  previewUrl,
  onPhotoSelected,
  onAnalyzePhoto,
  notes,
  setNotes,
  analysisResult,
  mealDescription,
  setMealDescription,
  onAnalyzeText
}) => {
  return (
    <Tabs defaultValue="photo" value={activeTab} onValueChange={onTabChange} className="w-full">
      <TabsList className={cn("grid grid-cols-2 mb-6", isMobile && isAnalyzing ? "hidden" : "")}>
        <TabsTrigger value="photo">Photo</TabsTrigger>
        <TabsTrigger value="text">Text Description</TabsTrigger>
      </TabsList>
      
      <TabsContent value="photo" className="mt-0">
        <PhotoUploadSection 
          selectedFile={selectedFile}
          previewUrl={previewUrl}
          isAnalyzing={isAnalyzing}
          onPhotoSelected={onPhotoSelected}
          onAnalyze={onAnalyzePhoto}
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
          onAnalyze={onAnalyzeText}
          analysisResult={analysisResult}
        />
      </TabsContent>
    </Tabs>
  );
};

export default CaptureTabs;
