
import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Target } from "lucide-react";
import { useHealth } from "@/context/health";

const GoalCard: React.FC = () => {
  const { isHealthDataSet } = useHealth();

  return (
    <div className="glass-card rounded-2xl p-4 sm:p-6 border-border/30 backdrop-blur-md bg-card/50">
      <div className="flex items-center mb-3 sm:mb-4">
        <div className="bg-primary/10 p-2 sm:p-3 rounded-full mr-3 sm:mr-4">
          <Target className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
        </div>
        <h2 className="text-lg sm:text-xl font-semibold">
          {isHealthDataSet ? "Edit Your Goal" : "Set Your Goal"}
        </h2>
      </div>
      <p className="text-muted-foreground text-sm sm:text-base mb-3 sm:mb-4">
        {isHealthDataSet 
          ? "Update your health data and nutrition targets."
          : "Add your health information to get personalized nutrition targets."
        }
      </p>
      <Link 
        to="/profile#health" 
        className="flex items-center text-primary hover:underline text-sm sm:text-base"
      >
        {isHealthDataSet ? "Update goals" : "Get started"} <ChevronRight className="h-4 w-4 ml-1" />
      </Link>
    </div>
  );
};

export default GoalCard;
