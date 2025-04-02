
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ActivityLevel, HealthGoal, UserHealthData } from "@/types/health";
import {
  HeightInputSection,
  WeightInputSection,
  AgeInput,
  GenderSelect,
  ActivityLevelSelect,
  GoalSelect,
  SubmitButton
} from "./form";

const healthFormSchema = z.object({
  height: z.coerce.number().min(30, "Height must be at least 30cm").max(300, "Height must be less than 300cm"),
  weight: z.coerce.number().min(20, "Weight must be at least 20kg").max(500, "Weight must be less than 500kg"),
  age: z.coerce.number().min(18, "Age must be at least 18").max(120, "Age must be less than 120"),
  gender: z.enum(["male", "female", "other"]),
  activityLevel: z.enum(["sedentary", "light", "moderate", "active", "very_active"]),
  goal: z.enum(["weight_loss", "maintenance", "muscle_gain"])
});

export type HealthFormValues = z.infer<typeof healthFormSchema>;

interface HealthInformationFormProps {
  healthData: UserHealthData;
  onSubmit: (values: HealthFormValues) => Promise<void>;
  isCalculating: boolean;
}

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
            <HeightInputSection 
              form={form}
              heightUnit={heightUnit}
              feet={feet}
              inches={inches}
              handleHeightUnitChange={handleHeightUnitChange}
              handleFeetChange={handleFeetChange}
              handleInchesChange={handleInchesChange}
            />

            <WeightInputSection 
              form={form}
              weightUnit={weightUnit}
              pounds={pounds}
              handleWeightUnitChange={handleWeightUnitChange}
              handlePoundsChange={handlePoundsChange}
            />

            <AgeInput form={form} />
            
            <GenderSelect form={form} />
            
            <ActivityLevelSelect form={form} />
            
            <GoalSelect form={form} />

            <SubmitButton isCalculating={isCalculating} />
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default HealthInformationForm;
