import React, { useRef, useEffect } from "react";
import { Camera, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "./utils";

interface CameraCaptureProps {
  stream: MediaStream | null;
  onCapture: (file: File) => void;
  onCancel: () => void;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ 
  stream, 
  onCapture, 
  onCancel 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isMobile = useIsMobile();
  
  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(err => {
        console.error("Error playing video:", err);
        toast.error("Could not start camera preview");
      });
    }
  }, [stream]);
  
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) {
      console.error("Video or canvas ref is not available");
      return;
    }
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error("Could not get canvas context");
      return;
    }
    
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    canvas.toBlob((blob) => {
      if (!blob) {
        toast.error("Failed to capture image");
        return;
      }
      
      const file = new File([blob], "camera-photo.jpg", { type: "image/jpeg" });
      
      onCapture(file);
    }, "image/jpeg", 0.9);
  };
  
  return (
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
          onClick={onCancel}
          className="bg-black/70 text-white p-3 rounded-full"
          aria-label="Cancel"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default CameraCapture;
