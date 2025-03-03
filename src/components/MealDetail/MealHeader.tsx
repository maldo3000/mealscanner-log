
import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Edit, Trash2, X, Check } from "lucide-react";

interface MealHeaderProps {
  isEditing: boolean;
  onEditToggle: () => void;
  onSaveChanges: () => void;
  onDelete: () => void;
}

const MealHeader: React.FC<MealHeaderProps> = ({
  isEditing,
  onEditToggle,
  onSaveChanges,
  onDelete,
}) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <Link to="/journal" className="flex items-center text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4 mr-1" />
        <span>Back</span>
      </Link>
      
      <div className="flex space-x-2">
        {isEditing ? (
          <>
            <button
              onClick={onEditToggle}
              className="p-2 text-muted-foreground hover:text-foreground rounded-full"
            >
              <X className="h-5 w-5" />
            </button>
            <button
              onClick={onSaveChanges}
              className="p-2 text-primary hover:text-primary/80 rounded-full"
            >
              <Check className="h-5 w-5" />
            </button>
          </>
        ) : (
          <>
            <button
              onClick={onEditToggle}
              className="p-2 text-muted-foreground hover:text-foreground rounded-full"
            >
              <Edit className="h-5 w-5" />
            </button>
            <button
              onClick={onDelete}
              className="p-2 text-destructive hover:text-destructive/80 rounded-full"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default MealHeader;
