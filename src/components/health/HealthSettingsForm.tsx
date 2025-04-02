
import React, { useState } from "react";
import { useHealth } from "@/context/health";
import { HealthFormValues, default as HealthInformationForm } from "./HealthInformationForm";
import NutritionTargetsDialog from "./NutritionTargetsDialog";
import CurrentPlanDisplay from "./CurrentPlanDisplay";
import { MacroTarget } from "@/types/health";

const HealthSettingsForm: React.FC = () => {
  const { healthData, updateHealthData, calculateSuggestedTargets, saveTargets } = useHealth();
  const [suggesting, setSuggesting] = useState(false);
  const [suggested, setSuggested] = useState(false);
  const [suggestedTargets, setSuggestedTargets] = useState<{ calories: number, macros: MacroTarget } | null>(null);
  const [customTargets, setCustomTargets] = useState<{ calories: number, macros: MacroTarget } | null>(null);
  const [activeTab, setActiveTab] = useState("suggested");
  
  const handleSubmit = async (values: HealthFormValues) => {
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

  const handleAcceptPlan = async () => {
    if (!suggestedTargets) return;
    
    try {
      await saveTargets(
        activeTab === "custom" ? customTargets!.calories : suggestedTargets.calories,
        activeTab === "custom" ? customTargets!.macros : suggestedTargets.macros,
        activeTab === "custom"
      );
      
      setSuggested(false);
    } catch (error) {
      console.error("Failed to save targets:", error);
    }
  };

  const handleRecalculate = () => {
    const form = document.querySelector('form');
    if (form) {
      form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Health Settings</h2>
      
      <HealthInformationForm 
        healthData={healthData}
        onSubmit={handleSubmit}
        isCalculating={suggesting}
      />

      <NutritionTargetsDialog
        open={suggested}
        onOpenChange={(open) => !open && setSuggested(false)}
        suggestedTargets={suggestedTargets}
        customTargets={customTargets}
        setCustomTargets={setCustomTargets}
        onAcceptPlan={handleAcceptPlan}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
      
      <CurrentPlanDisplay 
        healthData={healthData} 
        onRecalculate={handleRecalculate} 
      />
    </div>
  );
};

export default HealthSettingsForm;
