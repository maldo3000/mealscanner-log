import React, { useState, useRef, useEffect } from "react";
import { Camera, Upload, X, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const isMobile = useIsMobile();

  // Effect to handle video initialization when stream is set
  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(err => {
        console.error("Error playing video:", err);
        toast.error("Could not start camera preview");
      });
    }
  }, [stream]);

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
      
      // For mobile, explicitly request portrait orientation
      const constraints = isMobile 
        ? { 
            video: { 
              facingMode: "environment",
              aspectRatio: 3/4 // Portrait aspect ratio (height > width)
            },
            audio: false 
          }
        : { 
            video: { facingMode: "environment" },
            audio: false 
          };
      
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      
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
  
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) {
      console.error("Video or canvas ref is not available");
      return;
    }
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw the current video frame to the canvas
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error("Could not get canvas context");
      return;
    }
    
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert canvas to file
    canvas.toBlob((blob) => {
      if (!blob) {
        toast.error("Failed to capture image");
        return;
      }
      
      // Convert blob to File
      const file = new File([blob], "camera-photo.jpg", { type: "image/jpeg" });
      
      // Process the captured photo
      handleFile(file);
      
      // Stop the camera stream
      stopCamera();
    }, "image/jpeg", 0.9);
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
          previewUrl ? "" : isCapturing 
            ? isMobile 
              ? "aspect-[3/4] h-[70vh] max-h-[800px]" // Portrait and taller on mobile
              : "aspect-[4/3]" 
            : "aspect-[4/3]",
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
        ) : isCapturing ? (
          <div className="relative w-full h-full">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={cn(
                "object-cover rounded-2xl",
                isMobile ? "w-full h-full" : "w-full h-full"
              )}
            />
            <div className={cn(
              "absolute inset-x-0 flex justify-center space-x-4",
              isMobile ? "bottom-10" : "bottom-4"
            )}>
              <button 
                onClick={capturePhoto}
                className="bg-primary text-white p-4 rounded-full"
                aria-label="Take photo"
              >
                <Camera className="h-6 w-6" />
              </button>
              <button 
                onClick={stopCamera}
                className="bg-black/70 text-white p-3 rounded-full"
                aria-label="Cancel"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
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
                    startCamera();
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
        
        {/* Canvas for capturing camera screenshots */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
};

export default PhotoUploader;
