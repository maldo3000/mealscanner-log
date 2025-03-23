
import React from "react";
import PhotoUploader from "@/components/PhotoUploader";
import { Plus } from "lucide-react";
import { MealAnalysisResponse } from "@/types";

interface PhotoUploadSectionProps {
  selectedFile: File | null;
  previewUrl: string | null;
  isAnalyzing: boolean;
  analysisResult: MealAnalysisResponse | null;
  onPhotoSelected: (file: File) => void;
  onAnalyze: (includeNotes?: boolean) => Promise<void>;
}

const PhotoUploadSection: React.FC<PhotoUploadSectionProps> = ({
  selectedFile,
  previewUrl,
  isAnalyzing,
  analysisResult,
  onPhotoSelected,
  onAnalyze
}) => {
  return (
    <>
      <PhotoUploader onPhotoSelected={onPhotoSelected} />
      
      {selectedFile && !isAnalyzing && !analysisResult && (
        <div className="flex justify-center mt-6">
          <button
            onClick={() => onAnalyze(false)}
            className="bg-primary text-white py-2 px-6 rounded-full font-medium flex items-center"
          >
            <Plus className="h-4 w-4 mr-1" />
            Analyze with AI
          </button>
        </div>
      )}
    </>
  );
};

export default PhotoUploadSection;
