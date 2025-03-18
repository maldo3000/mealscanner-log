
import React from 'react';
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { UtensilsCrossed } from "lucide-react";

interface EmptyJournalProps {
  areFiltersActive: boolean;
}

export const EmptyJournal: React.FC<EmptyJournalProps> = ({ areFiltersActive }) => {
  return (
    <div className="glass-card rounded-2xl py-12 px-6 text-center mt-8">
      <div className="flex justify-center mb-4">
        <UtensilsCrossed className="h-16 w-16 text-muted-foreground opacity-50" />
      </div>
      
      <p className="text-lg font-medium mb-2">No meals found</p>
      
      <p className="text-sm text-muted-foreground mb-6">
        {areFiltersActive 
          ? "Try adjusting your filters or search term"
          : "Start capturing your meals to build your journal"}
      </p>
      
      {!areFiltersActive && (
        <Link to="/capture">
          <Button>
            Capture Your First Meal
          </Button>
        </Link>
      )}
    </div>
  );
};
