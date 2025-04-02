
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MacroTarget } from "@/types/health";

interface NutritionTargetsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  suggestedTargets: { calories: number; macros: MacroTarget } | null;
  customTargets: { calories: number; macros: MacroTarget } | null;
  setCustomTargets: React.Dispatch<React.SetStateAction<{ calories: number; macros: MacroTarget } | null>>;
  onAcceptPlan: () => Promise<void>;
  activeTab: string;
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
}

const NutritionTargetsDialog: React.FC<NutritionTargetsDialogProps> = ({
  open,
  onOpenChange,
  suggestedTargets,
  customTargets,
  setCustomTargets,
  onAcceptPlan,
  activeTab,
  setActiveTab
}) => {
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
                
                <Button onClick={onAcceptPlan} className="w-full">Accept This Plan</Button>
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
                
                <Button onClick={onAcceptPlan} className="w-full">Save Custom Plan</Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default NutritionTargetsDialog;
