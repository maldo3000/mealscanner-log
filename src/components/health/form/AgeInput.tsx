
import React from "react";
import { FormField, FormItem, FormControl, FormMessage, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { HealthFormValues } from "../HealthInformationForm";

interface AgeInputProps {
  form: UseFormReturn<HealthFormValues>;
}

const AgeInput: React.FC<AgeInputProps> = ({ form }) => {
  return (
    <FormField
      control={form.control}
      name="age"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Age</FormLabel>
          <FormControl>
            <Input placeholder="30" type="number" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default AgeInput;
