
import React from "react";
import PhotoUploader from "@/components/photo-uploader";
import { Plus } from "lucide-react";
import { MealAnalysisResponse } from "@/types";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface PhotoUploadSectionProps {
  selectedFile: File | null;
  previewUrl: string | null;
  isAnalyzing: boolean;
  analysisResult: MealAnalysisResponse | null;
  notes: string;
  setNotes: (notes: string) => void;
  onPhotoSelected: (file: File) => void;
  onAnalyze: (includeNotes?: boolean) => Promise<void>;
}

const PhotoUploadSection: React.FC<PhotoUploadSectionProps> = ({
  selectedFile,
  previewUrl,
  isAnalyzing,
  analysisResult,
  notes,
  setNotes,
  onPhotoSelected,
  onAnalyze
}) => {
  return (
    <>
      <PhotoUploader onPhotoSelected={onPhotoSelected} />
      
      {selectedFile && !isAnalyzing && !analysisResult && (
        <div className="mt-6 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="photo-notes" className="text-sm font-medium">
              Additional Details (Optional)
            </Label>
            <Textarea
              id="photo-notes"
              placeholder="Add any details about your meal to improve AI analysis (e.g., portion sizes, ingredients, cooking methods)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[100px]"
            />
            <p className="text-xs text-muted-foreground">
              Adding details helps the AI make more accurate nutritional estimates
            </p>
          </div>
          
          <div className="flex justify-center">
            <button
              onClick={() => onAnalyze(true)}
              className="bg-primary text-white py-2 px-6 rounded-full font-medium flex items-center"
            >
              <Plus className="h-4 w-4 mr-1" />
              Analyze with AI
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default PhotoUploadSection;
