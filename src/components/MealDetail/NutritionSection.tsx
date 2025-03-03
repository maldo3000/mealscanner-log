
import React from "react";
import NutritionChart from "@/components/NutritionChart";
import FoodItemsList from "./FoodItemsList";
import { NutritionInfo } from "@/types";

interface NutritionSectionProps {
  nutrition: NutritionInfo;
  foodItems: string[];
}

const NutritionSection: React.FC<NutritionSectionProps> = ({ nutrition, foodItems }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <FoodItemsList foodItems={foodItems} />
      <NutritionChart nutrition={nutrition} />
    </div>
  );
};

export default NutritionSection;
