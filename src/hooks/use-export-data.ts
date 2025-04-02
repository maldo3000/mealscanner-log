
import { useState } from 'react';
import { MealEntry } from '@/types';
import { convertMealsToCSV, downloadCSV } from '@/utils/exportUtils';
import { toast } from 'sonner';

export const useExportData = (meals: MealEntry[]) => {
  const [isExporting, setIsExporting] = useState(false);
  
  const handleExportData = async () => {
    if (isExporting) return;
    
    try {
      setIsExporting(true);
      
      // Generate timestamp for filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `meal-journal-export-${timestamp}.csv`;
      
      // Convert meals to CSV format
      const csvContent = convertMealsToCSV(meals);
      
      // Trigger the download
      downloadCSV(csvContent, filename);
      
      toast.success('Export completed successfully');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export data');
    } finally {
      setIsExporting(false);
    }
  };
  
  return {
    isExporting,
    handleExportData
  };
};
