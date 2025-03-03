
import React from "react";
import { NutritionInfo } from "@/types";
import { PieChart, Pie, Cell, ResponsiveContainer, Label } from "recharts";

interface NutritionChartProps {
  nutrition: NutritionInfo;
  className?: string;
}

const NutritionChart: React.FC<NutritionChartProps> = ({ nutrition, className }) => {
  const { protein, fat, carbs } = nutrition;
  
  // Calculate total macronutrients
  const total = protein + fat + carbs;
  
  // Prepare data for the pie chart
  const data = [
    { name: "Protein", value: protein, color: "#4ade80" },
    { name: "Fat", value: fat, color: "#fb923c" },
    { name: "Carbs", value: carbs, color: "#60a5fa" },
  ];

  // Calculate percentages
  const proteinPercent = Math.round((protein / total) * 100) || 0;
  const fatPercent = Math.round((fat / total) * 100) || 0;
  const carbsPercent = Math.round((carbs / total) * 100) || 0;

  return (
    <div className={className}>
      <div className="bg-white dark:bg-black/20 rounded-2xl p-4 shadow-sm border border-border">
        <h4 className="font-medium text-center mb-2">Nutrition Breakdown</h4>
        
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
                <Label
                  value={`${nutrition.calories}`}
                  position="center"
                  className="text-xl font-medium"
                  fill="#888888"
                />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="grid grid-cols-3 gap-2 mt-2">
          <div className="flex flex-col items-center">
            <span className="text-xs text-muted-foreground">Protein</span>
            <div className="flex items-baseline">
              <span className="text-sm font-medium">{protein}g</span>
              <span className="text-xs text-muted-foreground ml-1">({proteinPercent}%)</span>
            </div>
            <div className="w-3 h-3 rounded-full bg-green-400 mt-1"></div>
          </div>
          
          <div className="flex flex-col items-center">
            <span className="text-xs text-muted-foreground">Fat</span>
            <div className="flex items-baseline">
              <span className="text-sm font-medium">{fat}g</span>
              <span className="text-xs text-muted-foreground ml-1">({fatPercent}%)</span>
            </div>
            <div className="w-3 h-3 rounded-full bg-orange-400 mt-1"></div>
          </div>
          
          <div className="flex flex-col items-center">
            <span className="text-xs text-muted-foreground">Carbs</span>
            <div className="flex items-baseline">
              <span className="text-sm font-medium">{carbs}g</span>
              <span className="text-xs text-muted-foreground ml-1">({carbsPercent}%)</span>
            </div>
            <div className="w-3 h-3 rounded-full bg-blue-400 mt-1"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NutritionChart;
