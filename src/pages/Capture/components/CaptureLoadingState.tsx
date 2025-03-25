
import React from "react";

const CaptureLoadingState: React.FC = () => {
  return (
    <div className="flex justify-center items-center h-[50vh]">
      <div className="animate-pulse flex flex-col items-center">
        <div className="h-8 w-32 bg-gray-200 rounded mb-4"></div>
        <div className="h-4 w-64 bg-gray-200 rounded"></div>
      </div>
    </div>
  );
};

export default CaptureLoadingState;
