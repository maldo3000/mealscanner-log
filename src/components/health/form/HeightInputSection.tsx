
import React from "react";
import { FormField, FormItem, FormControl, FormMessage, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UnitToggle } from "@/components/health";
import { UseFormReturn } from "react-hook-form";
import { HealthFormValues } from "../HealthInformationForm";

interface HeightInputSectionProps {
  form: UseFormReturn<HealthFormValues>;
  heightUnit: "metric" | "imperial";
  feet: number;
  inches: number;
  handleHeightUnitChange: (value: "metric" | "imperial") => void;
  handleFeetChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleInchesChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const HeightInputSection: React.FC<HeightInputSectionProps> = ({
  form,
  heightUnit,
  feet,
  inches,
  handleHeightUnitChange,
  handleFeetChange,
  handleInchesChange
}) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <FormLabel className="text-base">Height</FormLabel>
        <UnitToggle 
          metricUnit="cm" 
          imperialUnit="ft/in" 
          value={heightUnit} 
          onChange={handleHeightUnitChange}
          className="w-40"
        />
      </div>
      
      {heightUnit === "metric" ? (
        <FormField
          control={form.control}
          name="height"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input placeholder="175" type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      ) : (
        <div className="grid grid-cols-2 gap-2">
          <div>
            <FormLabel>Feet</FormLabel>
            <Input 
              type="number" 
              value={feet} 
              onChange={handleFeetChange}
              min={0}
              max={8}
            />
          </div>
          <div>
            <FormLabel>Inches</FormLabel>
            <Input 
              type="number" 
              value={inches} 
              onChange={handleInchesChange}
              min={0}
              max={11}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default HeightInputSection;
