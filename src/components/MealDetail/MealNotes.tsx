
import React from "react";

interface MealNotesProps {
  notes: string;
  isEditing: boolean;
  onNotesChange: (notes: string) => void;
}

const MealNotes: React.FC<MealNotesProps> = ({ notes, isEditing, onNotesChange }) => {
  return (
    <div className="glass-card rounded-2xl p-6">
      <h2 className="text-lg font-medium mb-2">Notes</h2>
      
      {isEditing ? (
        <div>
          <textarea
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-border bg-background"
            rows={4}
            placeholder="Add notes about this meal..."
          />
        </div>
      ) : (
        <div>
          {notes ? (
            <p className="text-muted-foreground">{notes}</p>
          ) : (
            <p className="text-muted-foreground italic">No notes added</p>
          )}
        </div>
      )}
    </div>
  );
};

export default MealNotes;
