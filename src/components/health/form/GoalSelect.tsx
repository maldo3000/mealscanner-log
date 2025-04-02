
import React from "react";
import { FormField, FormItem, FormControl, FormMessage, FormLabel, FormDescription } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { UseFormReturn } from "react-hook-form";
import { HealthFormValues } from "../HealthInformationForm";
import { HealthGoal } from "@/types/health";

interface GoalSelectProps {
  form: UseFormReturn<HealthFormValues>;
}

const goalOptions = [
  { value: "weight_loss", label: "Weight Loss" },
  { value: "maintenance", label: "Maintenance" },
  { value: "muscle_gain", label: "Muscle Gain" }
];

const goalDescription = (goal: HealthGoal) => {
  switch (goal) {
    case "weight_loss": return "Calorie deficit for gradual weight loss";
    case "maintenance": return "Balanced intake to maintain current weight";
    case "muscle_gain": return "Calorie surplus to support muscle growth";
    default: return "";
  }
};

const GoalSelect: React.FC<GoalSelectProps> = ({ form }) => {
  return (
    <FormField
      control={form.control}
      name="goal"
      render={({ field }) => (
        <FormItem className="space-y-3">
          <FormLabel>Goal</FormLabel>
          <FormControl>
            <RadioGroup
              onValueChange={field.onChange}
              defaultValue={field.value}
              className="flex flex-col space-y-1"
            >
              {goalOptions.map((option) => (
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
                      {goalDescription(option.value as HealthGoal)}
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

export default GoalSelect;
