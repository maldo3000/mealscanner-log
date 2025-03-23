
import React from "react";
import LoadingSpinner from "@/components/LoadingSpinner";

const AnalysisInProgress: React.FC = () => {
  return (
    <div className="glass-card rounded-2xl p-8 text-center">
      <LoadingSpinner className="mb-4" />
      <h3 className="text-lg font-medium mb-2">Analyzing your meal...</h3>
      <p className="text-muted-foreground">
        Our AI is identifying food items and calculating nutrition data
      </p>
    </div>
  );
};

export default AnalysisInProgress;
