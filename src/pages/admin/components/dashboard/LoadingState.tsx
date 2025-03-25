
import React from 'react';

const LoadingState: React.FC = () => {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 w-64 bg-gray-200 rounded"></div>
      <div className="h-4 w-full max-w-md bg-gray-200 rounded"></div>
      <div className="h-40 w-full max-w-md bg-gray-200 rounded"></div>
    </div>
  );
};

export default LoadingState;
