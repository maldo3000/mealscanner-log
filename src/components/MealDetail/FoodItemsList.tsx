
import React from "react";

interface FoodItemsListProps {
  foodItems: string[];
}

const FoodItemsList: React.FC<FoodItemsListProps> = ({ foodItems }) => {
  return (
    <div className="glass-card rounded-2xl p-6">
      <h2 className="text-lg font-medium mb-4">Food Items</h2>
      <ul className="space-y-2">
        {foodItems.map((item, index) => (
          <li key={index} className="flex items-start">
            <span className="w-2 h-2 mt-1.5 bg-primary rounded-full mr-2 flex-shrink-0"></span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FoodItemsList;
