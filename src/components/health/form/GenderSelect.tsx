
import React from "react";
import { FormField, FormItem, FormControl, FormMessage, FormLabel } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { HealthFormValues } from "../HealthInformationForm";

interface GenderSelectProps {
  form: UseFormReturn<HealthFormValues>;
}

const GenderSelect: React.FC<GenderSelectProps> = ({ form }) => {
  return (
    <FormField
      control={form.control}
      name="gender"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Gender</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default GenderSelect;
