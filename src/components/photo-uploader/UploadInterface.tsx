
import React from "react";
import { Camera, Upload } from "lucide-react";

interface UploadInterfaceProps {
  onTriggerFileInput: () => void;
  onStartCamera: () => void;
}

const UploadInterface: React.FC<UploadInterfaceProps> = ({ 
  onTriggerFileInput,
  onStartCamera
}) => {
  return (
    <div 
      className="w-full h-full flex flex-col items-center justify-center p-8 cursor-pointer"
      onClick={onTriggerFileInput}
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
              onStartCamera();
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
              onTriggerFileInput();
            }}
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadInterface;
