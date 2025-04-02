
import React, { useMemo } from "react";
import { ChevronRight } from "lucide-react";
import { useHealth } from "@/context/health";
import { useMealJournal } from "@/context/mealJournal";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts";

const HealthTargetsCard: React.FC = () => {
  const { healthData, isHealthDataSet } = useHealth();
  const { meals } = useMealJournal();

  // Get today's meals
  const today = new Date();
  const todayString = format(today, "yyyy-MM-dd");
  
  const todaysMeals = useMemo(() => {
    return meals.filter(meal => {
      const mealDate = new Date(meal.timestamp || meal.createdAt);
      return format(mealDate, "yyyy-MM-dd") === todayString;
    });
  }, [meals, todayString]);

  // Calculate today's nutrition totals
  const todaysTotals = useMemo(() => {
    if (todaysMeals.length === 0) return { calories: 0, protein: 0, carbs: 0, fat: 0 };
    
    return todaysMeals.reduce((acc, meal) => {
      return {
        calories: acc.calories + (meal.nutrition.calories || 0),
        protein: acc.protein + (meal.nutrition.protein || 0),
        carbs: acc.carbs + (meal.nutrition.carbs || 0),
        fat: acc.fat + (meal.nutrition.fat || 0)
      };
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
  }, [todaysMeals]);

  // Calculate percentage of daily targets
  const targetPercentages = useMemo(() => {
    if (!isHealthDataSet) return { calories: 0, protein: 0, carbs: 0, fat: 0 };
    
    const { calorieTarget, macroTarget } = healthData;
    if (!calorieTarget || !macroTarget) return { calories: 0, protein: 0, carbs: 0, fat: 0 };
    
    return {
      calories: Math.min(Math.round((todaysTotals.calories / calorieTarget) * 100), 100),
      protein: Math.min(Math.round((todaysTotals.protein / macroTarget.protein) * 100), 100),
      carbs: Math.min(Math.round((todaysTotals.carbs / macroTarget.carbs) * 100), 100),
      fat: Math.min(Math.round((todaysTotals.fat / macroTarget.fat) * 100), 100)
    };
  }, [todaysTotals, healthData, isHealthDataSet]);

  // Data for the chart
  const chartData = useMemo(() => {
    if (!isHealthDataSet) return [];
    
    return [
      {
        name: "Protein",
        value: todaysTotals.protein,
        target: healthData.macroTarget?.protein || 0,
        percent: targetPercentages.protein
      },
      {
        name: "Carbs",
        value: todaysTotals.carbs,
        target: healthData.macroTarget?.carbs || 0,
        percent: targetPercentages.carbs
      },
      {
        name: "Fat",
        value: todaysTotals.fat,
        target: healthData.macroTarget?.fat || 0,
        percent: targetPercentages.fat
      }
    ];
  }, [todaysTotals, targetPercentages, healthData.macroTarget, isHealthDataSet]);

  if (!isHealthDataSet) {
    return null; // Don't show this card if health data is not set
  }

  return (
    <div className="glass-card rounded-xl p-4 sm:p-5 backdrop-blur-md bg-card/50 border-border/30 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg sm:text-xl font-semibold">Today's Nutrition</h2>
        <Link 
          to="/journal" 
          className="text-xs sm:text-sm text-primary hover:underline flex items-center"
        >
          View all meals <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 ml-1" />
        </Link>
      </div>

      <div className="space-y-4">
        {/* Calories progress */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Calories</span>
            <span className="text-sm text-muted-foreground">
              {todaysTotals.calories} / {healthData.calorieTarget} kcal
            </span>
          </div>
          <Progress value={targetPercentages.calories} className="h-2" />
        </div>

        {/* Macronutrients chart */}
        <div className="mt-4 pt-2 border-t border-border/30">
          <h3 className="text-sm font-medium mb-3">Macronutrients</h3>
          <div className="h-[150px] w-full">
            <ChartContainer 
              config={{
                protein: { color: "#8B5CF6" }, // purple
                carbs: { color: "#06b6d4" },   // cyan
                fat: { color: "#f97316" }      // orange
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis 
                    dataKey="name" 
                    tickLine={false}
                    axisLine={false}
                    fontSize={12}
                  />
                  <YAxis 
                    hide 
                    domain={[0, (dataMax: number) => {
                      // Set the max value to show a bit more than the highest target
                      const highestTarget = Math.max(
                        healthData.macroTarget?.protein || 0,
                        healthData.macroTarget?.carbs || 0,
                        healthData.macroTarget?.fat || 0
                      );
                      return Math.max(dataMax, highestTarget) * 1.1;
                    }]}
                  />
                  <Bar dataKey="value" fill="var(--color-protein)" name="protein" radius={[4, 4, 0, 0]} />
                  <ChartTooltip 
                    content={({ active, payload }) => {
                      if (!active || !payload || !payload.length) return null;
                      const data = payload[0].payload;
                      return (
                        <ChartTooltipContent>
                          <div className="flex flex-col gap-1 p-2">
                            <p className="text-sm font-medium">{data.name}</p>
                            <p className="text-xs">{data.value}g of {data.target}g</p>
                            <p className="text-xs">{data.percent}% of daily target</p>
                          </div>
                        </ChartTooltipContent>
                      );
                    }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </div>

        {/* Macronutrients table for smaller screens */}
        <div className="mt-2 sm:hidden">
          <Table>
            <TableBody>
              {chartData.map((macro) => (
                <TableRow key={macro.name}>
                  <TableCell className="py-2 px-0 font-medium">{macro.name}</TableCell>
                  <TableCell className="py-2 px-1 text-right text-sm">
                    {macro.value}g / {macro.target}g
                  </TableCell>
                  <TableCell className="py-2 px-0 text-right text-sm text-muted-foreground">
                    {macro.percent}%
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default HealthTargetsCard;
