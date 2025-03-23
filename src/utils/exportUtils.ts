
import { MealEntry } from "@/types";

/**
 * Converts meal entries to CSV format
 */
export const convertMealsToCSV = (meals: MealEntry[]): string => {
  // Define CSV headers
  const headers = [
    "Date", 
    "Time", 
    "Title", 
    "Meal Type", 
    "Description", 
    "Food Items", 
    "Calories", 
    "Protein (g)", 
    "Fat (g)", 
    "Carbs (g)", 
    "Nutrition Score", 
    "Notes"
  ];
  
  // Create CSV header row
  let csvContent = headers.join(",") + "\n";
  
  // Add meal data rows
  meals.forEach(meal => {
    const date = new Date(meal.createdAt).toLocaleDateString();
    const time = new Date(meal.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Prepare each column, properly escaped for CSV format
    const row = [
      escapeCsvValue(date),
      escapeCsvValue(time),
      escapeCsvValue(meal.title),
      escapeCsvValue(meal.mealType),
      escapeCsvValue(meal.description),
      escapeCsvValue(meal.foodItems.join("; ")), // Join array items with semicolons
      escapeCsvValue(meal.nutrition.calories.toString()),
      escapeCsvValue(meal.nutrition.protein.toString()),
      escapeCsvValue(meal.nutrition.fat.toString()),
      escapeCsvValue(meal.nutrition.carbs.toString()),
      escapeCsvValue(meal.nutritionScore),
      escapeCsvValue(meal.notes || "")
    ];
    
    csvContent += row.join(",") + "\n";
  });
  
  return csvContent;
};

/**
 * Escapes a value for CSV format by:
 * 1. Wrapping in quotes if it contains commas, quotes, or newlines
 * 2. Doubling any quotes inside the value
 */
const escapeCsvValue = (value: string): string => {
  // Return empty string in quotes if null or undefined
  if (value === null || value === undefined) {
    return '""';
  }
  
  const stringValue = String(value);
  
  // Check if we need to quote this value
  const needsQuotes = stringValue.includes(',') || 
                      stringValue.includes('"') || 
                      stringValue.includes('\n') ||
                      stringValue.includes('\r');
  
  if (needsQuotes) {
    // Double any quotes and wrap in quotes
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  
  return stringValue;
};

/**
 * Triggers a download of the provided content as a CSV file
 */
export const downloadCSV = (csvContent: string, filename: string): void => {
  // Create a blob with the CSV content
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  
  // Create a download link
  const link = document.createElement('a');
  
  // Set up the download link
  if (navigator.msSaveBlob) { // For IE 10+
    navigator.msSaveBlob(blob, filename);
  } else {
    // For modern browsers
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);
  }
};
