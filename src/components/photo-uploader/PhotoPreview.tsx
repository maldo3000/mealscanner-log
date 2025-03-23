
import React from "react";
import { X } from "lucide-react";

interface PhotoPreviewProps {
  previewUrl: string;
  onClear: () => void;
}

const PhotoPreview: React.FC<PhotoPreviewProps> = ({ previewUrl, onClear }) => {
  return (
    <div className="relative">
      <img 
        src={previewUrl} 
        alt="Photo preview" 
        className="w-full rounded-2xl animate-scale-in"
      />
      <button
        type="button"
        onClick={onClear}
        className="absolute top-3 right-3 p-2 bg-black/60 rounded-full text-white backdrop-blur-sm hover:bg-black/80 transition"
        aria-label="Remove photo"
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  );
};

export default PhotoPreview;
