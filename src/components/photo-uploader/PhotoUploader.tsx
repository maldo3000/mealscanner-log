import React, { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import UploadInterface from "./UploadInterface";
import CameraCapture from "./CameraCapture";
import PhotoPreview from "./PhotoPreview";
import { toast } from "./utils";

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
  const [isCapturing, setIsCapturing] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    handleFile(file);
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
  
  const startCamera = async () => {
    try {
      // Stop any ongoing capture session
      if (stream) {
        stopCamera();
      }
      
      console.log("Requesting camera access...");
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast.error("Camera access is not supported by your browser");
        return;
      }
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" },
        audio: false 
      });
      
      console.log("Camera access granted, setting up stream");
      setStream(mediaStream);
      setIsCapturing(true);
    } catch (error) {
      console.error("Camera access error:", error);
      toast.error("Could not access camera. Please check your camera permissions.");
    }
  };
  
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCapturing(false);
  };
  
  const clearPreview = () => {
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (stream) {
      stopCamera();
    }
  };

  return (
    <div className={cn("w-full", className)}>
      <div 
        className={cn(
          "relative w-full rounded-2xl overflow-hidden transition-all duration-300",
          "border-2 border-dashed border-border focus-within:border-primary",
          isDragging ? "border-primary bg-primary/5" : "",
          previewUrl ? "" : isCapturing ? "aspect-[3/4] h-[70vh] max-h-[800px]" : "aspect-[4/3]"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {previewUrl ? (
          <PhotoPreview 
            previewUrl={previewUrl} 
            onClear={clearPreview} 
          />
        ) : isCapturing ? (
          <CameraCapture 
            stream={stream} 
            onCapture={handleFile} 
            onCancel={stopCamera} 
          />
        ) : (
          <UploadInterface 
            onTriggerFileInput={triggerFileInput} 
            onStartCamera={startCamera} 
          />
        )}
        
        {/* File input for uploading images */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
      </div>
    </div>
  );
};

export default PhotoUploader;
