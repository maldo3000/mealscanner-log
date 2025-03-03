
import React from "react";
import { Badge } from "@/components/ui/CustomBadge";
import { CalendarDays, Clock } from "lucide-react";
import { formatDate, formatTime, getMealTypeOptions } from "@/utils/helpers";
import { MealType } from "@/types";

interface MealInfoProps {
  title: string;
  mealType: MealType;
  createdAt: Date;
  description: string;
  isEditing: boolean;
  onTitleChange: (title: string) => void;
  onMealTypeChange: (type: MealType) => void;
}

const MealInfo: React.FC<MealInfoProps> = ({
  title,
  mealType,
  createdAt,
  description,
  isEditing,
  onTitleChange,
  onMealTypeChange,
}) => {
  const mealTypeOptions = getMealTypeOptions();

  return (
    <div className="glass-card rounded-2xl p-6">
      {isEditing ? (
        <div className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-1">
              Title
            </label>
            <textarea
              id="title"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-border bg-background resize-none overflow-hidden"
              rows={Math.max(1, Math.ceil(title.length / 30))}
              style={{ minHeight: "40px" }}
            />
          </div>
          
          <div>
            <label htmlFor="mealType" className="block text-sm font-medium mb-1">
              Meal Type
            </label>
            <select
              id="mealType"
              value={mealType}
              onChange={(e) => onMealTypeChange(e.target.value as MealType)}
              className="w-full px-4 py-2 rounded-lg border border-border bg-background"
            >
              {mealTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      ) : (
        <div>
          <h1 className="text-2xl font-bold mb-2 break-words">{title}</h1>
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mb-4">
            <Badge className="capitalize bg-primary/10 text-primary">{mealType}</Badge>
            <div className="flex items-center">
              <CalendarDays className="w-4 h-4 mr-1" />
              <span>{formatDate(createdAt)}</span>
            </div>
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              <span>{formatTime(createdAt)}</span>
            </div>
          </div>
          <p className="text-muted-foreground">{description}</p>
        </div>
      )}
    </div>
  );
};

export default MealInfo;
