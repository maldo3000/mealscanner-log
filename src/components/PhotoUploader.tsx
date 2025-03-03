
import React, { useState, useRef } from "react";
import { Camera, Upload, X, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface PhotoUploaderProps {
  onPhotoSelected: (file: File) => void;
  className?: string;
}

const PhotoUploader: React.FC<PhotoUploaderProps> = ({ 
  onPhotoSelected,
  className
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    handleFile(file);
  };

  const handleFile = (file?: File) => {
    if (!file) return;

    // Check if file is an image
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image size should be less than 10MB");
      return;
    }

    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    onPhotoSelected(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    handleFile(file);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };
  
  const triggerCameraInput = () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      toast.error("Camera access is not supported by your browser");
      return;
    }
    
    try {
      cameraInputRef.current?.click();
    } catch (error) {
      console.error("Camera access error:", error);
      toast.error("Could not access camera");
    }
  };

  const clearPreview = () => {
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  return (
    <div className={cn("w-full", className)}>
      <div 
        className={cn(
          "relative w-full rounded-2xl overflow-hidden transition-all duration-300",
          "border-2 border-dashed border-border focus-within:border-primary",
          isDragging ? "border-primary bg-primary/5" : "",
          previewUrl ? "" : "aspect-[4/3]",
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {previewUrl ? (
          <div className="relative">
            <img 
              src={previewUrl} 
              alt="Photo preview" 
              className="w-full rounded-2xl animate-scale-in"
            />
            <button
              type="button"
              onClick={clearPreview}
              className="absolute top-3 right-3 p-2 bg-black/60 rounded-full text-white backdrop-blur-sm hover:bg-black/80 transition"
              aria-label="Remove photo"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        ) : (
          <div 
            className="w-full h-full flex flex-col items-center justify-center p-8 cursor-pointer"
            onClick={triggerFileInput}
          >
            <div className="p-4 rounded-full bg-secondary mb-4">
              <Camera className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="text-center">
              <p className="text-lg font-medium mb-1">Add a meal photo</p>
              <p className="text-sm text-muted-foreground mb-4">
                Take a photo or drag and drop an image
              </p>
              
              <div className="flex gap-4 justify-center">
                <button 
                  type="button"
                  className="glass-button rounded-full py-2 px-4 text-sm font-medium flex items-center"
                  onClick={(e) => {
                    e.stopPropagation();
                    triggerCameraInput();
                  }}
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Take photo
                </button>
                <button 
                  type="button"
                  className="glass-button rounded-full py-2 px-4 text-sm font-medium flex items-center"
                  onClick={(e) => {
                    e.stopPropagation();
                    triggerFileInput();
                  }}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* File input for uploading images */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
        
        {/* Camera input for taking photos */}
        <input
          type="file"
          ref={cameraInputRef}
          onChange={handleFileChange}
          accept="image/*"
          capture="environment"
          className="hidden"
        />
      </div>
    </div>
  );
};

export default PhotoUploader;
