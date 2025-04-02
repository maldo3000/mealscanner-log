
import React from "react";
import { FormField, FormItem, FormControl, FormMessage, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UnitToggle } from "@/components/health";
import { UseFormReturn } from "react-hook-form";
import { HealthFormValues } from "../HealthInformationForm";

interface WeightInputSectionProps {
  form: UseFormReturn<HealthFormValues>;
  weightUnit: "metric" | "imperial";
  pounds: number;
  handleWeightUnitChange: (value: "metric" | "imperial") => void;
  handlePoundsChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const WeightInputSection: React.FC<WeightInputSectionProps> = ({
  form,
  weightUnit,
  pounds,
  handleWeightUnitChange,
  handlePoundsChange
}) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <FormLabel className="text-base">Weight</FormLabel>
        <UnitToggle 
          metricUnit="kg" 
          imperialUnit="lbs" 
          value={weightUnit} 
          onChange={handleWeightUnitChange}
          className="w-40"
        />
      </div>
      
      {weightUnit === "metric" ? (
        <FormField
          control={form.control}
          name="weight"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input placeholder="70" type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      ) : (
        <div>
          <Input 
            type="number" 
            value={pounds} 
            onChange={handlePoundsChange}
            min={0}
            max={1000}
          />
        </div>
      )}
    </div>
  );
};

export default WeightInputSection;
