
import React from "react";
import { RefreshCw } from "lucide-react";

interface AnalysisErrorProps {
  error: string;
  onRetry: () => void;
}

const AnalysisError: React.FC<AnalysisErrorProps> = ({ error, onRetry }) => {
  return (
    <div className="glass-card rounded-2xl p-6 border border-red-200 bg-red-50 dark:bg-red-900/10">
      <h3 className="text-lg font-medium mb-2 text-red-600 dark:text-red-400">Analysis Failed</h3>
      <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
      <button
        onClick={onRetry}
        className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 py-2 px-4 rounded-lg font-medium flex items-center mx-auto"
      >
        <RefreshCw className="h-4 w-4 mr-1" />
        Try Again
      </button>
    </div>
  );
};

export default AnalysisError;
