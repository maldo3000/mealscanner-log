
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UserHealthData } from "@/types/health";

interface CurrentPlanDisplayProps {
  healthData: UserHealthData;
  onRecalculate: () => void;
}

const CurrentPlanDisplay: React.FC<CurrentPlanDisplayProps> = ({ healthData, onRecalculate }) => {
  if (!healthData.calorieTarget || !healthData.macroTarget) {
    return null;
  }

  return (
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
            onClick={onRecalculate}
            variant="outline"
            className="w-full"
          >
            Recalculate Targets
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CurrentPlanDisplay;
