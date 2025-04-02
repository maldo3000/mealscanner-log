
import React from "react";
import { Button } from "@/components/ui/button";

interface SubmitButtonProps {
  isCalculating: boolean;
}

const SubmitButton: React.FC<SubmitButtonProps> = ({ isCalculating }) => {
  return (
    <Button type="submit" disabled={isCalculating}>
      {isCalculating ? "Calculating..." : "Calculate Recommendations"}
    </Button>
  );
};

export default SubmitButton;
