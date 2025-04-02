
import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserHealthData, ActivityLevel, HealthGoal, MacroTarget } from '@/types/health';
import { useAuth } from '@/context/auth';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface HealthContextType {
  healthData: UserHealthData;
  isLoading: boolean;
  isHealthDataSet: boolean;
  updateHealthData: (data: Partial<UserHealthData>) => Promise<void>;
  calculateSuggestedTargets: (data: UserHealthData) => { calories: number; macros: MacroTarget };
  saveTargets: (calories: number, macros: MacroTarget, isCustom: boolean) => Promise<void>;
}

const HealthContext = createContext<HealthContextType | undefined>(undefined);

export const HealthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [healthData, setHealthData] = useState<UserHealthData>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Check if the essential health data is set
  const isHealthDataSet = Boolean(
    healthData.height && 
    healthData.weight && 
    healthData.age && 
    healthData.activityLevel && 
    healthData.goal && 
    healthData.calorieTarget && 
    healthData.macroTarget
  );

  // Load user health data
  useEffect(() => {
    if (user) {
      loadHealthData();
    } else {
      setHealthData({});
      setIsLoading(false);
    }
  }, [user]);

  const loadHealthData = async () => {
    setIsLoading(true);
    try {
      // First try to load from Supabase
      if (user) {
        const { data, error } = await supabase
          .from('user_health_data')
          .select('*')
          .eq('user_id', user.id)
          .single();
          
        if (data && !error) {
          // Data exists in Supabase, use it
          setHealthData(JSON.parse(data.health_data));
        } else {
          // Fall back to localStorage
          const savedData = localStorage.getItem(`health_data_${user.id}`);
          if (savedData) {
            const parsedData = JSON.parse(savedData);
            setHealthData(parsedData);
            
            // Also save to Supabase for future use
            await saveToSupabase(parsedData);
          }
        }
      }
    } catch (error) {
      console.error('Failed to load health data:', error);
      toast.error('Failed to load your health data');
    } finally {
      setIsLoading(false);
    }
  };

  const saveToSupabase = async (data: UserHealthData) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('user_health_data')
        .upsert(
          { 
            user_id: user.id, 
            health_data: JSON.stringify(data),
            updated_at: new Date().toISOString()
          },
          { onConflict: 'user_id' }
        );
        
      if (error) throw error;
    } catch (error) {
      console.error('Failed to save health data to Supabase:', error);
      // Don't show toast here as it's a background operation
    }
  };

  const updateHealthData = async (data: Partial<UserHealthData>) => {
    try {
      const updatedData = { ...healthData, ...data };
      setHealthData(updatedData);
      
      // Save to localStorage
      if (user) {
        localStorage.setItem(`health_data_${user.id}`, JSON.stringify(updatedData));
      }
      
      // Save to Supabase
      await saveToSupabase(updatedData);
      
      toast.success('Health data updated successfully');
    } catch (error) {
      console.error('Failed to update health data:', error);
      toast.error('Failed to update health data');
      throw error;
    }
  };

  // Calculate suggested calories and macros based on user data
  const calculateSuggestedTargets = (data: UserHealthData) => {
    const { height, weight, age, gender, activityLevel, goal } = data;
    
    if (!height || !weight || !age || !gender || !activityLevel || !goal) {
      return { calories: 0, macros: { protein: 0, carbs: 0, fat: 0 } };
    }

    // BMR calculation using Mifflin-St Jeor Equation
    let bmr = 0;
    if (gender === 'male') {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }

    // Activity multiplier
    const activityMultipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9
    };
    
    // TDEE (Total Daily Energy Expenditure)
    const tdee = bmr * activityMultipliers[activityLevel];
    
    // Adjust based on goal
    let calorieTarget = 0;
    switch (goal) {
      case 'weight_loss':
        calorieTarget = tdee * 0.8; // 20% deficit
        break;
      case 'maintenance':
        calorieTarget = tdee;
        break;
      case 'muscle_gain':
        calorieTarget = tdee * 1.1; // 10% surplus
        break;
      default:
        calorieTarget = tdee;
    }
    
    // Round calories to nearest 50
    calorieTarget = Math.round(calorieTarget / 50) * 50;
    
    // Calculate macros
    let protein = 0, carbs = 0, fat = 0;
    
    if (goal === 'weight_loss') {
      // Higher protein for weight loss
      protein = weight * 2.2; // 2.2g per kg of bodyweight
      fat = weight * 1; // 1g per kg of bodyweight
      // Remaining calories from carbs
      const proteinCalories = protein * 4;
      const fatCalories = fat * 9;
      carbs = (calorieTarget - proteinCalories - fatCalories) / 4;
    } else if (goal === 'muscle_gain') {
      // Higher protein and carbs for muscle gain
      protein = weight * 2; // 2g per kg of bodyweight
      fat = weight * 0.8; // 0.8g per kg of bodyweight
      // Remaining calories from carbs
      const proteinCalories = protein * 4;
      const fatCalories = fat * 9;
      carbs = (calorieTarget - proteinCalories - fatCalories) / 4;
    } else {
      // Balanced for maintenance
      protein = weight * 1.8; // 1.8g per kg of bodyweight
      fat = weight * 0.8; // 0.8g per kg of bodyweight
      // Remaining calories from carbs
      const proteinCalories = protein * 4;
      const fatCalories = fat * 9;
      carbs = (calorieTarget - proteinCalories - fatCalories) / 4;
    }
    
    // Round macros to the nearest whole number
    protein = Math.round(protein);
    carbs = Math.round(carbs);
    fat = Math.round(fat);
    
    return {
      calories: Math.round(calorieTarget),
      macros: { protein, carbs, fat }
    };
  };

  const saveTargets = async (calories: number, macros: MacroTarget, isCustom: boolean) => {
    try {
      const updatedData = { 
        ...healthData,
        calorieTarget: calories,
        macroTarget: macros,
        isCustomPlan: isCustom
      };
      
      setHealthData(updatedData);
      
      // Save to localStorage
      if (user) {
        localStorage.setItem(`health_data_${user.id}`, JSON.stringify(updatedData));
      }
      
      // Save to Supabase
      await saveToSupabase(updatedData);
      
      toast.success('Nutrition targets saved successfully');
    } catch (error) {
      console.error('Failed to save nutrition targets:', error);
      toast.error('Failed to save nutrition targets');
      throw error;
    }
  };

  return (
    <HealthContext.Provider 
      value={{ 
        healthData, 
        isLoading, 
        isHealthDataSet,
        updateHealthData, 
        calculateSuggestedTargets,
        saveTargets
      }}
    >
      {children}
    </HealthContext.Provider>
  );
};

export const useHealth = (): HealthContextType => {
  const context = useContext(HealthContext);
  if (context === undefined) {
    throw new Error('useHealth must be used within a HealthProvider');
  }
  return context;
};
