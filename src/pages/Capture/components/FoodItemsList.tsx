
import React from "react";

interface FoodItemsListProps {
  foodItems: string[];
}

const FoodItemsList: React.FC<FoodItemsListProps> = ({ foodItems }) => {
  return (
    <div className="glass-card rounded-2xl p-6">
      <h3 className="text-lg font-medium mb-4">Food Identified</h3>
      <ul className="space-y-2">
        {foodItems.map((item, index) => (
          <li key={index} className="flex items-center">
            <span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FoodItemsList;
