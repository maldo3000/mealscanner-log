
import React, { useState, useEffect } from "react";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useHealth } from "@/context/health";
import { ActivityLevel, HealthGoal, MacroTarget, UserHealthData } from "@/types/health";

const healthFormSchema = z.object({
  height: z.coerce.number().min(30, "Height must be at least 30cm").max(300, "Height must be less than 300cm"),
  weight: z.coerce.number().min(20, "Weight must be at least 20kg").max(500, "Weight must be less than 500kg"),
  age: z.coerce.number().min(18, "Age must be at least 18").max(120, "Age must be less than 120"),
  gender: z.enum(["male", "female", "other"]),
  activityLevel: z.enum(["sedentary", "light", "moderate", "active", "very_active"]),
  goal: z.enum(["weight_loss", "maintenance", "muscle_gain"])
});

type HealthFormValues = z.infer<typeof healthFormSchema>;

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

const HealthSettingsForm: React.FC = () => {
  const { healthData, updateHealthData, calculateSuggestedTargets, saveTargets } = useHealth();
  const [suggesting, setSuggesting] = useState(false);
  const [suggested, setSuggested] = useState(false);
  const [suggestedTargets, setSuggestedTargets] = useState<{ calories: number, macros: MacroTarget } | null>(null);
  const [customTargets, setCustomTargets] = useState<{ calories: number, macros: MacroTarget } | null>(null);
  const [activeTab, setActiveTab] = useState("suggested");
  
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
    }
  }, [healthData, form]);

  const onSubmit = async (values: HealthFormValues) => {
    try {
      await updateHealthData(values);
      
      // Calculate suggested targets
      setSuggesting(true);
      setTimeout(() => { // Give a brief delay for better UX
        const targets = calculateSuggestedTargets({
          ...healthData,
          ...values
        });
        
        setSuggestedTargets(targets);
        setCustomTargets(targets); // Initialize custom with suggested
        setSuggested(true);
        setSuggesting(false);
      }, 1000);
    } catch (error) {
      console.error("Failed to update health data:", error);
    }
  };

  const handleCustomCaloriesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && customTargets) {
      setCustomTargets({
        ...customTargets,
        calories: value
      });
    }
  };

  const handleCustomMacrosChange = (macro: keyof MacroTarget, e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && customTargets) {
      setCustomTargets({
        ...customTargets,
        macros: {
          ...customTargets.macros,
          [macro]: value
        }
      });
    }
  };

  const handleAcceptPlan = async () => {
    if (!suggestedTargets) return;
    
    try {
      await saveTargets(
        suggestedTargets.calories,
        suggestedTargets.macros,
        activeTab === "custom"
      );
      
      setSuggested(false);
    } catch (error) {
      console.error("Failed to save targets:", error);
    }
  };

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

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Health Settings</h2>
      
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
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="height"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Height (cm)</FormLabel>
                      <FormControl>
                        <Input placeholder="175" type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="weight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Weight (kg)</FormLabel>
                      <FormControl>
                        <Input placeholder="70" type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
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
              </div>

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

              <Button type="submit" disabled={suggesting}>
                {suggesting ? "Calculating..." : "Calculate Recommendations"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Dialog for targets */}
      <Dialog open={suggested} onOpenChange={(open) => !open && setSuggested(false)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Your Nutrition Targets</DialogTitle>
            <DialogDescription>
              Based on your information, here are your recommended nutrition targets.
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="suggested" onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="suggested">Suggested Plan</TabsTrigger>
              <TabsTrigger value="custom">Custom Plan</TabsTrigger>
            </TabsList>
            <TabsContent value="suggested" className="pt-4">
              {suggestedTargets && (
                <div className="space-y-4">
                  <div className="text-center p-4 bg-primary/10 rounded-lg">
                    <h3 className="text-lg font-semibold">Daily Calorie Target</h3>
                    <p className="text-3xl font-bold text-primary">{suggestedTargets.calories} kcal</p>
                  </div>
                  
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Macronutrient</TableHead>
                        <TableHead className="text-right">Daily Target</TableHead>
                        <TableHead className="text-right">Calories</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">Protein</TableCell>
                        <TableCell className="text-right">{suggestedTargets.macros.protein}g</TableCell>
                        <TableCell className="text-right">{suggestedTargets.macros.protein * 4} kcal</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Carbs</TableCell>
                        <TableCell className="text-right">{suggestedTargets.macros.carbs}g</TableCell>
                        <TableCell className="text-right">{suggestedTargets.macros.carbs * 4} kcal</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Fat</TableCell>
                        <TableCell className="text-right">{suggestedTargets.macros.fat}g</TableCell>
                        <TableCell className="text-right">{suggestedTargets.macros.fat * 9} kcal</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                  
                  <Button onClick={handleAcceptPlan} className="w-full">Accept This Plan</Button>
                </div>
              )}
            </TabsContent>
            <TabsContent value="custom" className="pt-4">
              {customTargets && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium">Daily Calorie Target</label>
                    <Input 
                      type="number" 
                      value={customTargets.calories} 
                      onChange={handleCustomCaloriesChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium">Protein (g)</label>
                    <Input 
                      type="number" 
                      value={customTargets.macros.protein} 
                      onChange={(e) => handleCustomMacrosChange('protein', e)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium">Carbs (g)</label>
                    <Input 
                      type="number" 
                      value={customTargets.macros.carbs} 
                      onChange={(e) => handleCustomMacrosChange('carbs', e)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium">Fat (g)</label>
                    <Input 
                      type="number" 
                      value={customTargets.macros.fat} 
                      onChange={(e) => handleCustomMacrosChange('fat', e)}
                    />
                  </div>
                  
                  <Button onClick={handleAcceptPlan} className="w-full">Save Custom Plan</Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
      
      {/* Current Plan Display */}
      {healthData.calorieTarget && healthData.macroTarget && (
        <Card>
          <CardHeader>
            <CardTitle>Your Current Plan</CardTitle>
            <CardDescription>
              Your daily nutrition targets {healthData.isCustomPlan ? "(Custom Plan)" : "(Suggested Plan)"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center p-4 bg-primary/10 rounded-lg">
                <h3 className="text-lg font-semibold">Daily Calorie Target</h3>
                <p className="text-3xl font-bold text-primary">{healthData.calorieTarget} kcal</p>
              </div>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Macronutrient</TableHead>
                    <TableHead className="text-right">Daily Target</TableHead>
                    <TableHead className="text-right">Calories</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Protein</TableCell>
                    <TableCell className="text-right">{healthData.macroTarget.protein}g</TableCell>
                    <TableCell className="text-right">{healthData.macroTarget.protein * 4} kcal</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Carbs</TableCell>
                    <TableCell className="text-right">{healthData.macroTarget.carbs}g</TableCell>
                    <TableCell className="text-right">{healthData.macroTarget.carbs * 4} kcal</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Fat</TableCell>
                    <TableCell className="text-right">{healthData.macroTarget.fat}g</TableCell>
                    <TableCell className="text-right">{healthData.macroTarget.fat * 9} kcal</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
              
              <Button 
                onClick={() => form.handleSubmit(onSubmit)()}
                variant="outline"
                className="w-full"
              >
                Recalculate Targets
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default HealthSettingsForm;
