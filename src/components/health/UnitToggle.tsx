
import React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface UnitToggleProps {
  metricUnit: string;
  imperialUnit: string;
  value: "metric" | "imperial";
  onChange: (value: "metric" | "imperial") => void;
  className?: string;
}

const UnitToggle: React.FC<UnitToggleProps> = ({
  metricUnit,
  imperialUnit,
  value,
  onChange,
  className
}) => {
  return (
    <Tabs
      value={value}
      onValueChange={(val) => onChange(val as "metric" | "imperial")}
      className={className}
    >
      <TabsList className="grid grid-cols-2 w-full">
        <TabsTrigger value="metric">{metricUnit}</TabsTrigger>
        <TabsTrigger value="imperial">{imperialUnit}</TabsTrigger>
      </TabsList>
    </Tabs>
  );
};

export default UnitToggle;
