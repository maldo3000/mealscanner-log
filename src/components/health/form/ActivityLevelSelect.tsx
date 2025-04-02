
import React from "react";
import { FormField, FormItem, FormControl, FormMessage, FormLabel, FormDescription } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { UseFormReturn } from "react-hook-form";
import { HealthFormValues } from "../HealthInformationForm";
import { ActivityLevel } from "@/types/health";

interface ActivityLevelSelectProps {
  form: UseFormReturn<HealthFormValues>;
}

const activityLevelOptions = [
  { value: "sedentary", label: "Sedentary (little or no exercise)" },
  { value: "light", label: "Light (exercise 1-3 times/week)" },
  { value: "moderate", label: "Moderate (exercise 3-5 times/week)" },
  { value: "active", label: "Active (exercise 6-7 times/week)" },
  { value: "very_active", label: "Very Active (intense exercise daily)" }
];

const activityLevelDescription = (level: ActivityLevel) => {
  switch (level) {
    case "sedentary": return "Little or no exercise";
    case "light": return "Light exercise 1-3 times/week";
    case "moderate": return "Moderate exercise 3-5 times/week";
    case "active": return "Daily or intense exercise 6-7 times/week";
    case "very_active": return "Very intense exercise daily or physical job";
    default: return "";
  }
};

const ActivityLevelSelect: React.FC<ActivityLevelSelectProps> = ({ form }) => {
  return (
    <FormField
      control={form.control}
      name="activityLevel"
      render={({ field }) => (
        <FormItem className="space-y-3">
          <FormLabel>Activity Level</FormLabel>
          <FormControl>
            <RadioGroup
              onValueChange={field.onChange}
              defaultValue={field.value}
              className="flex flex-col space-y-1"
            >
              {activityLevelOptions.map((option) => (
                <FormItem 
                  key={option.value} 
                  className="flex items-center space-x-3 space-y-0 rounded-md border p-3"
                >
                  <FormControl>
                    <RadioGroupItem value={option.value} />
                  </FormControl>
                  <div className="space-y-0.5">
                    <FormLabel className="font-medium">{option.label}</FormLabel>
                    <FormDescription className="text-xs">
                      {activityLevelDescription(option.value as ActivityLevel)}
                    </FormDescription>
                  </div>
                </FormItem>
              ))}
            </RadioGroup>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default ActivityLevelSelect;
