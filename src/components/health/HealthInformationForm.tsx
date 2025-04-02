
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ActivityLevel, HealthGoal, UserHealthData } from "@/types/health";
import UnitToggle from "./UnitToggle";

const healthFormSchema = z.object({
  height: z.coerce.number().min(30, "Height must be at least 30cm").max(300, "Height must be less than 300cm"),
  weight: z.coerce.number().min(20, "Weight must be at least 20kg").max(500, "Weight must be less than 500kg"),
  age: z.coerce.number().min(18, "Age must be at least 18").max(120, "Age must be less than 120"),
  gender: z.enum(["male", "female", "other"]),
  activityLevel: z.enum(["sedentary", "light", "moderate", "active", "very_active"]),
  goal: z.enum(["weight_loss", "maintenance", "muscle_gain"])
});

export type HealthFormValues = z.infer<typeof healthFormSchema>;

const activityLevelOptions = [
  { value: "sedentary", label: "Sedentary (little or no exercise)" },
  { value: "light", label: "Light (exercise 1-3 times/week)" },
  { value: "moderate", label: "Moderate (exercise 3-5 times/week)" },
  { value: "active", label: "Active (exercise 6-7 times/week)" },
  { value: "very_active", label: "Very Active (intense exercise daily)" }
];

const goalOptions = [
  { value: "weight_loss", label: "Weight Loss" },
  { value: "maintenance", label: "Maintenance" },
  { value: "muscle_gain", label: "Muscle Gain" }
];

interface HealthInformationFormProps {
  healthData: UserHealthData;
  onSubmit: (values: HealthFormValues) => Promise<void>;
  isCalculating: boolean;
}

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

const goalDescription = (goal: HealthGoal) => {
  switch (goal) {
    case "weight_loss": return "Calorie deficit for gradual weight loss";
    case "maintenance": return "Balanced intake to maintain current weight";
    case "muscle_gain": return "Calorie surplus to support muscle growth";
    default: return "";
  }
};

const HealthInformationForm: React.FC<HealthInformationFormProps> = ({ 
  healthData, 
  onSubmit,
  isCalculating
}) => {
  const [heightUnit, setHeightUnit] = useState<"metric" | "imperial">("metric");
  const [weightUnit, setWeightUnit] = useState<"metric" | "imperial">("metric");
  const [feet, setFeet] = useState<number>(0);
  const [inches, setInches] = useState<number>(0);
  const [pounds, setPounds] = useState<number>(0);

  const form = useForm<HealthFormValues>({
    resolver: zodResolver(healthFormSchema),
    defaultValues: {
      height: healthData.height || undefined,
      weight: healthData.weight || undefined,
      age: healthData.age || undefined,
      gender: healthData.gender || "male",
      activityLevel: healthData.activityLevel || "moderate",
      goal: healthData.goal || "maintenance"
    }
  });

  // When healthData changes, update form
  useEffect(() => {
    if (healthData) {
      form.reset({
        height: healthData.height,
        weight: healthData.weight,
        age: healthData.age,
        gender: healthData.gender || "male",
        activityLevel: healthData.activityLevel || "moderate",
        goal: healthData.goal || "maintenance"
      });

      // Convert metric values to imperial for display
      if (healthData.height) {
        const totalInches = healthData.height / 2.54;
        setFeet(Math.floor(totalInches / 12));
        setInches(Math.round(totalInches % 12));
      }

      if (healthData.weight) {
        setPounds(Math.round(healthData.weight * 2.20462));
      }
    }
  }, [healthData, form]);

  // Handle height unit change
  const handleHeightUnitChange = (value: "metric" | "imperial") => {
    setHeightUnit(value);
    
    if (value === "imperial" && form.getValues('height')) {
      // Convert cm to feet and inches
      const totalInches = form.getValues('height') / 2.54;
      setFeet(Math.floor(totalInches / 12));
      setInches(Math.round(totalInches % 12));
    } else if (value === "metric" && feet && inches) {
      // Convert feet and inches to cm
      const totalInches = feet * 12 + inches;
      const cm = Math.round(totalInches * 2.54);
      form.setValue('height', cm);
    }
  };

  // Handle weight unit change
  const handleWeightUnitChange = (value: "metric" | "imperial") => {
    setWeightUnit(value);
    
    if (value === "imperial" && form.getValues('weight')) {
      // Convert kg to lbs
      setPounds(Math.round(form.getValues('weight') * 2.20462));
    } else if (value === "metric" && pounds) {
      // Convert lbs to kg
      const kg = Math.round(pounds / 2.20462);
      form.setValue('weight', kg);
    }
  };

  // Handle feet/inches change
  const handleFeetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFeet = parseInt(e.target.value) || 0;
    setFeet(newFeet);
    const totalInches = newFeet * 12 + inches;
    const cm = Math.round(totalInches * 2.54);
    form.setValue('height', cm);
  };

  const handleInchesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newInches = parseInt(e.target.value) || 0;
    setInches(newInches);
    const totalInches = feet * 12 + newInches;
    const cm = Math.round(totalInches * 2.54);
    form.setValue('height', cm);
  };

  // Handle pounds change
  const handlePoundsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPounds = parseInt(e.target.value) || 0;
    setPounds(newPounds);
    const kg = Math.round(newPounds / 2.20462);
    form.setValue('weight', kg);
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Your Information</CardTitle>
        <CardDescription>
          Provide your details to get personalized nutrition recommendations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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

            <Button type="submit" disabled={isCalculating}>
              {isCalculating ? "Calculating..." : "Calculate Recommendations"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default HealthInformationForm;
